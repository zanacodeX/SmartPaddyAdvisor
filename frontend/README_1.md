# 🌾 Smart Paddy Advisor

**An AI-Driven Decision Support System for Paddy Cultivation in Sri Lanka**

Smart Paddy Advisor is a full-stack web application that integrates machine learning-based yield prediction, CNN-based leaf disease detection, and stage-wise cultivation advisory to support paddy farmers with data-driven agricultural decisions.

> 🎓 Final Year Dissertation Project — BSc Software Engineering, Cardiff Metropolitan University / ICBT Campus, Sri Lanka (March 2026)

---

## 📸 System Highlights

| Feature | Description |
|---|---|
| 🌱 Yield Prediction | Predicts paddy yield from soil, climate, and field inputs using Random Forest |
| 🔬 Disease Detection | Classifies leaf diseases (Bacterial Leaf Blight, Brown Spot, Leaf Smut) from uploaded images |
| 📋 Stage Advisory | Provides fertilizer and irrigation guidance across 7 cultivation stages |
| 📄 PDF Export | Generates downloadable cultivation reports per prediction |
| 🔐 Secure Auth | JWT-based authentication with role-based access (farmer / admin) |

---

## 📁 Project Structure

```
SmartPaddyAdvisor/
│
├── backend/                          ← Flask REST API Server
│   ├── app/
│   │   ├── __init__.py              ← App factory, CORS, DB & JWT init, blueprint registration
│   │   ├── models.py                ← SQLAlchemy models: User, Prediction
│   │   ├── controller/              ← Route controllers: auth, yield, disease detection
│   │   └── service/                 ← Inference services: yield prediction, disease classification
│   ├── model/                       ← Trained yield model artifacts (.pkl)
│   │   ├── paddy_model_numeric.pkl  ← Numeric yield prediction model
│   │   ├── paddy_model_text.pkl     ← Text-based recommendation model
│   │   ├── scaler.pkl               ← Feature scaler
│   │   └── label_encoders.pkl       ← Categorical label encoders
│   ├── CNN/                         ← Disease detection model
│   │   └── model/
│   │       └── Rice_Leaves_Disease_Detection.pkl
│   ├── test/                        ← Backend unit and integration tests (Pytest)
│   ├── requirements.txt
│   └── run.py                       ← Backend entry point
│
├── frontend/                         ← React.js Web Application
│   ├── public/                       ← Static assets
│   └── src/
│       ├── pages/                    ← Route-level pages (Landing, Portal, Admin)
│       ├── component/                ← UI components (Prediction, History, Detection, Profile)
│       └── api/
│           └── axiosInstance.js      ← Centralised Axios client with JWT interceptor
│
├── data/                             ← Training datasets (CSV)
│   ├── SriLanka_Paddy_ML_Dataset.csv
│   └── SriLanka_Paddy_ML_Dataset_Cleaned.csv
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.8+ |
| Node.js | 14+ |
| npm | 6+ |
| MySQL | 5.7+ |

---

### 1. Clone the Repository

```bash
git clone https://github.com/zanacodeX/SmartPaddyAdvisor.git
cd SmartPaddyAdvisor
```

---

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv .venv
```

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
source .venv/bin/activate
```

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start the Flask server
python backend/run.py
```

> Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

> Frontend runs at: `http://localhost:3000`

---

## ⚙️ Environment Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_DB=smartpaddy
JWT_SECRET_KEY=your-secure-secret-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123
```

| Variable | Default | Description |
|---|---|---|
| `MYSQL_USER` | `root` | MySQL database username |
| `MYSQL_PASSWORD` | *(empty)* | MySQL database password |
| `MYSQL_HOST` | `localhost` | MySQL host address |
| `MYSQL_DB` | `smartpaddy` | Target database name |
| `JWT_SECRET_KEY` | `your-secret-key` | JWT signing key — **change before deployment** |
| `ADMIN_EMAIL` | `admin@example.com` | Seeded admin email on first run |
| `ADMIN_PASSWORD` | `Password123` | Seeded admin password on first run |

> ⚠️ **Security:** Never commit your `.env` file. Always replace default credentials before deploying.

---

## 📡 API Reference

### 🔐 Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register a new user account |
| `POST` | `/auth/login` | ❌ | Authenticate and receive JWT token |
| `GET` | `/auth/me` | ✅ JWT | Get current user profile |
| `PUT` | `/auth/change-password` | ✅ JWT | Update account password |
| `PUT` | `/auth/update-profile` | ✅ JWT | Update name, phone, location |
| `GET` | `/auth/admin/users` | ✅ Admin | List all registered users |
| `PUT` | `/auth/admin/users/<id>` | ✅ Admin | Edit a user's profile |
| `PUT` | `/auth/admin/users/<id>/role` | ✅ Admin | Change user role |
| `DELETE` | `/auth/admin/users/<id>` | ✅ Admin | Delete a user account |

### 🌾 Yield Prediction & History

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/predict` | ❌ | Run yield prediction and get recommendations |
| `POST` | `/api/save_prediction` | ❌ | Save a prediction record |
| `GET` | `/api/predictions` | Optional | Retrieve user prediction history |
| `DELETE` | `/api/predictions/<id>` | ❌ | Delete a prediction record |

