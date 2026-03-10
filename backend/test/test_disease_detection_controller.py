"""

"""

import pytest
import json
import io
from unittest.mock import patch, MagicMock, mock_open
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token


# PATCH PATHS

PREDICT_PATH      = 'app.controller.disease_detection_controller.predict_disease'
DISEASE_INFO_PATH = 'app.controller.disease_detection_controller.get_disease_info'
OS_REMOVE_PATH    = 'app.controller.disease_detection_controller.os.remove'
OS_PATH_JOIN_PATH = 'app.controller.disease_detection_controller.os.path.join'


# FIXTURES

@pytest.fixture(scope='session')
def app():
    """
    Minimal Flask app — no MySQL, no real services.
    Only the disease_detection blueprint is registered.
    predict_disease and get_disease_info are mocked per test.
    """
    flask_app = Flask(__name__)
    flask_app.config['TESTING']                        = True
    flask_app.config['JWT_SECRET_KEY']                 = 'test-secret-key'
    flask_app.config['SQLALCHEMY_DATABASE_URI']        = 'sqlite:///:memory:'
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    JWTManager(flask_app)

    # Mock service functions before importing blueprint
    with patch(PREDICT_PATH,      new=MagicMock()), \
         patch(DISEASE_INFO_PATH, new=MagicMock()):
        from app.controller.disease_detection_controller import api as disease_blueprint
        flask_app.register_blueprint(disease_blueprint, url_prefix='/api')

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
    """Authorization header for @jwt_required() routes."""
    return {'Authorization': f'Bearer {token}'}


# HELPER — build a fake image upload

def make_image_upload(filename='leaf.jpg', content=b'fake-image-bytes'):
    """
    Creates a fake file upload object for multipart/form-data requests.
    Flask test client accepts (BytesIO, filename) tuples in the 'data' dict.
    """
    return (io.BytesIO(content), filename)


def make_predict_success(disease='Bacterial Leaf Blight', confidence=0.95):
    """Returns a mock successful prediction result dict."""
    return {
        'success':    True,
        'disease':    disease,
        'confidence': confidence,
    }


def make_predict_failure(error='Model error'):
    """Returns a mock failed prediction result dict."""
    return {
        'success': False,
        'error':   error,
    }


def make_disease_info(disease='Bacterial Leaf Blight'):
    """Returns a mock disease info dict."""
    return {
        'name':        disease,
        'description': 'A bacterial infection affecting rice leaves.',
        'treatment':   'Apply copper-based fungicide.',
        'severity':    'High',
    }


# TEST 1 — GET /api/health

class TestHealthCheck:
    """
    Health check has no auth and no service calls.
    Just confirms the API is running.
    """

    def test_health_check_returns_200(self, client):
        """Health endpoint must return 200."""
        resp = client.get('/api/health')
        assert resp.status_code == 200

    def test_health_check_response_body(self, client):
        """Response must contain status key."""
        resp = client.get('/api/health')
        body = resp.get_json()
        assert 'status' in body

    def test_health_check_no_auth_required(self, client):
        """Health endpoint must work without any Authorization header."""
        resp = client.get('/api/health')
        # Must NOT return 401
        assert resp.status_code != 401

    def test_health_check_message_content(self, client):
        """Status message must mention DiseaseAPI."""
        resp = client.get('/api/health')
        body = resp.get_json()
        assert 'DiseaseAPI' in body.get('status', '')


# TEST 2 — POST /api/disease-detection-test  (no JWT)

