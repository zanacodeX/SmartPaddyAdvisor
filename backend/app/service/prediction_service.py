import pandas as pd
import joblib
import os
from app.models import Prediction
from app import db

# -----------------------------
# Load trained models once
# -----------------------------
MODEL_FOLDER = os.path.join(os.path.dirname(__file__), "..","..", "model")

model_numeric = joblib.load(os.path.join(MODEL_FOLDER, "paddy_model_numeric.pkl"))
model_text = joblib.load(os.path.join(MODEL_FOLDER, "paddy_model_text.pkl"))
label_encoders = joblib.load(os.path.join(MODEL_FOLDER, "label_encoders.pkl"))
scaler = joblib.load(os.path.join(MODEL_FOLDER, "scaler.pkl"))

# -----------------------------
# Fertilizer calculation
# -----------------------------
def calculate_fertilizer(ph, area_ha):
    tsp_rate = 50 if ph < 6.5 else 40
    mop_rate = 25
    urea_rate = 60
    return {
        "TSP_kg": round(tsp_rate * area_ha, 2),
        "MOP_kg": round(mop_rate * area_ha, 2),
        "Urea_kg": round(urea_rate * area_ha, 2)
    }

# -----------------------------
# Main prediction function
# -----------------------------
def get_prediction_results(data):
    """
    Input: dictionary from frontend
    Output: numeric + text + fertilizer predictions
    This function validates inputs, scales them, and handles varying model output shapes
    to avoid runtime errors that lead to 500 responses.
    """
    required_keys = ["temperature", "soil_ph", "rainfall", "field_area", "humidity"]
    for k in required_keys:
        if k not in data:
            raise KeyError(f"Missing input key: {k}")

    try:
        input_df = pd.DataFrame([{
            "Temperature_C": float(data["temperature"]),
            "Soil_pH": float(data["soil_ph"]),
            "Rainfall_mm": float(data["rainfall"]),
            "FieldArea_ha": float(data["field_area"]),
            "Humidity_%": float(data["humidity"])
        }])
    except Exception as e:
        raise ValueError(f"Invalid input values: {e}")

    # Scale input features (models were trained on scaled data)
    try:
        input_scaled = scaler.transform(input_df)
    except Exception as e:
        raise RuntimeError(f"Failed to scale input features: {e}")

    # Numeric predictions — handle different output shapes robustly
    try:
        numeric_pred_raw = model_numeric.predict(input_scaled)
    except Exception as e:
        raise RuntimeError(f"Numeric model prediction failed: {e}")

    # Ensure 2D array (n_samples, n_targets)
    if hasattr(numeric_pred_raw, 'ndim') and numeric_pred_raw.ndim == 1:
        numeric_pred = numeric_pred_raw.reshape(1, -1)
    else:
        numeric_pred = numeric_pred_raw

    pred_row = numeric_pred[0]

    expected_numeric_cols = [
        "PredictedYield_kg_ha", "PloughDepth_cm", "SoilAdjustment_kgLime",
        "SeedAmount_kg", "PlantSpacing_cm", "Fertilizer_Basal_Urea_kg",
        "Fertilizer_Basal_TSP_kg", "Fertilizer_Basal_MOP_kg",
        "Fertilizer_2ndDose_Urea_kg", "Fertilizer_2ndDose_TSP_kg",
        "Fertilizer_2ndDose_MOP_kg"
    ]

    # If model returns more outputs than expected, create placeholder names
    if len(pred_row) > len(expected_numeric_cols):
        extra = [f"extra_numeric_{i+1}" for i in range(len(pred_row) - len(expected_numeric_cols))]
        numeric_cols = expected_numeric_cols + extra
    else:
        numeric_cols = expected_numeric_cols[:len(pred_row)]

    numeric_result = dict(zip(numeric_cols, [round(float(x), 2) for x in pred_row]))

    # Text predictions
    try:
        text_pred_encoded = model_text.predict(input_scaled)
    except Exception as e:
        raise RuntimeError(f"Text model prediction failed: {e}")

    # Normalize shape
    if hasattr(text_pred_encoded, 'ndim') and text_pred_encoded.ndim == 1:
        text_pred = text_pred_encoded.reshape(1, -1)
    else:
        text_pred = text_pred_encoded

    text_result = {}
    try:
        for i, col in enumerate(label_encoders.keys()):
            # guard against index errors
            if i >= text_pred.shape[1]:
                text_result[col] = None
            else:
                encoded = int(text_pred[0][i])
                text_result[col] = label_encoders[col].inverse_transform([encoded])[0]
    except Exception as e:
        raise RuntimeError(f"Decoding text predictions failed: {e}")

    # Fertilizer calculation
    fertilizer = calculate_fertilizer(float(data["soil_ph"]), float(data["field_area"]))

    return {
        "numeric": numeric_result,
        "text": text_result,
        "fertilizer": fertilizer
    }

def get_user_predictions(user_id):
    """Return all predictions for a given user_id."""
    try:
        # Ensure user_id is int (JWT sometimes returns string)
        user_id = int(user_id)

        predictions = (
            Prediction.query
            .filter_by(user_id=user_id)
            .order_by(Prediction.created_at.desc())
            .all()
        )

        return [p.to_dict() for p in predictions]

    except Exception as e:
        db.session.rollback()
        print("🔥 Error in get_user_predictions:", e)
        raise e