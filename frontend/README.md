# Smart Paddy Advisor

**An AI-Driven Decision Support System for Paddy Cultivation**

Smart Paddy Advisor is a full-stack web application developed to support paddy (rice) farmers through intelligent crop management tools. The system integrates machine learning-based yield prediction, CNN-based leaf disease detection, stage-wise cultivation advisory, and comprehensive user and administrator workflows.

---

## System Overview

The application is structured as a decoupled full-stack system:

- **Backend:** Python/Flask REST API with SQLAlchemy ORM, JWT authentication, and ML inference services
- **Frontend:** React.js single-page application with React Router, React Bootstrap, and Axios
- **Database:** MySQL for persistent storage of users, prediction records, and activity history
- **ML Artifacts:** Pre-trained yield prediction models (Random Forest) and a disease detection classifier (SVM/CNN pipeline)

---

## Key Features

### Farmer Portal
- Paddy yield prediction from environmental and agronomic field inputs
- Stage-based cultivation recommendations covering the full growth cycle
- Paddy leaf disease detection via image upload
- Prediction history with detail view and PDF report export
- Secure profile management and password update

### Administration Portal
- User account management (create, edit, delete)
- Role management (`user` / `admin`)
- User search and filtering
- Self-delete protection enforced at the API level

---

## Project Structure

```
SmartPaddyAdvisor/
├── backend/
│   ├── app/
│   │   ├── __init__.py              # Application factory, configuration, blueprint registration
│   │   ├── models.py                # SQLAlchemy models: User, Prediction
│   │   ├── controller/              # Route controllers: auth, yield, disease detection
│   │   └── service/                 # Business logic: yield inference, disease inference
│   ├── model/                       # Trained yield model artifacts (.pkl)
│   ├── CNN/                         # Disease detection model artifacts and image dataset
│   ├── test/                        # Backend unit and integration tests
│   ├── requirements.txt
│   └── run.py                       # Application entry point
├── frontend/
│   ├── public/
│   └── src/
│       ├── pages/                   # Route-level page components
│       ├── component/               # Shared UI components
│       └── api/axiosInstance.js     # Centralised Axios client with JWT interceptor
├── data/                            # Training datasets (CSV)
└── README.md
```

---

## Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.8 or higher |
| Node.js | 14 or higher |
| npm | 6 or higher |
| MySQL | 5.7 or higher |

---

## Environment Configuration

The following environment variables must be configured before running the application. These are loaded via `python-dotenv` in `backend/app/__init__.py`.

| Variable | Default | Description |
|---|---|---|
| `MYSQL_USER` | `root` | MySQL database username |
| `MYSQL_PASSWORD` | *(empty)* | MySQL database password |
| `MYSQL_HOST` | `localhost` | MySQL host address |
| `MYSQL_DB` | `smartpaddy` | Target database name |
| `JWT_SECRET_KEY` | `your-secret-key-change-in-production` | JWT signing key — **must be changed in production** |
| `ADMIN_EMAIL` | `admin@example.com` | Default admin account email (seeded on first run) |
| `ADMIN_PASSWORD` | `Password123` | Default admin account password (seeded on first run) |

> **Security Note:** Always replace default credentials and the JWT secret key before deploying to any shared or production environment.

---

## Local Installation and Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SmartPaddyAdvisor
```

### 2. Backend Setup

Create and activate a virtual environment:

```bash
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

Install dependencies and start the backend server:

```bash
pip install -r backend/requirements.txt
python backend/run.py
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user account |
| `POST` | `/auth/login` | No | Authenticate and receive JWT access token |
| `GET` | `/auth/me` | JWT | Retrieve current authenticated user profile |
| `PUT` | `/auth/change-password` | JWT | Update account password |
| `PUT` | `/auth/update-profile` | JWT | Update name, phone, and location |
| `GET` | `/auth/admin/users` | JWT + Admin | List all registered users |
| `PUT` | `/auth/admin/users/<id>` | JWT + Admin | Update a user's profile fields |
| `PUT` | `/auth/admin/users/<id>/role` | JWT + Admin | Assign or change a user's role |
| `DELETE` | `/auth/admin/users/<id>` | JWT + Admin | Delete a user account |

### Yield Prediction and History Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/predict` | No | Generate yield prediction and cultivation recommendations |
| `POST` | `/api/save_prediction` | No | Persist a prediction record by `user_id` |
| `GET` | `/api/predictions` | Optional | Retrieve prediction history for a user |
| `DELETE` | `/api/predictions/<id>` | No | Delete a specific prediction record |

### Disease Detection Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Service health check |
| `POST` | `/api/disease-detection` | JWT | Submit a leaf image for disease classification |
| `GET` | `/api/disease-info/<disease_name>` | JWT | Retrieve detailed information on a detected disease |

---

## Testing

Backend tests are located in `backend/test/` and cover controller and service layers.

Run all tests from the project root:

```powershell
.\.venv\Scripts\python -m pytest -q backend/test
```

**Current test status:** `96 passed, 2 failed`

---

## Machine Learning Components

### Yield Prediction Model
- **Algorithm:** Random Forest Regressor with Gradient Boosting comparison
- **Inputs:** Soil pH, rainfall, temperature, humidity, field area, region, and cultivation stage
- **Artifacts:** `paddy_model_numeric.pkl`, `paddy_model_text.pkl`, `scaler.pkl`, `label_encoders.pkl`

### Disease Detection Model
- **Algorithm:** Support Vector Machine (SVM) with GridSearchCV hyperparameter optimisation
- **Classes:** Bacterial Leaf Blight, Brown Spot, Leaf Smut
- **Artifact:** `Rice_Leaves_Disease_Detection.pkl`

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, React Bootstrap, Axios |
| Backend | Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended |
| Database | MySQL |
| Machine Learning | Scikit-learn, NumPy, Pandas, Joblib |
| Authentication | JSON Web Tokens (JWT) |
| Testing | Pytest |

---

## Academic Context

This system was developed as a final year dissertation project for the **BSc Software Engineering** programme at **Cardiff Metropolitan University**, in collaboration with **ICBT Campus, Sri Lanka** (March 2026).

> *Waduge Supun Sandaruwan — Cardiff ID: st20274939 | ICBT ID: CL/BSCSD/32/114*
