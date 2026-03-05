# 🔧 Detailed Troubleshooting for 422 Error

## Step 1: Run the Debug Script

This script will test each part of the API step by step:

```bash
python debug_422.py
```

It will:
1. ✅ Check if backend is running
2. ✅ Test login and get JWT token
3. ✅ Find test images
4. ✅ Test the disease detection API
5. ✅ Show detailed error messages

## Step 2: Check Browser Network Tab

1. **Open your browser** (Chrome/Firefox)
2. **Press F12** to open Developer Tools
3. Go to **Network** tab
4. **Go to Disease Detection tab** on your app
5. **Upload an image** and click "Detect Disease"
6. **Look for the POST request** to `/api/disease-detection`
7. **Click on it** and check:
   - **Headers** - Should see `Authorization: Bearer <token>`
   - **Request** - Should show the image file
   - **Response** - Should show the 422 error details

## Step 3: Check Backend Logs

When you run `python run.py`, you should see detailed logs like:

```
=== Disease Detection Request Started ===
Request headers: {...}
Request files: {'image': <FileStorage...>}
Request content type: multipart/form-data; boundary=...
Received file: img1.png
Saving to temp path: C:\Users\...\AppData\Local\Temp\img1.png
Starting prediction with image: ...
Prediction successful: Bacterial leaf blight
=== Disease Detection Request Completed ===
```

If you see **errors** in the logs, copy them and use them to diagnose.

## Step 4: Common 422 Error Causes

### Cause 1: JWT Token is Invalid/Expired
```
How to check:
1. Open browser DevTools (F12)
2. Go to Application > LocalStorage
3. Check if 'token' key exists
4. If not, logout and login again

Solution:
- Logout from User Portal
- Login again
- Try Disease Detection again
```

### Cause 2: Image File Not Sent Correctly
```
How to check in DevTools Network tab:
1. Find the POST request to /api/disease-detection
2. Click "Request" (or "Payload")
3. Should see: "image: (binary)"
4. Should see the filename

If it says "No fields" or image is missing:
- The file might not be selected properly
- Try selecting image again
- Try a different image file
```

### Cause 3: Backend Not Restarted After Code Changes
```
Solution:
1. Go to terminal running backend
2. Press Ctrl+C (stop the server)
3. Run: cd backend && python run.py
4. Wait for startup message
5. Try again in frontend
```

### Cause 4: Request Body Too Large
Flask has a default request limit. Check by looking at file size:
```
Solution:
1. Try with a smaller image file
2. Or increase Flask's MAX_CONTENT_LENGTH
```

### Cause 5: Invalid Content-Type Header
```
How to check in DevTools:
1. Go to Network tab
2. Find POST request
3. Check "Request headers"
4. Should see: Content-Type: multipart/form-data; boundary=...

If missing or wrong:
- Try restarting browser
- Clear cache (Ctrl+Shift+Delete)
- Try incognito/private window
```

## Step 5: Detailed Testing Checklist

### Check Backend Setup
```bash
# Terminal 1: Check if backend runs
cd backend
python run.py

# Should show:
# ============================================================
# 🚀 Smart Paddy Advisor Backend Starting...
# ============================================================
# ✅ Disease Detection API available at: http://localhost:5000/api/health
```

### Check Frontend Connection
```bash
# Terminal 2: Check if frontend can reach backend
curl http://localhost:5000/api/health

# Should show:
# {"status":"DiseaseAPI is running"}
```

### Test Login
```bash
# Terminal 3: Test login endpoint
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123"}'

# Should return:
# {"access_token":"...","user":{"email":"admin@example.com",...}}
```

### Test with Debug Script
```bash
# Terminal 3: Run comprehensive test
python debug_422.py

# This will show exactly what's happening at each step
```

## Step 6: Review Actual Error Message

When you see the 422 error in browser, look for:

**In Browser Console (F12 > Console):**
```javascript
// You might see something like:
Error during prediction: Validation error: ...
// or
422 Unprocessable Entity: ...
```

**In Network Tab Response:**
```json
{
  "error": "No image file provided",
  "success": false
}
```

Copy this error message - it tells exactly what's wrong!

## Step 7: If Still Stuck...

Collect this information:

1. **Output from debug_422.py:**
   ```bash
   python debug_422.py > debug_output.txt 2>&1
   ```

2. **Backend logs:**
   - Screenshot of terminal where you ran `python run.py`

3. **Browser DevTools:**
   - F12 > Network > POST request > Response tab
   - Screenshot of the response

4. **Check files exist:**
   ```bash
   # Check model file exists:
   dir backend\CNN\model
   # Should show: Rice_Leaves_Disease_Detection.pkl
   
   # Check test images exist:
   dir backend\CNN\*.png
   # Should show: img1.png, img2.png, img3.png
   ```

5. **Check requirements installed:**
   ```bash
   pip list | grep -E "scikit-image|Pillow|scikit-learn"
   # All three should be listed
   ```

## Quick Fixes to Try

### Fix 1: Restart Everything
```bash
# Terminal 1 - Stop backend (Ctrl+C)
# Then restart:
cd backend
pip install -r requirements.txt
python run.py

# Browser - Stop frontend (Ctrl+C in another terminal)
# Then restart:
cd frontend
npm start

# Browser - Hard refresh (Ctrl+Shift+R)
# Then try again
```

### Fix 2: Clear Cache
```
Chrome/Edge: Ctrl+Shift+Delete
Firefox: Ctrl+Shift+Delete
Safari: Cmd+Opt+E
```

### Fix 3: Test in Incognito/Private Window
Sometimes cache causes issues:
```
Chrome: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
Safari: Cmd+Option+I
```

### Fix 4: Check Database Connection
If DB is not working, JWT validation might fail. Check in backend logs:
```python
# Look for database connection errors in terminal
# Should NOT see: "Database connection failed" or "No module named mysql"
```

## Expected Successful Response

When it works, you should see:

**Browser Console:**
```javascript
// Successful response
{
  disease: "Bacterial leaf blight",
  class: 0,  
  confidence: 92.5,
  success: true,
  info: {
    description: "...",
    symptoms: [...],
    treatment: [...],
    prevention: [...]
  }
}
```

**Terminal Output:**
```
[05/Mar/2026 10:15:55] "POST /api/disease-detection HTTP/1.1" 200 -
=== Disease Detection Request Started ===
...prediction...
=== Disease Detection Request Completed ===
```

## 📞 Still Need Help?

If none of this works:

1. **Run:** `python debug_422.py` and share output
2. **Check:** All files in backend/CNN/model/ exist
3. **Verify:** No errors in `pip list` or package installation
4. **Confirm:** Backend shows startup message without errors
5. **Test:** `curl http://localhost:5000/api/health` returns success

Then we can debug the specific issue!

---

**Remember:** The 422 error means the request reached the server but validation failed. The error message from that request will tell us exactly what's wrong!
