# 🌾 Smart Paddy Advisor

A machine learning-based web application for predicting paddy (rice) yield and providing agricultural recommendations.

---

## 📁 Project Structure

```
SmartPaddyAdvisor/
│
├── .git/                          ← Local Git repository (for version control)
├── .gitignore                     ← Ignores: .venv, node_modules, __pycache__, etc.
│
├── backend/                       ← Flask API Server
│   ├── app/
│   │   ├── __init__.py           ← App factory, CORS setup
│   │   ├── run.py                ← Flask server (entry point)
│   │   └── requirements.txt       ← Backend dependencies
│   ├── model/
│   │   ├── model_train.ipynb     ← Jupyter notebook: train ML models
│   │   └── *.pkl                 ← Generated model artifacts (not in git)
│   ├── requirements.txt
│   └── run.py                    ← Alternative entry point
│
├── frontend/                      ← React.js Web Application
│   ├── src/
│   │   ├── components/
│   │   │   └── PredictionForm.js ← Main form component
│   │   ├── App.js
│   │   └── index.js
│   ├── public/                    ← Static assets
│   ├── package.json              ← Frontend dependencies
│   └── ... (Create React App boilerplate)
│
├── data/                          ← Training datasets (CSV)
│   ├── SriLanka_Paddy_ML_Dataset.csv
│   └── SriLanka_Paddy_ML_Dataset_Cleaned.csv
│
├── .venv/ & venv/                 ← Python virtual environments (NOT in git)
├── node_modules/                  ← NPM packages (NOT in git)
│
└── README.md                       ← This file
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git

### Backend Setup

```bash
# 1. Navigate to project root
cd SmartPaddyAdvisor

# 2. Create Python virtual environment
python -m venv .venv

# 3. Activate virtual environment
# On Windows:
.\.venv\Scripts\Activate.ps1
# On Mac/Linux:
source .venv/bin/activate

# 4. Install dependencies
pip install -r backend/requirements.txt

# 5. Train the model (if needed)
# Open: backend/model/model_train.ipynb
# Run all cells in Jupyter Notebook

# 6. Start Flask server
python backend/app/run.py
# Server runs on: http://127.0.0.1:5000
```

### Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
# App opens at: http://localhost:3000
```

---

## 📡 API Endpoints

### Predict Yield
- **Method**: `POST`
- **Endpoint**: `/predict`
- **Request**:
  ```json
  {
    "temperature": 28.5,
    "soil_ph": 6.5,
    "rainfall": 150,
    "field_area": 1.5,
    "humidity": 75
  }
  ```
- **Response**:
  ```json
  {
    "predicted_yield": 5234.5,
    "advice": "Optimal conditions for paddy growth..."
  }
  ```

---

## 🔧 Git Workflow

### Clone Repository
```bash
git clone https://github.com/zanacodeX/SmartPaddyAdvisor.git
cd SmartPaddyAdvisor
```

### Make Changes & Commit
```bash
# Check status
git status

# Stage changes
git add .

# Commit with message
git commit -m "Your descriptive message"

# Push to GitHub
git push origin master

# Pull latest changes
git pull origin master
```

---

## 📋 What's NOT Tracked in Git

These folders are excluded via `.gitignore` (reduce repo size):

| Folder | Reason |
|--------|--------|
| `.venv/` | Python virtual environment |
| `venv/` | Alternative Python environment |
| `node_modules/` | NPM packages |
| `__pycache__/` | Python cache files |
| `*.pkl` & `*.joblib` | ML model artifacts |
| `.vscode/`, `.idea/` | IDE settings |

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `backend/app/__init__.py` | Flask app factory |
| `backend/app/run.py` | Start Flask server |
| `backend/model/model_train.ipynb` | Train ML models |
| `frontend/src/components/PredictionForm.js` | React form component |
| `.gitignore` | Git ignore rules |
| `README.md` | Project documentation |

---

## 📦 Dependencies

### Backend
- Flask
- pandas
- numpy
- scikit-learn
- joblib
- flask-cors

### Frontend
- React 19.2.0
- axios
- react-scripts 5.0.1

---

## 💡 Notes

1. **Virtual Environment**: Use `.venv/` for all Python packages
2. **Model Training**: Run `backend/model/model_train.ipynb` to generate model files
3. **CORS**: Frontend and backend communicate via CORS (enabled in Flask)
4. **Git**: Always pull before pushing to avoid conflicts

---

## 📞 Support

For issues or questions, create a GitHub issue or contact the project owner.

---

**Happy coding! 🌾**
