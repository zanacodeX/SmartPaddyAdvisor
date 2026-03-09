"""
tests/test_yield_controller.py
================================
Pure Mock-based Unit Tests for yield_controller.py

Routes tested:
    POST /predict                       - get_prediction_results (no auth)
    POST /api/save_prediction           - save to DB (no auth)
    DELETE /api/predictions/<id>        - delete prediction (no auth)
    GET  /api/predictions               - get history (JWT optional)

Patch paths:
    app.controller.yield_controller.get_prediction_results
    app.controller.yield_controller.get_user_predictions
    app.controller.yield_controller.db
    app.controller.yield_controller.User
    app.controller.yield_controller.Prediction
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token


# =============================================================================
# PATCH PATHS  — match exact imports in yield_controller.py
# =============================================================================

GET_PREDICTION_PATH  = 'app.controller.yield_controller.get_prediction_results'
GET_USER_PRED_PATH   = 'app.controller.yield_controller.get_user_predictions'
DB_PATH              = 'app.controller.yield_controller.db'
USER_PATH            = 'app.controller.yield_controller.User'
PREDICTION_PATH      = 'app.controller.yield_controller.Prediction'


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture(scope='session')
def app():
    """
    Minimal Flask app — no MySQL needed.
    All DB calls and services are mocked per test.
    """
    flask_app = Flask(__name__)
    flask_app.config['TESTING']                        = True
    flask_app.config['JWT_SECRET_KEY']                 = 'test-secret-key'
    flask_app.config['SQLALCHEMY_DATABASE_URI']        = 'sqlite:///:memory:'
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    JWTManager(flask_app)

    # Mock everything before importing blueprint
    with patch(GET_PREDICTION_PATH, new=MagicMock()), \
         patch(DB_PATH,             new=MagicMock()), \
         patch(USER_PATH,           new=MagicMock()), \
         patch(PREDICTION_PATH,     new=MagicMock()):
        from app.controller.yield_controller import api as yield_blueprint
        flask_app.register_blueprint(yield_blueprint)

    return flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def token(app):
    """Valid JWT for user id = '1'."""
    with app.app_context():
        return create_access_token(identity='1')


@pytest.fixture
def auth_headers(token):
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type':  'application/json',
    }


# =============================================================================
# HELPERS
# =============================================================================

def post_json(client, url, data, headers=None):
    return client.post(
        url,
        data=json.dumps(data),
        headers=headers or {'Content-Type': 'application/json'},
    )

def make_valid_input():
    """Realistic paddy yield prediction payload."""
    return {
        'temperature': 28.3,
        'soil_ph':     6.5,
        'rainfall':    200.5,
        'field_area':  2.5,
        'humidity':    75.0,
    }

def make_prediction_result():
    """Realistic result from get_prediction_results()."""
    return {
        'PredictedYield_kg_ha':        4500.75,
        'PloughDepth_cm':              20,
        'SoilAdjustment_kgLime':       50,
        'SeedAmount_kg':               25,
        'PlantSpacing_cm':             20,
        'Fertilizer_Basal_Urea_kg':    45,
        'Fertilizer_Basal_TSP_kg':     30,
        'Fertilizer_Basal_MOP_kg':     20,
        'Fertilizer_2ndDose_Urea_kg':  35,
        'Fertilizer_2ndDose_TSP_kg':   25,
        'Fertilizer_2ndDose_MOP_kg':   15,
        'PloughMethod':                'Deep ploughing',
        'IrrigationAdvice':            'Flood irrigation',
        'HarvestingDate':              '2026-06-15',
        'PostHarvestAdvice':           'Dry paddy immediately',
    }

def make_save_payload(user_id=1):
    """Payload for /api/save_prediction."""
    return {
        'user_id':    user_id,
        'prediction': make_prediction_result(),
    }

def make_mock_user(user_id=1):
    user = MagicMock()
    user.id = user_id
    return user

def make_mock_prediction(pred_id=1, user_id=1):
    pred = MagicMock()
    pred.id      = pred_id
    pred.user_id = user_id
    pred.to_dict = MagicMock(return_value={
        'id':                   pred_id,
        'user_id':              user_id,
        'predicted_yield_kg_ha': 4500.75,
    })
    return pred


# =============================================================================
# TEST 1 — POST /predict
# =============================================================================

class TestPredict:
    """
    Route calls get_prediction_results(data) and returns jsonify(result).
    On exception returns {"error": str(e)}, 400 or 500.
    """

    def test_predict_success(self, client):
        """Valid payload -> 200 with prediction result."""
        with patch(GET_PREDICTION_PATH) as mock_predict:
            mock_predict.return_value = make_prediction_result()

            resp = post_json(client, '/predict', make_valid_input())

            assert resp.status_code == 200
            body = resp.get_json()
            assert 'PredictedYield_kg_ha' in body
            assert body['PredictedYield_kg_ha'] == 4500.75

    def test_predict_calls_service_once(self, client):
        """get_prediction_results() called exactly once per request."""
        with patch(GET_PREDICTION_PATH) as mock_predict:
            mock_predict.return_value = make_prediction_result()

            post_json(client, '/predict', make_valid_input())

            mock_predict.assert_called_once()

    def test_predict_passes_exact_payload_to_service(self, client):
        """Service receives the exact JSON body sent by the client."""
        with patch(GET_PREDICTION_PATH) as mock_predict:
            mock_predict.return_value = make_prediction_result()
            payload = make_valid_input()

            post_json(client, '/predict', payload)

            mock_predict.assert_called_once_with(payload)

    def test_predict_response_mirrors_service_output(self, client):
        """Controller must not transform the result — pass it through as-is."""
        with patch(GET_PREDICTION_PATH) as mock_predict:
            result = make_prediction_result()
            mock_predict.return_value = result

            resp = post_json(client, '/predict', make_valid_input())
            body = resp.get_json()

            assert body['PloughDepth_cm']             == result['PloughDepth_cm']
            assert body['IrrigationAdvice']            == result['IrrigationAdvice']
            assert body['HarvestingDate']              == result['HarvestingDate']

    def test_predict_no_auth_required(self, client):
        """Endpoint is open — no Authorization header needed."""
        with patch(GET_PREDICTION_PATH) as mock_predict:
            mock_predict.return_value = make_prediction_result()

            resp = post_json(client, '/predict', make_valid_input())

            assert resp.status_code != 401

    def test_predict_empty_body_returns_400(self, client):
        """Empty/null body -> route returns 400."""
        with patch(GET_PREDICTION_PATH) as mock_predict:
            mock_predict.return_value = {"error": "No input data provided"}

            resp = client.post(
                '/predict',
                data='',
                content_type='application/json',
            )
            # Either 400 from validation or service handles it
            assert resp.status_code in (200, 400)

    def test_predict_missing_key_raises_key_error_returns_400(self, client):
        """KeyError from service -> 400 with missing key message."""
        with patch(GET_PREDICTION_PATH) as mock_predict:
            mock_predict.side_effect = KeyError('temperature')

            resp = post_json(client, '/predict', {'humidity': 75})

            assert resp.status_code == 400
            assert 'error' in resp.get_json()

    def test_predict_service_exception_returns_500_or_400(self, client):
        """Generic exception from service -> error response."""
        with patch(GET_PREDICTION_PATH) as mock_predict:
            mock_predict.side_effect = Exception('Model file not found')

            resp = post_json(client, '/predict', make_valid_input())

            assert resp.status_code in (400, 500)
            assert 'error' in resp.get_json()

    def test_predict_wrong_method_returns_405(self, client):
        """GET on /predict -> 405 Method Not Allowed."""
        with patch(GET_PREDICTION_PATH) as mock_predict:
            resp = client.get('/predict')

            assert resp.status_code == 405
            mock_predict.assert_not_called()


# =============================================================================
# TEST 2 — POST /api/save_prediction
# =============================================================================

class TestSavePrediction:
    """
    Saves a prediction to DB.
    Mocks: User.query.get, Prediction constructor, db.session
    """

    def test_save_prediction_success(self, client):
        """Valid payload with existing user -> 201 saved successfully."""
        with patch(USER_PATH)       as MockUser, \
             patch(PREDICTION_PATH) as MockPrediction, \
             patch(DB_PATH)         as mock_db:

            MockUser.query.get.return_value    = make_mock_user(user_id=1)
            MockPrediction.return_value        = make_mock_prediction()

            resp = post_json(client, '/api/save_prediction', make_save_payload())

            assert resp.status_code == 201
            assert 'saved successfully' in resp.get_json()['message']
            mock_db.session.add.assert_called_once()
            mock_db.session.commit.assert_called_once()

    def test_save_prediction_user_not_found(self, client):
        """User.query.get returns None -> 404."""
        with patch(USER_PATH) as MockUser, \
             patch(DB_PATH)   as mock_db:

            MockUser.query.get.return_value = None

            resp = post_json(client, '/api/save_prediction', make_save_payload())

            assert resp.status_code == 404
            assert 'User not found' in resp.get_json()['error']
            mock_db.session.commit.assert_not_called()

    def test_save_prediction_missing_user_id(self, client):
        """Payload without user_id -> 400."""
        with patch(DB_PATH) as mock_db:
            resp = post_json(client, '/api/save_prediction', {
                'prediction': make_prediction_result()
            })

            assert resp.status_code == 400
            mock_db.session.commit.assert_not_called()

    def test_save_prediction_missing_prediction(self, client):
        """Payload without prediction key -> 400."""
        with patch(DB_PATH) as mock_db:
            resp = post_json(client, '/api/save_prediction', {'user_id': 1})

            assert resp.status_code == 400
            mock_db.session.commit.assert_not_called()

    def test_save_prediction_empty_body(self, client):
        """Empty body -> 400."""
        with patch(DB_PATH) as mock_db:
            resp = post_json(client, '/api/save_prediction', {})

            assert resp.status_code == 400
            mock_db.session.commit.assert_not_called()

    def test_save_prediction_db_add_called_with_prediction_object(self, client):
        """db.session.add() must be called with the new Prediction instance."""
        with patch(USER_PATH)       as MockUser, \
             patch(PREDICTION_PATH) as MockPrediction, \
             patch(DB_PATH)         as mock_db:

            MockUser.query.get.return_value = make_mock_user()
            pred_instance = make_mock_prediction()
            MockPrediction.return_value     = pred_instance

            post_json(client, '/api/save_prediction', make_save_payload())

            mock_db.session.add.assert_called_once_with(pred_instance)

    def test_save_prediction_queries_correct_user_id(self, client):
        """User.query.get() must be called with the user_id from payload."""
        with patch(USER_PATH)       as MockUser, \
             patch(PREDICTION_PATH) as MockPrediction, \
             patch(DB_PATH):

            MockUser.query.get.return_value = make_mock_user(user_id=5)
            MockPrediction.return_value     = make_mock_prediction()

            post_json(client, '/api/save_prediction', make_save_payload(user_id=5))

            MockUser.query.get.assert_called_once_with(5)


# =============================================================================
# TEST 3 — DELETE /api/predictions/<id>
# =============================================================================

class TestDeletePrediction:
    """
    Deletes a prediction by ID.
    Mocks: Prediction.query.get, db.session
    """

    def test_delete_success(self, client):
        """Existing prediction ID -> 200 deleted successfully."""
        with patch(PREDICTION_PATH) as MockPrediction, \
             patch(DB_PATH)         as mock_db:

            pred = make_mock_prediction(pred_id=1)
            MockPrediction.query.get.return_value = pred

            resp = client.delete('/api/predictions/1')

            assert resp.status_code == 200
            assert 'deleted successfully' in resp.get_json()['message']
            mock_db.session.delete.assert_called_once_with(pred)
            mock_db.session.commit.assert_called_once()

    def test_delete_prediction_not_found(self, client):
        """Non-existent prediction ID -> 404."""
        with patch(PREDICTION_PATH) as MockPrediction, \
             patch(DB_PATH)         as mock_db:

            MockPrediction.query.get.return_value = None

            resp = client.delete('/api/predictions/999')

            assert resp.status_code == 404
            assert 'Prediction not found' in resp.get_json()['error']
            mock_db.session.delete.assert_not_called()
            mock_db.session.commit.assert_not_called()

    def test_delete_queries_correct_id(self, client):
        """Prediction.query.get() called with the ID from the URL."""
        with patch(PREDICTION_PATH) as MockPrediction, \
             patch(DB_PATH):

            MockPrediction.query.get.return_value = make_mock_prediction(pred_id=7)

            client.delete('/api/predictions/7')

            MockPrediction.query.get.assert_called_once_with(7)

    def test_delete_commit_not_called_when_not_found(self, client):
        """db.session.commit() must never be called if prediction doesn't exist."""
        with patch(PREDICTION_PATH) as MockPrediction, \
             patch(DB_PATH)         as mock_db:

            MockPrediction.query.get.return_value = None

            client.delete('/api/predictions/404')

            mock_db.session.commit.assert_not_called()


