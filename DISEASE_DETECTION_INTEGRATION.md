# CNN Disease Detection Integration Guide

## Overview
This document explains the integration of the rice leaf disease detection CNN model into the Smart Paddy Advisor application.

## Components Added

### Backend Components

#### 1. Disease Detection Service (`backend/app/service/disease_detection_service.py`)
- Loads the trained SVM model: `Rice_Leaves_Disease_Detection.pkl`
- Preprocesses images (resize to 104x104, flatten)
- Makes disease predictions
- Provides disease information (symptoms, treatment, prevention)

**Key Functions:**
- `load_model()` - Loads the trained model
- `preprocess_image(image_data)` - Prepares image for prediction
- `predict_disease(image_data)` - Returns disease prediction with confidence
- `get_disease_info(disease_name)` - Returns detailed disease information

#### 2. Disease Detection Controller (`backend/app/controller/disease_detection_controller.py`)
- API endpoints for disease detection
- Handles image uploads
- Protected with JWT authentication

**Endpoints:**
- `POST /api/disease-detection` - Detect disease from uploaded image
- `GET /api/disease-info/<disease_name>` - Get disease details

### Frontend Components

#### 1. Disease Detection Component (`frontend/src/component/DiseaseDetection.js`)
React component with:
- Image upload with drag & drop
- Real-time image preview
- Disease detection UI
- Results display with confidence
- Disease information (description, symptoms, treatment, prevention)

#### 2. Detection Styling (`frontend/src/styles/Detection.css`)
- Responsive design
- Drag & drop dropzone styling
- Results card formatting

#### 3. Updated UserPortal (`frontend/src/pages/UserPortal.js`)
Added "Disease Detection" tab alongside existing prediction tabs

## Supported Diseases
1. **Bacterial leaf blight** - Caused by Xanthomonas oryzae
2. **Brown spot** - Fungal infection by Bipolaris oryzae
3. **Leaf smut** - Caused by Entyloma oryzae

## How to Use

### For Users
1. Navigate to the "Disease Detection" tab in the User Portal
2. Upload an image of a rice leaf (drag & drop or click to select)
3. Click "Detect Disease" button
4. View results including:
   - Detected disease name
   - Confidence percentage
   - Disease description
   - Symptoms
   - Treatment options
   - Prevention methods

### For Developers

#### Installation
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

#### Running the Application
```bash
# Backend (from backend directory)
python run.py

# Frontend (from frontend directory)
npm start
```

#### API Usage Example
```javascript
// Upload image and detect disease
const formData = new FormData();
formData.append('image', imageFile);

const response = await axios.post('/api/disease-detection', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
});

// Response
{
  "disease": "Bacterial leaf blight",
  "class": 0,
  "confidence": 92.5,
  "success": true,
  "info": {
    "description": "...",
    "symptoms": [...],
    "treatment": [...],
    "prevention": [...]
  }
}
```

## Image Requirements
- **Format**: JPEG, PNG, or other standard image formats
- **Size**: Any size (will be automatically resized to 104x104)
- **Quality**: Clear image of rice leaf for best results

## Important Notes

1. **Model Path**: The model is located at `backend/CNN/model/Rice_Leaves_Disease_Detection.pkl`
2. **Image Processing**: Images are preprocessed by:
   - Resizing to 104x104 pixels
   - Converting to grayscale/array format
   - Flattening for model input
3. **Authentication**: All detection endpoints require JWT authentication
4. **CORS**: Already configured to allow frontend requests

## Troubleshooting

### Model Not Found
- Ensure `Rice_Leaves_Disease_Detection.pkl` exists in `backend/CNN/model/`
- Check file path in `disease_detection_service.py`

### Image Upload Fails
- Verify file size and format
- Check CORS configuration
- Ensure JWT token is valid

### Low Confidence Predictions
- Try images with better lighting
- Ensure the leaf is the main focus
- Use clear, unblemished images for comparison

## Future Improvements
1. Add prediction history tracking
2. Implement batch image processing
3. Add more disease categories
4. Integrate real-time camera feed detection
5. Add user-friendly disease management tips
6. Implement image quality validation

## File Structure
```
SmartPaddyAdvisor/
├── backend/
│   ├── app/
│   │   ├── controller/
│   │   │   └── disease_detection_controller.py (NEW)
│   │   └── service/
│   │       └── disease_detection_service.py (NEW)
│   ├── CNN/
│   │   └── model/
│   │       └── Rice_Leaves_Disease_Detection.pkl
│   └── requirements.txt (UPDATED)
├── frontend/
│   └── src/
│       ├── component/
│       │   └── DiseaseDetection.js (NEW)
│       ├── pages/
│       │   └── UserPortal.js (UPDATED)
│       └── styles/
│           └── Detection.css (NEW)
```

## Support
For issues or questions about the disease detection feature, please refer to the main project README or contact the development team.