class TestDetectDiseaseTest:
    """
    Test endpoint — no JWT required.
    Mocks: predict_disease, get_disease_info, os.remove, file.save
    """

    # ── PASS cases 

    def test_detect_test_success(self, client):
        """Valid image upload + successful prediction -> 200 with result."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH):

            mock_predict.return_value = make_predict_success()
            mock_info.return_value    = make_disease_info()

            resp = client.post(
                '/api/disease-detection-test',
                data={'image': make_image_upload('leaf.jpg')},
                content_type='multipart/form-data',
            )

            assert resp.status_code == 200
            body = resp.get_json()
            assert body['success']  == True
            assert body['disease']  == 'Bacterial Leaf Blight'
            assert 'info'           in body

    def test_detect_test_calls_predict_disease(self, client):
        """predict_disease() must be called exactly once per request."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH):

            mock_predict.return_value = make_predict_success()
            mock_info.return_value    = make_disease_info()

            client.post(
                '/api/disease-detection-test',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
            )

            mock_predict.assert_called_once()

    def test_detect_test_calls_get_disease_info_on_success(self, client):
        """get_disease_info() must be called with the predicted disease name."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH):

            mock_predict.return_value = make_predict_success(disease='Brown Spot')
            mock_info.return_value    = make_disease_info('Brown Spot')

            client.post(
                '/api/disease-detection-test',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
            )

            mock_info.assert_called_once_with('Brown Spot')

    def test_detect_test_cleans_up_temp_file(self, client):
        """os.remove() must be called to clean up the temporary file."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH)    as mock_remove:

            mock_predict.return_value = make_predict_success()
            mock_info.return_value    = make_disease_info()

            client.post(
                '/api/disease-detection-test',
                data={'image': make_image_upload('leaf.jpg')},
                content_type='multipart/form-data',
            )

            mock_remove.assert_called_once()

    def test_detect_test_no_auth_needed(self, client):
        """This test endpoint must work WITHOUT an Authorization header."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH):

            mock_predict.return_value = make_predict_success()
            mock_info.return_value    = make_disease_info()

            resp = client.post(
                '/api/disease-detection-test',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
            )

            assert resp.status_code != 401

    def test_detect_test_prediction_failed(self, client):
        """predict_disease returns success=False -> response must reflect failure."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH):

            mock_predict.return_value = make_predict_failure('Model load error')
            mock_info.return_value    = None

            resp = client.post(
                '/api/disease-detection-test',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
            )

            body = resp.get_json()
            assert body['success'] == False
            # get_disease_info must NOT be called when prediction fails
            mock_info.assert_not_called()

    # ── FAIL cases 

    def test_detect_test_no_image_field(self, client):
        """Request without 'image' field -> 400."""
        resp = client.post(
            '/api/disease-detection-test',
            data={'wrong_field': (io.BytesIO(b'data'), 'leaf.jpg')},
            content_type='multipart/form-data',
        )
        assert resp.status_code == 400
        body = resp.get_json()
        assert body['success'] == False
        assert 'No image file provided' in body['error']

    def test_detect_test_empty_body(self, client):
        """No files in request at all -> 400."""
        resp = client.post(
            '/api/disease-detection-test',
            content_type='multipart/form-data',
        )
        assert resp.status_code == 400
        assert resp.get_json()['success'] == False

    def test_detect_test_service_exception(self, client):
        """predict_disease throws an exception -> 500 with error message."""
        with patch(PREDICT_PATH)   as mock_predict, \
             patch(OS_REMOVE_PATH):

            mock_predict.side_effect = Exception('Unexpected model crash')

            resp = client.post(
                '/api/disease-detection-test',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
            )

            assert resp.status_code == 500
            body = resp.get_json()
            assert body['success'] == False
            assert 'Unexpected model crash' in body['error']

    def test_detect_test_temp_file_removal_failure_does_not_crash(self, client):
        """
        If os.remove() raises an exception the route must still
        return a valid response (graceful degradation).
        """
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH)    as mock_remove:

            mock_predict.return_value = make_predict_success()
            mock_info.return_value    = make_disease_info()
            # Simulate temp file already deleted / permission error
            mock_remove.side_effect   = OSError('File locked')

            resp = client.post(
                '/api/disease-detection-test',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
            )

            # Route must still succeed despite cleanup failure
            assert resp.status_code == 200
            assert resp.get_json()['success'] == True


# TEST 3 — POST /api/disease-detection  (JWT required)

