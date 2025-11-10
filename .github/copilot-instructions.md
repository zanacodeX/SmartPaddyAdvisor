## Quick orientation — what this repo is

- Purpose: a small web app that predicts paddy yield. Frontend is a Create-React-App (client) and backend is a Flask API (server) that exposes a prediction endpoint.
- Key folders:
  - `backend/` — Flask backend, model training notebook at `backend/model/model_train.ipynb`, dependencies in `backend/requirements.txt`.
  - `frontend/` — React app created with CRA. Main component that calls the API: `frontend/src/components/PredictionForm.js`.
  - `data/` — training datasets (CSV).

## Architecture & data flow (short)

- Frontend posts JSON to the Flask API at `/predict` (see `PredictionForm.js`: axios POST to `http://127.0.0.1:5000/predict`).
- Backend is a small Flask app that registers a blueprint under the root URL. App factory lives in `backend/app/__init__.py` (function `create_app()`).
- Model artifacts are expected to be produced by `backend/model/model_train.ipynb` and persisted with `joblib` (joblib is in `backend/requirements.txt`).

## How to run (developer commands)

On Windows PowerShell (recommended):

- Backend (Python 3.8+ recommended):
  1. create a venv and install: `python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r backend/requirements.txt`
  2. start server (two common entry points observed):
     - `python backend/app/run.py` — uses the `create_app()` factory in `backend/app/__init__.py` (preferred if present)
     - `python backend/run.py` — top-level starter that registers the blueprint directly
  3. The server listens on port 5000 by default. The frontend expects `http://127.0.0.1:5000/predict`.

- Frontend (Node.js):
  1. `cd frontend` then `npm install`
  2. `npm start` — CRA dev server on port 3000. It calls the backend with axios in `PredictionForm.js`.

## Project-specific patterns & conventions

- Small, explicit API surface: a single prediction endpoint (root `/predict`). Look for a Flask blueprint (expected at `backend/app/controller/yield_controller.py`). If that file is missing, search for any blueprint registration: `register_blueprint(`.
- App factory pattern is present (`create_app()` in `backend/app/__init__.py`) — prefer using the factory when adding extensions or tests.
- Data contract (request/response): see `PredictionForm.js` — POST body keys: `temperature`, `soil_ph`, `rainfall`, `field_area`, `humidity`. Response expected shape: `{ predicted_yield, advice }`.
- Model persistence: `joblib` is used (see `backend/requirements.txt`). Look for `.pkl` or `.joblib` artifacts in the repo or a `models/` folder; none were found — agents should not hardcode artifact paths.

## Integration points & external dependencies

- Python: Flask, pandas, numpy, scikit-learn, joblib, flask-cors (see `backend/requirements.txt`).
- JS: React (CRA), axios (frontend uses axios to call backend).
- Data: CSVs live in `data/`. Training is done in the notebook at `backend/model/model_train.ipynb`.

## Useful file references (examples to inspect/edit)

- `backend/app/__init__.py` — app factory and CORS setup.
- `backend/run.py` and `backend/app/run.py` — two run entrypoints; prefer the factory-based `app/run.py` for adding tests.
- `frontend/src/components/PredictionForm.js` — exact request body and response handling used by the UI.
- `backend/requirements.txt` — install list for backend.
- `backend/model/model_train.ipynb` — training/feature engineering; use it to reproduce model artifacts.

## What an AI code agent should prioritize here

1. Preserve the request/response contract used by the frontend when changing the API. Use `PredictionForm.js` as the canonical example.
2. If adding or modifying the prediction endpoint, wire CORS via `create_app()` and keep the blueprint mounted at `/` (so `/predict` remains reachable).
3. When touching model loading/training, use `joblib` and do not assume a fixed path; prefer configurable environment variable or `config.py` in `backend/`.

## Things I noticed that need human attention / verification

- The controller blueprint import path (`app.controller.yield_controller`) is referenced in `backend/run.py` and `backend/app/__init__.py`, but a `yield_controller.py` file was not visible in the repository snapshot. Before creating or modifying endpoints, confirm the blueprint file exists or supply its correct path.
- No automated tests or CI configuration were discovered. If you add endpoints, include a small pytest module that exercises the Flask test client via `create_app()`.

If anything above is incorrect or you'd like the doc to call out additional developer tasks (tests, CI, model artifact naming, or a preferred entrypoint), tell me which pieces to expand and I'll update this file.
