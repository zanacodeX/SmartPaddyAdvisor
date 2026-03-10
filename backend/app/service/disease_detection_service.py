import pickle
import numpy as np
from skimage.io import imread
from skimage.transform import resize
import os
from PIL import Image
from io import BytesIO
import base64

# Path to the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../CNN/model/Rice_Leaves_Disease_Detection.pkl')

# Disease labels
DISEASE_LABELS = ['Bacterial leaf blight', 'Brown spot', 'Leaf smut']

def load_model():
    """Load the trained CNN model"""
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        return model
    except FileNotFoundError:
        raise Exception(f"Model file not found at {MODEL_PATH}")

def preprocess_image(image_data):
    """
    Preprocess image for the model
    image_data can be file path or base64 string
    Model expects: 104x104x3 (RGB) images flattened to 32448 features
    """
    try:
        dimension = (104, 104)
        
        # If it's base64 encoded
        if isinstance(image_data, str) and image_data.startswith('data:image'):
            # Extract base64 string from data URL
            base64_str = image_data.split(',')[1]
            image_bytes = base64.b64decode(base64_str)
            img = Image.open(BytesIO(image_bytes))
            img_array = np.array(img)
        else:
            # It's a file path
            if not os.path.exists(image_data):
                raise FileNotFoundError(f"Image file not found: {image_data}")
            img_array = imread(image_data)
        
        # Convert image to RGB if needed (remove alpha channel if present)
        if len(img_array.shape) == 3:
            if img_array.shape[2] == 4:  # RGBA - remove alpha channel
                img_array = img_array[:, :, :3]
            elif img_array.shape[2] > 3:  # More than 3 channels, take first 3
                img_array = img_array[:, :, :3]
            # If it's RGB (3 channels), keep as is
        elif len(img_array.shape) == 2:
            # Grayscale image - convert to RGB by replicating
            img_array = np.stack([img_array] * 3, axis=-1)
        
        # Ensure we have 3 channels (RGB)
        assert len(img_array.shape) == 3 and img_array.shape[2] == 3, \
            f"Image shape must be (height, width, 3), got {img_array.shape}"
        
        # Resize image to exactly 104x104 (keeping all 3 channels)
        img_resized = resize(img_array, dimension, anti_aliasing=True, mode='reflect')
        
        # Flatten all channels: 104*104*3 = 32448 features
        flat_data = img_resized.flatten().reshape(1, -1)
        
        # Verify the shape is correct: 104*104*3 = 32448
        expected_features = 104 * 104 * 3
        actual_features = flat_data.shape[1]
        assert actual_features == expected_features, \
            f"Feature count mismatch: expected {expected_features}, got {actual_features}"
        
        return flat_data
    except Exception as e:
        raise Exception(f"Error preprocessing image: {str(e)}")

def predict_disease(image_data):
    """
    Predict disease from image data
    Returns disease prediction and confidence
    """
    try:
        # Load model
        model = load_model()
        
        # Preprocess image
        processed_image = preprocess_image(image_data)
        
        # Make prediction
        prediction = model.predict(processed_image)
        
        # Get the predicted class (convert array to int)
        predicted_class = int(prediction[0])
        
        # Validate predicted class
        if predicted_class < 0 or predicted_class >= len(DISEASE_LABELS):
            raise Exception(f"Invalid prediction class: {predicted_class}")
        
        predicted_disease = DISEASE_LABELS[predicted_class]
        
        # Try to get prediction probability if available
        confidence = None
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(processed_image)
            confidence = float(proba[0][predicted_class]) * 100
        
        return {
            'disease': predicted_disease,
            'class': predicted_class,
            'confidence': confidence,
            'success': True
        }
    except Exception as e:
        return {
            'disease': None,
            'error': str(e),
            'success': False
        }

def get_disease_info(disease_name):
    """Get information about rice leaf disease"""
    disease_info = {
        'Bacterial leaf blight': {
            'description': 'Bacterial leaf blight is a serious disease caused by Xanthomonas oryzae pv. oryzae.',
            'symptoms': ['Water-soaked lesions on leaves', 'Yellow halo around lesions', 'Wilting of leaves'],
            'treatment': ['Use resistant varieties', 'Remove infected leaves', 'Apply copper-based fungicides'],
            'prevention': ['Proper drainage', 'Avoid nitrogen overdose', 'Use disease-free seeds']
        },
        'Brown spot': {
            'description': 'Brown spot is caused by fungal pathogens, mainly Bipolaris oryzae.',
            'symptoms': ['Small brown spots on leaves', 'Spots enlarge with gray center', 'Circular shape'],
            'treatment': ['Apply fungicides', 'Remove infected leaves', 'Improve ventilation'],
            'prevention': ['Clean field sanitation', 'Avoid waterlogging', 'Use resistant varieties']
        },
        'Leaf smut': {
            'description': 'Leaf smut is caused by Entyloma oryzae and affects leaf tissue.',
            'symptoms': ['Small dark spots on leaves', 'Spots have white borders', 'Premature leaf death'],
            'treatment': ['Apply systemic fungicides', 'Remove infected foliage', 'Improve air circulation'],
            'prevention': ['Crop rotation', 'Use clean seeds', 'Field sanitation']
        }
    }
    
    return disease_info.get(disease_name, {})
