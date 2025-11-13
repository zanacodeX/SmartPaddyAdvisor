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
    """
    input_df = pd.DataFrame([{
        "Temperature_C": float(data["temperature"]),
        "Soil_pH": float(data["soil_ph"]),
        "Rainfall_mm": float(data["rainfall"]),
        "FieldArea_ha": float(data["field_area"]),
        "Humidity_%": float(data["humidity"])
    }])

    # Scale input features (models were trained on scaled data)
    input_scaled = scaler.transform(input_df)

    # Numeric predictions
    numeric_pred = model_numeric.predict(input_scaled)[0]
    numeric_cols = [
        "PredictedYield_kg_ha", "PloughDepth_cm", "SoilAdjustment_kgLime",
        "SeedAmount_kg", "PlantSpacing_cm", "Fertilizer_Basal_Urea_kg",
        "Fertilizer_Basal_TSP_kg", "Fertilizer_Basal_MOP_kg",
        "Fertilizer_2ndDose_Urea_kg", "Fertilizer_2ndDose_TSP_kg",
        "Fertilizer_2ndDose_MOP_kg", "FinalMoisture_%"
    ]
    numeric_result = dict(zip(numeric_cols, [round(x, 2) for x in numeric_pred]))

    # Text predictions
    text_pred_encoded = model_text.predict(input_scaled)
    text_result = {}
    for i, col in enumerate(label_encoders.keys()):
        text_result[col] = label_encoders[col].inverse_transform([text_pred_encoded[0][i]])[0]

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