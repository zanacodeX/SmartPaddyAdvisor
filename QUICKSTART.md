# 🚀 Quick Start Guide - Disease Detection

## Step 1: Install Dependencies

```bash
# Install backend packages
cd backend
pip install -r requirements.txt

# Install frontend packages
cd ../frontend
npm install
```

## Step 2: Start the Application

### Terminal 1 - Run Backend:
```bash
cd backend
python run.py
```
Backend will start at: `http://localhost:5000`

### Terminal 2 - Run Frontend:
```bash
cd frontend
npm start
```
Frontend will start at: `http://localhost:3000`

## Step 3: Test Disease Detection

### Option A: Simple Validation Test
```bash
python test_disease_detection.py
```

### Option B: Web Interface
1. Open `http://localhost:3000` in your browser
2. Login with your credentials
3. Click the **"Disease Detection"** tab in User Portal
4. Upload a rice leaf image
5. Click **"Detect Disease"** button
6. View results!

## 📸 Using the Disease Detection Feature

### What You Can Do:
1. **Upload Images**
   - Click the dropzone or drag & drop
   - Supported formats: JPEG, PNG, etc.
   
2. **Get Predictions**
   - Model identifies the disease in the leaf
   - Shows confidence percentage
   
3. **Get Information**
   - See disease description
   - View symptoms
   - Get treatment recommendations
   - Learn prevention methods

## 🎯 What's New

Your Smart Paddy Advisor now has:
- ✅ **Disease Detection Tab** in User Portal
- ✅ **Image Upload & Preview** feature
- ✅ **AI-Powered** disease classification
- ✅ **Detailed Information** for each disease
- ✅ **Professional UI** with Bootstrap styling
- ✅ **JWT Protected** API endpoints

## 📋 Files Created/Modified

### Created:
- `backend/app/service/disease_detection_service.py`
- `backend/app/controller/disease_detection_controller.py`
- `frontend/src/component/DiseaseDetection.js`
- `frontend/src/styles/Detection.css`
- `test_disease_detection.py`
- `DISEASE_DETECTION_INTEGRATION.md`
- `CNN_INTEGRATION_SUMMARY.md`

### Modified:
- `backend/app/__init__.py` - Added disease detection blueprint
- `backend/requirements.txt` - Added dependencies
- `frontend/src/pages/UserPortal.js` - Added Detection tab

## 🔍 Testing with Sample Images

The backend/CNN folder has sample images:
- `img1.png`
- `img2.png`
- `img3.png`

You can use these to test the detection feature works properly!

## 🐛 Troubleshooting

### Model Not Found?
- Check: `backend/CNN/model/Rice_Leaves_Disease_Detection.pkl` exists

### Port Already in Use?
```bash
# Change port in frontend .env or backend config
# Frontend: PORT=3001 npm start
# Backend: Edit run.py to use different port
```

### Dependencies Missing?
```bash
# Reinstall all dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Can't Connect to Backend?
- Check backend is running on port 5000
- Check CORS is enabled in Flask
- Check JWT token is valid

## 📚 Documentation

See these files for detailed info:
- `DISEASE_DETECTION_INTEGRATION.md` - Full technical guide
- `CNN_INTEGRATION_SUMMARY.md` - What was added
- Backend logs for API troubleshooting

## ✅ Checklist

- [ ] Installed backend dependencies
- [ ] Installed frontend dependencies
- [ ] Backend running (http://localhost:5000)
- [ ] Frontend running (http://localhost:3000)
- [ ] Can login to User Portal
- [ ] "Disease Detection" tab visible
- [ ] Can upload image
- [ ] Can detect disease
- [ ] Can see disease information

## 🎉 You're All Set!

Your CNN rice leaf disease detection is now integrated in the Smart Paddy Advisor!

**Happy Farming! 🌾**

---

For questions or issues, refer to:
- `DISEASE_DETECTION_INTEGRATION.md` 
- Backend logs: `backend/`
- Frontend console: Browser DevTools (F12)
