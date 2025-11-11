"""Comprehensive data-prep, EDA and model training script.

This script performs:
- Data cleaning and imputation
- Outlier detection (IQR capping)
- Exploratory Data Analysis outputs (saved to backend/model/eda)
- Train/validation/test split
- Feature scaling
- Hyperparameter tuning for numeric model (RandomizedSearchCV)
- Train multi-output text classifier
- Save artifacts (models, encoders, scaler)
- Clean up unwanted files from the model folder (only model folder)

Run with:
    python backend/model/train_models.py
"""
from pathlib import Path
import os
import shutil
import joblib
import pandas as pd
import numpy as np
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    PLOTTING_AVAILABLE = True
except Exception:
    PLOTTING_AVAILABLE = False
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import mean_squared_error, accuracy_score


def iqr_cap(df, cols):
    """Cap outliers using IQR rule per column (inplace)"""
    for c in cols:
        q1 = df[c].quantile(0.25)
        q3 = df[c].quantile(0.75)
        iqr = q3 - q1
        low = q1 - 1.5 * iqr
        high = q3 + 1.5 * iqr
        df[c] = df[c].clip(lower=low, upper=high)


def make_eda(df, feature_cols, out_folder: Path):
    out_folder.mkdir(parents=True, exist_ok=True)
    # summary
    desc = df[feature_cols].describe()
    desc.to_csv(out_folder / 'feature_summary.csv')

    # histograms
    for c in feature_cols:
        plt.figure()
        sns.histplot(df[c].dropna(), kde=True)
        plt.title(f'Distribution: {c}')
        plt.savefig(out_folder / f'{c}_hist.png')
        plt.close()

    # correlation heatmap
    plt.figure(figsize=(8, 6))
    sns.heatmap(df[feature_cols].corr(), annot=True, fmt='.2f', cmap='vlag')
    plt.title('Feature Correlation')
    plt.savefig(out_folder / 'correlation.png')
    plt.close()


