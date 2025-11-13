from flask import Blueprint, request, jsonify
from app.service.prediction_service import get_prediction_results, get_user_predictions
from app import db
from app.models import Prediction, User
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

# Prediction endpoint
@api.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        result = get_prediction_results(data)
        return jsonify(result)

    except KeyError as e:
        return jsonify({"error": f"Missing input key: {e}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Save prediction to DB
@api.route('/api/save_prediction', methods=['POST'])
def save_prediction():
    data = request.get_json()
    if not data or 'user_id' not in data or 'prediction' not in data:
        return jsonify({"error": "Missing required data"}), 400

    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    pred = data['prediction']

    prediction = Prediction(
        user_id=user.id,
        temperature=pred.get('temperature'),
        soil_ph=pred.get('soil_ph'),
        rainfall=pred.get('rainfall'),
        field_area=pred.get('field_area'),
        humidity=pred.get('humidity'),

        predicted_yield_kg_ha=pred.get('PredictedYield_kg_ha'),
        plough_depth_cm=pred.get('PloughDepth_cm'),
        soil_adjustment_kg_lime=pred.get('SoilAdjustment_kgLime'),
        seed_amount_kg=pred.get('SeedAmount_kg'),
        plant_spacing_cm=pred.get('PlantSpacing_cm'),
        fertilizer_basal_urea_kg=pred.get('Fertilizer_Basal_Urea_kg'),
        fertilizer_basal_tsp_kg=pred.get('Fertilizer_Basal_TSP_kg'),
        fertilizer_basal_mop_kg=pred.get('Fertilizer_Basal_MOP_kg'),
        fertilizer_2nd_dose_urea_kg=pred.get('Fertilizer_2ndDose_Urea_kg'),
        fertilizer_2nd_dose_tsp_kg=pred.get('Fertilizer_2ndDose_TSP_kg'),
        fertilizer_2nd_dose_mop_kg=pred.get('Fertilizer_2ndDose_MOP_kg'),

        plough_method=pred.get('PloughMethod'),
        irrigation_advice=pred.get('IrrigationAdvice'),
        water_management_advice_stage4=pred.get('WaterManagementAdvice_Stage4'),
        tiller_increase_tip=pred.get('TillerIncreaseTip'),
        water_control_advice_stage5=pred.get('WaterControlAdvice_Stage5'),
        water_control_advice_stage6=pred.get('WaterControlAdvice_Stage6'),
        pesticide_suggestion=pred.get('PesticideSuggestion'),
        water_level_advice_stage7=pred.get('WaterLevelAdvice_Stage7'),
        harvesting_date=pred.get('HarvestingDate'),
        post_harvest_advice=pred.get('PostHarvestAdvice'),

        tsp_kg=pred.get('TSP_kg'),
        mop_kg=pred.get('MOP_kg'),
        urea_kg=pred.get('Urea_kg'),
    )

    db.session.add(prediction)
    db.session.commit()
    return jsonify({"message": "Prediction saved successfully"}), 201

@api.route('/api/predictions', methods=['GET'])
def get_predictions():
    """
    Fetch prediction history:
    - If JWT is provided, uses logged-in user ID
    - Otherwise, allows user_id from query param
    """
    try:
        user_id = None

        # 1️⃣ Try JWT first
        try:
            user_id = get_jwt_identity()
        except Exception:
            pass  # JWT not provided or invalid

        # 2️⃣ Fallback: query param
        if not user_id:
            user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({"error": "User not identified"}), 401

        # Convert safely to int
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({"error": f"Invalid user ID: {user_id}"}), 422

        # Fetch predictions
        predictions = get_user_predictions(user_id)

        # Safely handle null values
        safe_predictions = []
        for p in predictions:
            safe_predictions.append({
                "id": p.get("id"),
                "temperature": p.get("temperature"),
                "soil_ph": p.get("soil_ph"),
                "rainfall": p.get("rainfall"),
                "field_area": p.get("field_area"),
                "predicted_yield_kg_ha": p.get("predicted_yield_kg_ha"),
                "harvesting_date": p.get("harvesting_date") or "N/A",
                "created_at": p.get("created_at") or "N/A",
            })

        return jsonify(safe_predictions), 200

    except Exception as e:
        print("🔥 Error fetching predictions:", e)
        return jsonify({"error": "Failed to load predictions."}), 500