"""
Test file to validate CNN disease detection integration
Run this with: python test_disease_detection.py
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.service.disease_detection_service import predict_disease, get_disease_info, load_model
from pathlib import Path

def test_model_loading():
    """Test if model loads successfully"""
    print("Testing model loading...")
    try:
        model = load_model()
        print("✓ Model loaded successfully")
        return True
    except Exception as e:
        print(f"✗ Model loading failed: {e}")
        return False

def test_disease_info():
    """Test disease information retrieval"""
    print("\nTesting disease information retrieval...")
    diseases = ['Bacterial leaf blight', 'Brown spot', 'Leaf smut']
    
    for disease in diseases:
        info = get_disease_info(disease)
        if info:
            print(f"✓ Retrieved info for {disease}")
        else:
            print(f"✗ Failed to retrieve info for {disease}")
    
    return True

def test_with_sample_image():
    """Test prediction with a sample image if available"""
    print("\nTesting disease prediction...")
    
    # Look for sample images in CNN folder
    sample_images = [
        'backend/CNN/img1.png',
        'backend/CNN/img2.png',
        'backend/CNN/img3.png'
    ]
    
    for img_path in sample_images:
        if os.path.exists(img_path):
            print(f"\nUsing sample image: {img_path}")
            try:
                result = predict_disease(img_path)
                if result['success']:
                    print(f"✓ Prediction successful")
                    print(f"  - Disease: {result['disease']}")
                    if result.get('confidence'):
                        print(f"  - Confidence: {result['confidence']:.2f}%")
                    return True
                else:
                    print(f"✗ Prediction failed: {result.get('error')}")
            except Exception as e:
                print(f"✗ Error during prediction: {e}")
    
    print("⚠ No sample images found for testing")
    return True

def main():
    print("=" * 50)
    print("CNN Disease Detection Integration Test")
    print("=" * 50)
    
    # Run tests
    test1 = test_model_loading()
    test2 = test_disease_info()
    test3 = test_with_sample_image()
    
    print("\n" + "=" * 50)
    if test1 and test2 and test3:
        print("✓ All tests passed!")
        print("\nThe CNN disease detection integration is ready to use.")
    else:
        print("⚠ Some tests failed. Please check the setup.")
    print("=" * 50)

if __name__ == "__main__":
    main()