def main():
    repo_root = Path(__file__).resolve().parents[2]
    data_path = repo_root / 'data' / 'SriLanka_Paddy_ML_Dataset.csv'
    model_folder = repo_root / 'backend' / 'model'
    eda_folder = model_folder / 'eda'
    model_folder.mkdir(parents=True, exist_ok=True)

    print(f"Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print('Initial shape:', df.shape)

    # Define columns
    feature_cols = ["Temperature_C", "Soil_pH", "Rainfall_mm", "FieldArea_ha", "Humidity_%"]
    numeric_targets = [
        "PredictedYield_kg_ha",
        "PloughDepth_cm",
        "SoilAdjustment_kgLime",
        "SeedAmount_kg",
        "PlantSpacing_cm",
        "Fertilizer_Basal_Urea_kg",
        "Fertilizer_Basal_TSP_kg",
        "Fertilizer_Basal_MOP_kg",
        "Fertilizer_2ndDose_Urea_kg",
        "Fertilizer_2ndDose_TSP_kg",
        "Fertilizer_2ndDose_MOP_kg",
    ]
    text_targets = [
        "PloughMethod",
        "IrrigationAdvice",
        "WaterManagementAdvice_Stage4",
        "TillerIncreaseTip",
        "WaterControlAdvice_Stage5",
        "WaterControlAdvice_Stage6",
        "PesticideSuggestion",
        "PostHarvestAdvice",
    ]

    # === Data cleaning & preprocessing ===
    # Drop rows missing all required columns
    needed_cols = feature_cols + numeric_targets + text_targets
    df = df.dropna(subset=needed_cols)
    print('After dropping NA for required cols:', df.shape)

    # Convert numeric features
    for c in feature_cols + numeric_targets:
        df[c] = pd.to_numeric(df[c], errors='coerce')

    # Simple imputation for features: median
    df[feature_cols] = df[feature_cols].fillna(df[feature_cols].median())

    # Outlier capping
    iqr_cap(df, feature_cols)

    # EDA: save distributions and correlation (skip if plotting libs missing)
    if PLOTTING_AVAILABLE:
        print('Creating EDA artifacts...')
        make_eda(df, feature_cols, eda_folder)
    else:
        print('matplotlib/seaborn not available — skipping EDA plots')

    # Prepare X and y
    X = df[feature_cols].copy()
    y_num = df[numeric_targets].copy().astype(float)
    y_txt = df[text_targets].copy().astype(str)

    # Encode text targets
    label_encoders = {}
    y_txt_enc = pd.DataFrame(index=y_txt.index)
    for col in text_targets:
        le = LabelEncoder()
        y_txt_enc[col] = le.fit_transform(y_txt[col])
        label_encoders[col] = le

    # Split: train 70%, val 15%, test 15%
    X_tmp, X_test, y_num_tmp, y_num_test, y_txt_tmp, y_txt_test = train_test_split(
        X, y_num, y_txt_enc, test_size=0.15, random_state=42
    )
    val_size = 0.176470588  # 0.15 / 0.85 to make val 15% of original
    X_train, X_val, y_num_train, y_num_val, y_txt_train, y_txt_val = train_test_split(
        X_tmp, y_num_tmp, y_txt_tmp, test_size=val_size, random_state=42
    )

    print('Train/Val/Test shapes:', X_train.shape, X_val.shape, X_test.shape)

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    # === Model Training & Hyperparameter tuning (numeric) ===
    print('Tuning numeric RandomForestRegressor (RandomizedSearchCV)...')
    rf = RandomForestRegressor(random_state=42)
    param_dist = {
        'n_estimators': [100, 200, 300],
        'max_depth': [None, 10, 20, 30],
        'max_features': ['auto', 'sqrt', 0.5]
    }
    rnd = RandomizedSearchCV(rf, param_distributions=param_dist, n_iter=6, cv=3,
                             scoring='neg_mean_squared_error', n_jobs=-1, random_state=42)
    rnd.fit(X_train_scaled, y_num_train)
    print('Best params (numeric):', rnd.best_params_)
    best_rf = rnd.best_estimator_

    # Evaluate on validation and test
    y_val_pred = best_rf.predict(X_val_scaled)
    val_mse = mean_squared_error(y_num_val, y_val_pred)
    print(f'Numeric model validation MSE: {val_mse:.4f}')
    y_test_pred = best_rf.predict(X_test_scaled)
    test_mse = mean_squared_error(y_num_test, y_test_pred)
    print(f'Numeric model test MSE: {test_mse:.4f}')

    # === Text model training (multi-output classification) ===
    print('Training MultiOutputClassifier(RandomForestClassifier) for text targets...')
    rf_clf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    multi_clf = MultiOutputClassifier(rf_clf)
    multi_clf.fit(X_train_scaled, y_txt_train)

    # Evaluate text model on validation and test
    y_val_txt_pred = multi_clf.predict(X_val_scaled)
    accs_val = []
    for i, col in enumerate(text_targets):
        acc = accuracy_score(y_txt_val[col], y_val_txt_pred[:, i])
        accs_val.append(acc)
        print(f'Val accuracy {col}: {acc:.3f}')
    print('Average val accuracy (text):', np.mean(accs_val))

    y_test_txt_pred = multi_clf.predict(X_test_scaled)
    accs_test = []
    for i, col in enumerate(text_targets):
        acc = accuracy_score(y_txt_test[col], y_test_txt_pred[:, i])
        accs_test.append(acc)
    print('Average test accuracy (text):', np.mean(accs_test))

    # === Save artifacts ===
    numeric_path = model_folder / 'paddy_model_numeric.pkl'
    text_path = model_folder / 'paddy_model_text.pkl'
    encoders_path = model_folder / 'label_encoders.pkl'
    scaler_path = model_folder / 'scaler.pkl'

    joblib.dump(best_rf, numeric_path)
    joblib.dump(multi_clf, text_path)
    joblib.dump(label_encoders, encoders_path)
    joblib.dump(scaler, scaler_path)

    print('Saved artifacts:')
    for p in [numeric_path, text_path, encoders_path, scaler_path]:
        print(' -', p)

    # === Cleanup model folder: remove files not in allowed set ===
    allowed = {numeric_path.name, text_path.name, encoders_path.name, scaler_path.name,
               Path(__file__).name, 'model_train.ipynb', 'eda'}
    for item in model_folder.iterdir():
        if item.name not in allowed:
            try:
                if item.is_file():
                    item.unlink()
                    print(f'Removed unwanted file: {item.name}')
                elif item.is_dir() and item.name != 'eda':
                    shutil.rmtree(item)
                    print(f'Removed unwanted folder: {item.name}')
            except Exception as e:
                print(f'Failed to remove {item}: {e}')

    print('\nTraining pipeline complete.')


if __name__ == '__main__':
    main()
