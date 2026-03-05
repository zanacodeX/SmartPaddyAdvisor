from flask import Blueprint, request, jsonify
from ..service.disease_detection_service import predict_disease, get_disease_info
from flask_jwt_extended import jwt_required
import os
import tempfile
import logging

# Setup logging
logger = logging.getLogger(__name__)

api = Blueprint('disease_api', __name__)

@api.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint (no auth required)"""
    return jsonify({"status": "DiseaseAPI is running"}), 200

@api.route("/disease-detection-test", methods=["POST"])
def detect_disease_test():
    """Test endpoint WITHOUT JWT auth - for debugging"""
    try:
        logger.info("=== TEST Disease Detection Request Started (No Auth) ===")
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Request files: {request.files}")
        logger.info(f"Request content type: {request.content_type}")
        
        # Check if image is in request files
        image_data = None
        
        if 'image' not in request.files:
            logger.error("No 'image' field in request.files")
            logger.error(f"Available fields: {list(request.files.keys())}")
            return jsonify({"error": "No image file provided", "success": False}), 400
        
        file = request.files['image']
        logger.info(f"Received file: {file.filename}")
        
        if not file or not file.filename:
            logger.error("File is empty or has no filename")
            return jsonify({"error": "Invalid file", "success": False}), 400
        
        # Save to temporary directory (Windows-compatible)
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file.filename)
        logger.info(f"Saving to temp path: {temp_path}")
        file.save(temp_path)
        image_data = temp_path
        
        if not image_data:
            logger.error("No image data extracted")
            return jsonify({"error": "No image data", "success": False}), 400
        
        logger.info(f"Starting prediction with image: {image_data}")
        # Predict disease
        result = predict_disease(image_data)
        
        # Clean up temp file
        try:
            os.remove(temp_path)
            logger.info(f"Cleaned up temp file: {temp_path}")
        except Exception as e:
            logger.warning(f"Could not delete temp file: {e}")
        
        if result['success']:
            logger.info(f"Prediction successful: {result['disease']}")
            # Get additional disease information
            disease_info = get_disease_info(result['disease'])
            result['info'] = disease_info
        else:
            logger.error(f"Prediction failed: {result.get('error')}")
        
        logger.info("=== TEST Disease Detection Request Completed ===")
        return jsonify(result)
    
    except Exception as e:
        logger.exception(f"Exception in detect_disease_test: {str(e)}")
        return jsonify({"error": str(e), "success": False}), 500

@api.route("/disease-detection", methods=["POST"])
@jwt_required()
def detect_disease():
    """
    Endpoint to detect rice leaf disease from an image
    Expected: file upload via multipart/form-data
    """
    try:
        logger.info("=== Disease Detection Request Started ===")
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Request files: {request.files}")
        logger.info(f"Request content type: {request.content_type}")
        
        # Check if image is in request files
        image_data = None
        
        if 'image' not in request.files:
            logger.error("No 'image' field in request.files")
            logger.error(f"Available fields: {list(request.files.keys())}")
            return jsonify({"error": "No image file provided", "success": False}), 400
        
        file = request.files['image']
        logger.info(f"Received file: {file.filename}")
        
        if not file or not file.filename:
            logger.error("File is empty or has no filename")
            return jsonify({"error": "Invalid file", "success": False}), 400
        
        # Save to temporary directory (Windows-compatible)
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file.filename)
        logger.info(f"Saving to temp path: {temp_path}")
        file.save(temp_path)
        image_data = temp_path
        
        if not image_data:
            logger.error("No image data extracted")
            return jsonify({"error": "No image data", "success": False}), 400
        
        logger.info(f"Starting prediction with image: {image_data}")
        # Predict disease
        result = predict_disease(image_data)
        
        # Clean up temp file
        try:
            os.remove(temp_path)
            logger.info(f"Cleaned up temp file: {temp_path}")
        except Exception as e:
            logger.warning(f"Could not delete temp file: {e}")
        
        if result['success']:
            logger.info(f"Prediction successful: {result['disease']}")
            # Get additional disease information
            disease_info = get_disease_info(result['disease'])
            result['info'] = disease_info
        else:
            logger.error(f"Prediction failed: {result.get('error')}")
        
        logger.info("=== Disease Detection Request Completed ===")
        return jsonify(result)
    
    except Exception as e:
        logger.exception(f"Exception in detect_disease: {str(e)}")
        return jsonify({"error": str(e), "success": False}), 500

@api.route("/disease-info/<disease_name>", methods=["GET"])
@jwt_required()
def get_disease_details(disease_name):
    """Get detailed information about a disease"""
    try:
        info = get_disease_info(disease_name)
        if info:
            return jsonify({"disease": disease_name, "info": info})
        else:
            return jsonify({"error": "Disease not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
