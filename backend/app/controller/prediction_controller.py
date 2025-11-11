from flask import Blueprint, request, jsonify
from ..service.prediction_service import predict_paddy

api = Blueprint('api', __name__)

@api.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        result = predict_paddy(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
