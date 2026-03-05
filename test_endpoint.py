"""
Simple test to verify disease detection endpoint
"""
import requests
import json
from pathlib import Path

# First, you need to get a valid JWT token
# This is a simple test - in production you'd login first

BASE_URL = 'http://localhost:5000'

def test_disease_detection_with_image():
    """Test disease detection with an actual image file"""
    
    # Find a test image
    test_images = [
        'backend/CNN/img1.png',
        'backend/CNN/img2.png', 
        'backend/CNN/img3.png'
    ]
    
    image_path = None
    for img in test_images:
        if Path(img).exists():
            image_path = img
            break
    
    if not image_path:
        print("❌ No test images found. Make sure images exist in backend/CNN/")
        return False
    
    print(f"\n🔍 Testing with image: {image_path}")
    
    # For testing, you'll need to:
    # 1. First login to get a token using auth endpoint
    # 2. Then use that token for the disease detection
    
    # Example login (adjust credentials as needed)
    login_data = {
        'email': 'admin@example.com',
        'password': 'Password123'
    }
    
    print("\n1️⃣ Attempting to get JWT token...")
    try:
        # Try to get token from auth endpoint
        auth_response = requests.post(
            f'{BASE_URL}/auth/login',
            json=login_data
        )
        
        if auth_response.status_code == 200:
            token = auth_response.json().get('access_token')
            print(f"✅ Got token: {token[:20]}...")
            
            # Now test disease detection
            print("\n2️⃣ Testing disease detection endpoint...")
            
            with open(image_path, 'rb') as img_file:
                files = {'image': img_file}
                headers = {'Authorization': f'Bearer {token}'}
                
                response = requests.post(
                    f'{BASE_URL}/api/disease-detection',
                    files=files,
                    headers=headers
                )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            
            if response.status_code == 200 and response.json().get('success'):
                print("✅ Disease detection working!")
                return True
            else:
                print("❌ Disease detection failed")
                return False
                
        else:
            print(f"❌ Login failed: {auth_response.status_code}")
            print(f"Response: {auth_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("Disease Detection Endpoint Test")
    print("=" * 60)
    print("\n⚠️  Make sure backend is running on http://localhost:5000")
    print("   Run: cd backend && python run.py")
    
    test_disease_detection_with_image()
