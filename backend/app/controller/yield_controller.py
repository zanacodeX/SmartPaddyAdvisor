from flask import Blueprint, request, jsonify
from app.service.prediction_service import get_prediction_results

api = Blueprint('api', __name__)

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