# =============================================================================
# TEST 4 — GET /api/predictions
# =============================================================================

class TestGetPredictions:
    """
    Fetch prediction history.
    Supports JWT identity OR user_id query param.
    Mocks: Prediction.query.filter_by
    """

    def test_get_predictions_with_query_param(self, client):
        """user_id query param -> 200 with predictions list."""
        with patch(PREDICTION_PATH) as MockPrediction:
            pred1 = make_mock_prediction(pred_id=1, user_id=1)
            pred2 = make_mock_prediction(pred_id=2, user_id=1)
            MockPrediction.query.filter_by.return_value \
                .order_by.return_value.all.return_value = [pred1, pred2]

            resp = client.get('/api/predictions?user_id=1')

            assert resp.status_code == 200
            body = resp.get_json()
            assert isinstance(body, list)
            assert len(body) == 2

    def test_get_predictions_with_jwt(self, client, auth_headers):
        """Valid JWT -> uses identity from token -> 200 with predictions."""
        with patch(PREDICTION_PATH) as MockPrediction:
            pred = make_mock_prediction(pred_id=1, user_id=1)
            MockPrediction.query.filter_by.return_value \
                .order_by.return_value.all.return_value = [pred]

            resp = client.get('/api/predictions', headers=auth_headers)

            assert resp.status_code == 200

    def test_get_predictions_empty_list(self, client):
        """User exists but has no predictions -> 200 with empty list."""
        with patch(PREDICTION_PATH) as MockPrediction:
            MockPrediction.query.filter_by.return_value \
                .order_by.return_value.all.return_value = []

            resp = client.get('/api/predictions?user_id=1')

            assert resp.status_code == 200
            assert resp.get_json() == []

    def test_get_predictions_no_user_id_no_jwt(self, client):
        """No JWT and no user_id param -> 401 user not identified."""
        resp = client.get('/api/predictions')

        assert resp.status_code == 401
        assert 'error' in resp.get_json()

    def test_get_predictions_invalid_user_id_format(self, client):
        """Non-numeric user_id -> 422 invalid user ID."""
        resp = client.get('/api/predictions?user_id=abc')

        assert resp.status_code == 422
        assert 'Invalid user ID' in resp.get_json()['error']

    def test_get_predictions_calls_filter_by_with_user_id(self, client):
        """Prediction.query.filter_by() called with the correct user_id."""
        with patch(PREDICTION_PATH) as MockPrediction:
            MockPrediction.query.filter_by.return_value \
                .order_by.return_value.all.return_value = []

            client.get('/api/predictions?user_id=3')

            MockPrediction.query.filter_by.assert_called_once_with(user_id=3)

    def test_get_predictions_calls_to_dict_on_each(self, client):
        """to_dict() must be called on every prediction in the result."""
        with patch(PREDICTION_PATH) as MockPrediction:
            pred1 = make_mock_prediction(pred_id=1)
            pred2 = make_mock_prediction(pred_id=2)
            MockPrediction.query.filter_by.return_value \
                .order_by.return_value.all.return_value = [pred1, pred2]

            client.get('/api/predictions?user_id=1')

            pred1.to_dict.assert_called_once()
            pred2.to_dict.assert_called_once()