class TestDetectDisease:
    """
    Production endpoint — JWT required.
    Mirrors TestDetectDiseaseTest but adds auth-related tests.
    """

    # ── PASS cases 

    def test_detect_success(self, client, auth_headers):
        """Valid token + image -> 200 with prediction result and info."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH):

            mock_predict.return_value = make_predict_success('Leaf Smut', 0.88)
            mock_info.return_value    = make_disease_info('Leaf Smut')

            resp = client.post(
                '/api/disease-detection',
                data={'image': make_image_upload('rice.jpg')},
                content_type='multipart/form-data',
                headers=auth_headers,
            )

            assert resp.status_code == 200
            body = resp.get_json()
            assert body['success']  == True
            assert body['disease']  == 'Leaf Smut'
            assert 'info'           in body

    def test_detect_calls_predict_once(self, client, auth_headers):
        """predict_disease() called exactly once per request."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH):

            mock_predict.return_value = make_predict_success()
            mock_info.return_value    = make_disease_info()

            client.post(
                '/api/disease-detection',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
                headers=auth_headers,
            )

            mock_predict.assert_called_once()

    def test_detect_calls_disease_info_with_correct_name(self, client, auth_headers):
        """get_disease_info() receives the disease name from prediction result."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH):

            mock_predict.return_value = make_predict_success('Brown Spot')
            mock_info.return_value    = make_disease_info('Brown Spot')

            client.post(
                '/api/disease-detection',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
                headers=auth_headers,
            )

            mock_info.assert_called_once_with('Brown Spot')

    def test_detect_cleans_up_temp_file(self, client, auth_headers):
        """Temp file must be deleted after prediction."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH)    as mock_remove:

            mock_predict.return_value = make_predict_success()
            mock_info.return_value    = make_disease_info()

            client.post(
                '/api/disease-detection',
                data={'image': make_image_upload('leaf.jpg')},
                content_type='multipart/form-data',
                headers=auth_headers,
            )

            mock_remove.assert_called_once()

    def test_detect_prediction_failed(self, client, auth_headers):
        """predict_disease returns success=False -> failure response, no disease info."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH):

            mock_predict.return_value = make_predict_failure('Low confidence')
            mock_info.return_value    = None

            resp = client.post(
                '/api/disease-detection',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
                headers=auth_headers,
            )

            body = resp.get_json()
            assert body['success'] == False
            mock_info.assert_not_called()

    def test_detect_temp_cleanup_failure_does_not_crash(self, client, auth_headers):
        """os.remove() failure must not affect the response."""
        with patch(PREDICT_PATH)      as mock_predict, \
             patch(DISEASE_INFO_PATH) as mock_info,    \
             patch(OS_REMOVE_PATH)    as mock_remove:

            mock_predict.return_value = make_predict_success()
            mock_info.return_value    = make_disease_info()
            mock_remove.side_effect   = OSError('Permission denied')

            resp = client.post(
                '/api/disease-detection',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
                headers=auth_headers,
            )

            assert resp.status_code == 200
            assert resp.get_json()['success'] == True

    # ── FAIL cases 

    def test_detect_no_token(self, client):
        """No JWT -> 401 before any logic runs."""
        resp = client.post(
            '/api/disease-detection',
            data={'image': make_image_upload()},
            content_type='multipart/form-data',
        )
        assert resp.status_code == 401

    def test_detect_invalid_token(self, client):
        """Garbage token -> 401 or 422."""
        resp = client.post(
            '/api/disease-detection',
            data={'image': make_image_upload()},
            content_type='multipart/form-data',
            headers={'Authorization': 'Bearer fake.token.value'},
        )
        assert resp.status_code in (401, 422)

    def test_detect_no_image_field(self, client, auth_headers):
        """Request without 'image' field -> 400."""
        resp = client.post(
            '/api/disease-detection',
            data={'wrong_key': (io.BytesIO(b'data'), 'leaf.jpg')},
            content_type='multipart/form-data',
            headers=auth_headers,
        )
        assert resp.status_code == 400
        body = resp.get_json()
        assert body['success'] == False
        assert 'No image file provided' in body['error']

    def test_detect_empty_request(self, client, auth_headers):
        """No files in body at all -> 400."""
        resp = client.post(
            '/api/disease-detection',
            content_type='multipart/form-data',
            headers=auth_headers,
        )
        assert resp.status_code == 400
        assert resp.get_json()['success'] == False

    def test_detect_service_exception(self, client, auth_headers):
        """predict_disease throws -> 500 with error field."""
        with patch(PREDICT_PATH)   as mock_predict, \
             patch(OS_REMOVE_PATH):

            mock_predict.side_effect = Exception('GPU out of memory')

            resp = client.post(
                '/api/disease-detection',
                data={'image': make_image_upload()},
                content_type='multipart/form-data',
                headers=auth_headers,
            )

            assert resp.status_code == 500
            body = resp.get_json()
            assert body['success'] == False
            assert 'GPU out of memory' in body['error']

    def test_detect_no_image_info_not_called_on_missing_file(self, client, auth_headers):
        """get_disease_info must never be called when no image was provided."""
        with patch(DISEASE_INFO_PATH) as mock_info:
            client.post(
                '/api/disease-detection',
                content_type='multipart/form-data',
                headers=auth_headers,
            )
            mock_info.assert_not_called()


# TEST 4 — GET /api/disease-info/<disease_name>  (JWT required)

class TestGetDiseaseDetails:
    """
    Fetch info for a named disease.
    Mocks: get_disease_info
    """

    # ── PASS cases 

    def test_get_disease_info_success(self, client, auth_headers):
        """Known disease name -> 200 with disease + info keys."""
        with patch(DISEASE_INFO_PATH) as mock_info:
            mock_info.return_value = make_disease_info('Bacterial Leaf Blight')

            resp = client.get(
                '/api/disease-info/Bacterial Leaf Blight',
                headers=auth_headers,
            )

            assert resp.status_code == 200
            body = resp.get_json()
            assert 'disease' in body
            assert 'info'    in body
            assert body['disease'] == 'Bacterial Leaf Blight'

    def test_get_disease_info_calls_service_with_name(self, client, auth_headers):
        """get_disease_info() must be called with the URL path parameter."""
        with patch(DISEASE_INFO_PATH) as mock_info:
            mock_info.return_value = make_disease_info('Brown Spot')

            client.get('/api/disease-info/Brown Spot', headers=auth_headers)

            mock_info.assert_called_once_with('Brown Spot')

    def test_get_disease_info_leaf_smut(self, client, auth_headers):
        """Works for all three supported disease classes."""
        with patch(DISEASE_INFO_PATH) as mock_info:
            mock_info.return_value = make_disease_info('Leaf Smut')

            resp = client.get(
                '/api/disease-info/Leaf Smut',
                headers=auth_headers,
            )

            assert resp.status_code == 200
            assert resp.get_json()['disease'] == 'Leaf Smut'

    # ── FAIL cases 

    def test_get_disease_info_not_found(self, client, auth_headers):
        """Unknown disease name -> get_disease_info returns None -> 404."""
        with patch(DISEASE_INFO_PATH) as mock_info:
            mock_info.return_value = None   # simulate unknown disease

            resp = client.get(
                '/api/disease-info/UnknownDisease',
                headers=auth_headers,
            )

            assert resp.status_code == 404
            assert 'Disease not found' in resp.get_json()['error']

    def test_get_disease_info_no_token(self, client):
        """No JWT -> 401."""
        resp = client.get('/api/disease-info/Brown Spot')
        assert resp.status_code == 401

    def test_get_disease_info_invalid_token(self, client):
        """Garbage token -> 401 or 422."""
        resp = client.get(
            '/api/disease-info/Brown Spot',
            headers={'Authorization': 'Bearer not.valid.token'},
        )
        assert resp.status_code in (401, 422)

    def test_get_disease_info_service_exception(self, client, auth_headers):
        """get_disease_info throws -> 500 with error message."""
        with patch(DISEASE_INFO_PATH) as mock_info:
            mock_info.side_effect = Exception('Database read error')

            resp = client.get(
                '/api/disease-info/Brown Spot',
                headers=auth_headers,
            )

            assert resp.status_code == 500
            assert 'Database read error' in resp.get_json()['error']

    def test_get_disease_info_called_once_per_request(self, client, auth_headers):
        """get_disease_info() must be called exactly once per GET request."""
        with patch(DISEASE_INFO_PATH) as mock_info:
            mock_info.return_value = make_disease_info('Brown Spot')

            client.get('/api/disease-info/Brown Spot', headers=auth_headers)

            mock_info.assert_called_once()
