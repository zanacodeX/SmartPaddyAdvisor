"""
Comprehensive debugging script for 422 error
Tests each step of the disease detection API call
"""
import requests
import json
from pathlib import Path
import sys

BASE_URL = 'http://localhost:5000'

def test_health():
    """Test if backend is running"""
    print("\n" + "=" * 60)
    print("1️⃣ CHECKING BACKEND HEALTH")
    print("=" * 60)
    try:
        response = requests.get(f'{BASE_URL}/api/health', timeout=5)
        print(f"✅ Backend is running!")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Backend is not responding!")
        print(f"Error: {e}")
        print(f"\n⚠️  Make sure backend is running:")
        print(f"   cd backend && python run.py")
        return False

def test_login():
    """Test login and get JWT token"""
    print("\n" + "=" * 60)
    print("2️⃣ TESTING LOGIN & JWT TOKEN")
    print("=" * 60)
    
    login_data = {
        'email': 'admin@example.com',
        'password': 'Password123'
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/auth/login',
            json=login_data,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            try:
                token = response.json().get('access_token')
                if token:
                    print(f"✅ Got JWT token: {token[:30]}...")
                    return token
                else:
                    print(f"❌ No access_token in response")
                    print(f"Response keys: {response.json().keys()}")
                    return None
            except:
                print(f"❌ Could not parse JSON response")
                return None
        else:
            print(f"❌ Login failed with status {response.status_code}")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Raw response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login request failed: {e}")
        return None

def find_test_image():
    """Find a test image"""
    print("\n" + "=" * 60)
    print("3️⃣ FINDING TEST IMAGE")
    print("=" * 60)
    
    test_images = [
        'backend/CNN/img1.png',
        'backend/CNN/img2.png', 
        'backend/CNN/img3.png'
    ]
    
    for img_path in test_images:
        if Path(img_path).exists():
            print(f"✅ Found: {img_path}")
            return img_path
    
    print(f"❌ No test images found")
    return None

def test_disease_detection(token, image_path):
    """Test disease detection API"""
    print("\n" + "=" * 60)
    print("4️⃣ TESTING DISEASE DETECTION API")
    print("=" * 60)
    
    if not token:
        print("❌ No JWT token available - skipping test")
        return False
    
    if not image_path:
        print("❌ No image available - skipping test")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': (Path(image_path).name, f, 'image/png')}
            headers = {
                'Authorization': f'Bearer {token}'
            }
            
            print(f"Sending request:")
            print(f"  URL: POST {BASE_URL}/api/disease-detection")
            print(f"  File: {image_path}")
            print(f"  Token: {token[:30]}...")
            print()
            
            response = requests.post(
                f'{BASE_URL}/api/disease-detection',
                files=files,
                headers=headers,
                timeout=30
            )
            
            print(f"Response Status: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print(f"Response Body: {response.text[:1000]}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success'):
                        print(f"\n✅ SUCCESS!")
                        print(f"Disease: {data.get('disease')}")
                        print(f"Confidence: {data.get('confidence')}%")
                        return True
                    else:
                        print(f"\n⚠️ Prediction failed: {data.get('error')}")
                        return False
                except:
                    print(f"\n⚠️ Could not parse response")
                    return False
            elif response.status_code == 422:
                print(f"\n❌ 422 ERROR DETECTED!")
                print(f"This means the request data was rejected")
                print(f"Possible causes:")
                print(f"  1. JWT token is invalid or expired")
                print(f"  2. File upload is not in correct format")
                print(f"  3. Content-Type header issue")
                try:
                    print(f"Server response: {response.json()}")
                except:
                    print(f"Raw response: {response.text}")
                return False
            else:
                print(f"\n❌ Unexpected status code: {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Raw: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Request failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║     Disease Detection API - 422 Error Debugging             ║")
    print("╚════════════════════════════════════════════════════════════╝")
    
    # Step 1: Check backend health
    if not test_health():
        print("\n" + "=" * 60)
        print("❌ BACKEND NOT RESPONDING - STOPPING TEST")
        print("=" * 60)
        return
    
    # Step 2: Test login
    token = test_login()
    if not token:
        print("\n" + "=" * 60)
        print("❌ LOGIN FAILED - STOPPING TEST")
        print("=" * 60)
        return
    
    # Step 3: Find test image
    image_path = find_test_image()
    if not image_path:
        print("\n" + "=" * 60)
        print("⚠️ NO TEST IMAGE - CANNOT TEST API")
        print("=" * 60)
        return
    
    # Step 4: Test API
    test_disease_detection(token, image_path)
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 SUMMARY")
    print("=" * 60)
    print("""
If you got a 422 error, this usually means:
1. ❌ Check if backend.log has error messages
2. ❌ Try logging in again (token may be expired)
3. ❌ Check if the image file format is correct (PNG/JPG)
4. ❌ Check browser console for error details (F12)
5. ❌ Try restarting backend with: cd backend && python run.py

If tests pass but frontend still shows 422:
1. ✅ Check browser Network tab (F12 > Network)
2. ✅ See if the request is being sent correctly
3. ✅ Check the actual response body in Network tab
4. ✅ Take a screenshot and compare with this test output
""")
    print("=" * 60)

if __name__ == '__main__':
    main()