**Example Request — `/predict`:**
```json
{
  "soil_ph": 6.5,
  "rainfall": 150,
  "temperature": 28.5,
  "humidity": 75,
  "field_area": 1.5,
  "region": "Kurunegala"
}
```

**Example Response:**
```json
{
  "predicted_yield": 5234.5,
  "stage_advice": "Apply top-dressing fertilizer at tillering stage...",
  "fertilizer_summary": {
    "urea_kg": 45,
    "tsp_kg": 20,
    "mop_kg": 15
  }
}
```

### 🔬 Disease Detection

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ❌ | Service health check |
| `POST` | `/api/disease-detection` | ✅ JWT | Classify paddy leaf disease from image |
| `GET` | `/api/disease-info/<disease_name>` | ✅ JWT | Get detailed disease information |

---

## 🧠 Machine Learning Components

### Yield Prediction Model

| Property | Detail |
|---|---|
| Algorithm | Random Forest Regressor (primary), XGBoost / CatBoost / LightGBM (evaluated) |
| Tuning | Randomized Search CV |
| Performance | R² = 0.94, Low RMSE |
| Inputs | Soil pH, rainfall, temperature, humidity, field area, region, cultivation stage |
| Training Data | `SriLanka_Paddy_ML_Dataset_Cleaned.csv` |

### Disease Detection Model

| Property | Detail |
|---|---|
| Algorithm | Support Vector Machine (SVM) with GridSearchCV |
| Classes | Bacterial Leaf Blight · Brown Spot · Leaf Smut |
| Accuracy | 78% (3-class, 36-sample test set) |
| Input | Paddy leaf image (resized to 104×104 px, flattened feature vector) |

---

## 🧪 Testing

Run backend tests from the project root:

```powershell
.\.venv\Scripts\python -m pytest -q backend/test
```

**Current status:** `96 passed, 2 failed`

---

## 📦 Dependencies

### Backend (`backend/requirements.txt`)

```
Flask
Flask-SQLAlchemy
Flask-JWT-Extended
Flask-CORS
python-dotenv
scikit-learn
pandas
numpy
joblib
pytest
```

### Frontend (`frontend/package.json`)

```
react
react-router-dom
react-bootstrap
axios
jspdf
jspdf-autotable
```

---

## 🚫 What's Not Tracked in Git

| Item | Reason |
|---|---|
| `.venv/`, `venv/` | Python virtual environment |
| `node_modules/` | NPM packages |
| `__pycache__/` | Python bytecode cache |
| `*.pkl`, `*.joblib` | ML model artifacts |
| `.env` | Environment secrets |
| `.vscode/`, `.idea/` | IDE configuration |

---

## 🔧 Git Workflow

```bash
# Check current status
git status

# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "feat: add stage-wise advisory module"

# Push to remote
git push origin master

# Pull latest changes
git pull origin master
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, React Bootstrap, Axios |
| Backend | Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended |
| Database | MySQL |
| Machine Learning | Scikit-learn, NumPy, Pandas, Joblib |
| Authentication | JSON Web Tokens (JWT) |
| Testing | Pytest |
| PDF Generation | jsPDF, jsPDF-AutoTable |

---

## 👤 Author

**Waduge Supun Sandaruwan**  
BSc Software Engineering — Cardiff Metropolitan University / ICBT Campus, Sri Lanka  
Cardiff ID: `st20274939` | ICBT ID: `CL/BSCSD/32/114`

---

<p align="center">Made with ❤️ for Sri Lankan paddy farmers 🌾</p>
