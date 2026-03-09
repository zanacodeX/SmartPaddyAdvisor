"""
tests/test_auth_controller.py
==============================
Fix: The previous version tried to call create_app() which connects to MySQL.
Solution: Build a FRESH minimal Flask app in the fixture — never call create_app().
          This means zero MySQL dependency. All tests run with SQLite in-memory.

Patch paths match your layout:
    app/controller/auth_controller.py  imports:
        from .. import db          -> app.controller.auth_controller.db
        from ..models import User  -> app.controller.auth_controller.User
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture(scope='session')
def app():
    """
    Build a brand-new minimal Flask app — completely independent of create_app().

    WHY: create_app() hard-wires MySQL. Calling it (even with env overrides)
    triggers a real TCP connection before our mocks are active.

    HOW: We create a throwaway Flask app, register ONLY the auth blueprint,
    and use SQLite in-memory so no database server is needed at all.
    """
    flask_app = Flask(__name__)
    flask_app.config['TESTING']                      = True
    flask_app.config['JWT_SECRET_KEY']               = 'test-secret-key-for-pytest'
    flask_app.config['SQLALCHEMY_DATABASE_URI']      = 'sqlite:///:memory:'
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Wire up JWT (real — needed to generate/validate tokens in tests)
    JWTManager(flask_app)

    # Wire up SQLAlchemy to the test app so the blueprint import works
    test_db = SQLAlchemy(flask_app)

    # ── Patch db + User BEFORE importing the blueprint ──────────────────────
    # This stops the blueprint from touching any real database at import time.
    with patch('app.controller.auth_controller.db',   new=MagicMock()), \
         patch('app.controller.auth_controller.User', new=MagicMock()):
        from app.controller.auth_controller import auth as auth_blueprint
        flask_app.register_blueprint(auth_blueprint, url_prefix='/auth')

    return flask_app


@pytest.fixture
def client(app):
    """Standard Flask test client — simulates real HTTP requests."""
    return app.test_client()


@pytest.fixture
def token(app):
    """
    Generate a valid JWT for user id = '1'.
    Used by all routes protected with @jwt_required().
    """
    with app.app_context():
        return create_access_token(identity='1')


@pytest.fixture
def auth_headers(token):
    """Pre-built request headers: JWT Bearer token + JSON content-type."""
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type':  'application/json',
    }


# =============================================================================
# MOCK USER FACTORY
# =============================================================================

def make_mock_user(
    user_id     = 1,
    email       = 'test@example.com',
    name        = 'Test User',
    phone       = '0771234567',
    location    = 'Colombo',
    role        = 'user',
    password_ok = True,
):
    """
    Returns a MagicMock that behaves exactly like a real User model instance.
    Pre-wires every attribute and method that auth_controller.py touches.

    Usage:
        user = make_mock_user(password_ok=False)
        MockUser.query.get.return_value = user
    """
    user = MagicMock(name='MockUser')
    user.id       = user_id
    user.email    = email
    user.name     = name
    user.phone    = phone
    user.location = location
    user.role     = role

    # check_password('plain') -> True/False based on password_ok param
    user.check_password = MagicMock(return_value=password_ok)

    # set_password('plain') -> void, but records call for assertion
    user.set_password   = MagicMock()

    # to_dict() -> plain dict (what the route puts in the JSON response)
    user.to_dict = MagicMock(return_value={
        'id':       user_id,
        'email':    email,
        'name':     name,
        'phone':    phone,
        'location': location,
        'role':     role,
    })
    return user


# =============================================================================
# REQUEST HELPERS
# =============================================================================

def post_json(client, url, data, headers=None):
    """POST request with a JSON body."""
    return client.post(
        url,
        data=json.dumps(data),
        headers=headers or {'Content-Type': 'application/json'},
    )


def put_json(client, url, data, headers):
    """PUT request with a JSON body + auth headers."""
    return client.put(
        url,
        data=json.dumps(data),
        headers=headers,
    )


# =============================================================================
# SHARED PATCH PATHS  ← update these if your folder/file names differ
# =============================================================================

USER_PATH = 'app.controller.auth_controller.User'
DB_PATH   = 'app.controller.auth_controller.db'


# =============================================================================
# TEST 1 — POST /auth/register
# =============================================================================

class TestRegister:

    def test_register_success_all_fields(self, client):
        """All fields supplied, email is new -> 201, db.add + db.commit called."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            MockUser.query.filter_by.return_value.first.return_value = None
            new_user = make_mock_user()
            MockUser.return_value = new_user

            resp = post_json(client, '/auth/register', {
                'email':    'alice@smartpaddy.com',
                'password': 'secure123',
                'name':     'Alice',
                'phone':    '0770001111',
                'location': 'Kandy',
            })

            assert resp.status_code == 201
            assert resp.get_json()['message'] == 'User registered successfully'
            mock_db.session.add.assert_called_once_with(new_user)
            mock_db.session.commit.assert_called_once()

    def test_register_success_minimum_fields(self, client):
        """Only email + password (optional fields absent) -> 201."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            MockUser.query.filter_by.return_value.first.return_value = None
            MockUser.return_value = make_mock_user()

            resp = post_json(client, '/auth/register', {
                'email': 'bob@smartpaddy.com', 'password': 'pass1234'
            })

            assert resp.status_code == 201
            mock_db.session.commit.assert_called_once()

    def test_register_missing_email(self, client):
        """No email -> 400, DB never touched."""
        with patch(DB_PATH) as mock_db:
            resp = post_json(client, '/auth/register', {'password': 'pass123'})

            assert resp.status_code == 400
            assert 'Email and password required' in resp.get_json()['error']
            mock_db.session.commit.assert_not_called()

    def test_register_missing_password(self, client):
        """No password -> 400, DB never touched."""
        with patch(DB_PATH) as mock_db:
            resp = post_json(client, '/auth/register', {'email': 'a@b.com'})

            assert resp.status_code == 400
            assert 'Email and password required' in resp.get_json()['error']
            mock_db.session.commit.assert_not_called()

    def test_register_empty_body(self, client):
        """Empty JSON -> 400."""
        resp = post_json(client, '/auth/register', {})
        assert resp.status_code == 400

    def test_register_duplicate_email(self, client):
        """Existing email -> 400, no INSERT attempted."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            MockUser.query.filter_by.return_value.first.return_value = make_mock_user()

            resp = post_json(client, '/auth/register', {
                'email': 'test@example.com', 'password': 'anypass'
            })

            assert resp.status_code == 400
            assert 'already registered' in resp.get_json()['error']
            mock_db.session.add.assert_not_called()
            mock_db.session.commit.assert_not_called()

    def test_register_filter_by_uses_correct_email(self, client):
        """Duplicate check must query the exact email from the payload."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH):
            MockUser.query.filter_by.return_value.first.return_value = None
            MockUser.return_value = make_mock_user()

            post_json(client, '/auth/register', {
                'email': 'check@smartpaddy.com', 'password': 'pass'
            })

            MockUser.query.filter_by.assert_called_with(email='check@smartpaddy.com')

    def test_register_password_not_stored_plain(self, client):
        """set_password() must be called — password must never be stored raw."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH):
            MockUser.query.filter_by.return_value.first.return_value = None
            user_instance = make_mock_user()
            MockUser.return_value = user_instance

            post_json(client, '/auth/register', {
                'email': 'sec@test.com', 'password': 'myplaintext'
            })

            user_instance.set_password.assert_called_once_with('myplaintext')


# =============================================================================
# TEST 2 — POST /auth/login
# =============================================================================

class TestLogin:

    def test_login_success(self, client):
        """Valid credentials -> 200 with access_token + user dict."""
        with patch(USER_PATH) as MockUser:
            user = make_mock_user(password_ok=True)
            MockUser.query.filter_by.return_value.first.return_value = user

            resp = post_json(client, '/auth/login', {
                'email': 'test@example.com', 'password': 'correctpass'
            })

            assert resp.status_code == 200
            body = resp.get_json()
            assert 'access_token' in body
            assert 'user'         in body
            assert body['user']['email'] == 'test@example.com'
            user.check_password.assert_called_once_with('correctpass')
            user.to_dict.assert_called_once()

    def test_login_token_is_valid_jwt(self, client):
        """access_token must be a real 3-part JWT string."""
        with patch(USER_PATH) as MockUser:
            MockUser.query.filter_by.return_value.first.return_value = make_mock_user()

            resp = post_json(client, '/auth/login', {
                'email': 'test@example.com', 'password': 'pass'
            })
            token = resp.get_json().get('access_token', '')

            assert isinstance(token, str)
            assert len(token)        > 20   # JWTs are always long
            assert token.count('.') == 2    # header.payload.signature

    def test_login_missing_email(self, client):
        """No email -> 400, User.query never called."""
        with patch(USER_PATH) as MockUser:
            resp = post_json(client, '/auth/login', {'password': 'pass'})
            assert resp.status_code == 400
            MockUser.query.filter_by.assert_not_called()

    def test_login_missing_password(self, client):
        """No password -> 400, User.query never called."""
        with patch(USER_PATH) as MockUser:
            resp = post_json(client, '/auth/login', {'email': 'a@b.com'})
            assert resp.status_code == 400
            MockUser.query.filter_by.assert_not_called()

    def test_login_user_not_found(self, client):
        """filter_by().first() returns None -> 401."""
        with patch(USER_PATH) as MockUser:
            MockUser.query.filter_by.return_value.first.return_value = None

            resp = post_json(client, '/auth/login', {
                'email': 'ghost@smartpaddy.com', 'password': 'pass'
            })

            assert resp.status_code == 401
            assert 'Invalid email or password' in resp.get_json()['error']

    def test_login_wrong_password(self, client):
        """User exists but check_password False -> 401."""
        with patch(USER_PATH) as MockUser:
            MockUser.query.filter_by.return_value.first.return_value = \
                make_mock_user(password_ok=False)

            resp = post_json(client, '/auth/login', {
                'email': 'test@example.com', 'password': 'wrongpass'
            })

            assert resp.status_code == 401
            assert 'Invalid email or password' in resp.get_json()['error']

    def test_login_jwt_identity_is_string_not_int(self, client):
        """
        Route calls create_access_token(identity=str(user.id)).
        Patch it to assert the argument is '42' (string) not 42 (int).
        """
        with patch(USER_PATH) as MockUser, \
             patch('app.controller.auth_controller.create_access_token') as mock_jwt:

            MockUser.query.filter_by.return_value.first.return_value = \
                make_mock_user(user_id=42)
            mock_jwt.return_value = 'fake.jwt.token'

            post_json(client, '/auth/login', {
                'email': 'test@example.com', 'password': 'pass'
            })

            mock_jwt.assert_called_once_with(identity='42')


# =============================================================================
# TEST 3 — GET /auth/me
# =============================================================================

class TestGetCurrentUser:

    def test_get_me_success(self, client, auth_headers):
        """Valid token + user in DB -> 200 with user dict."""
        with patch(USER_PATH) as MockUser:
            user = make_mock_user()
            MockUser.query.get.return_value = user

            resp = client.get('/auth/me', headers=auth_headers)

            assert resp.status_code == 200
            assert 'user' in resp.get_json()
            user.to_dict.assert_called_once()

    def test_get_me_queries_with_jwt_identity(self, client, auth_headers):
        """User.query.get() must receive '1' — the identity baked into the token."""
        with patch(USER_PATH) as MockUser:
            MockUser.query.get.return_value = make_mock_user()

            client.get('/auth/me', headers=auth_headers)

            MockUser.query.get.assert_called_once_with('1')

    def test_get_me_no_token(self, client):
        """No Authorization header -> 401."""
        resp = client.get('/auth/me')
        assert resp.status_code == 401

    def test_get_me_malformed_token(self, client):
        """Garbage token string -> 401 or 422."""
        resp = client.get('/auth/me',
                          headers={'Authorization': 'Bearer this.is.garbage'})
        assert resp.status_code in (401, 422)

    def test_get_me_user_deleted_from_db(self, client, auth_headers):
        """Token valid but User.query.get returns None -> 404."""
        with patch(USER_PATH) as MockUser:
            MockUser.query.get.return_value = None

            resp = client.get('/auth/me', headers=auth_headers)

            assert resp.status_code == 404
            assert 'User not found' in resp.get_json()['error']


# =============================================================================
# TEST 4 — PUT /auth/change-password
# =============================================================================

class TestChangePassword:

    def test_change_password_success(self, client, auth_headers):
        """Correct current + valid new password -> 200, set_password + commit called."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            user = make_mock_user(password_ok=True)
            MockUser.query.get.return_value = user

            resp = put_json(client, '/auth/change-password', {
                'currentPassword': 'OldPass123',
                'newPassword':     'NewPass456',
            }, auth_headers)

            assert resp.status_code == 200
            assert 'Password changed successfully' in resp.get_json()['message']
            user.set_password.assert_called_once_with('NewPass456')
            mock_db.session.commit.assert_called_once()

    def test_change_password_boundary_exactly_6_chars(self, client, auth_headers):
        """Exactly 6 chars is the minimum allowed — must return 200."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH):
            MockUser.query.get.return_value = make_mock_user(password_ok=True)

            resp = put_json(client, '/auth/change-password', {
                'currentPassword': 'oldpass',
                'newPassword':     'abc123',   # exactly 6
            }, auth_headers)

            assert resp.status_code == 200

    def test_change_password_5_chars_rejected(self, client, auth_headers):
        """5 chars is below minimum — must return 400, nothing saved."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            user = make_mock_user(password_ok=True)
            MockUser.query.get.return_value = user

            resp = put_json(client, '/auth/change-password', {
                'currentPassword': 'oldpass',
                'newPassword':     '12345',    # 5 chars
            }, auth_headers)

            assert resp.status_code == 400
            assert 'at least 6 characters' in resp.get_json()['error']
            user.set_password.assert_not_called()
            mock_db.session.commit.assert_not_called()

    def test_change_password_wrong_current(self, client, auth_headers):
        """Wrong current password -> 401, set_password + commit NOT called."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            user = make_mock_user(password_ok=False)
            MockUser.query.get.return_value = user

            resp = put_json(client, '/auth/change-password', {
                'currentPassword': 'wrongpass',
                'newPassword':     'newpass456',
            }, auth_headers)

            assert resp.status_code == 401
            assert 'Current password is incorrect' in resp.get_json()['error']
            user.set_password.assert_not_called()
            mock_db.session.commit.assert_not_called()

    def test_change_password_missing_current(self, client, auth_headers):
        """currentPassword absent -> 400."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            MockUser.query.get.return_value = make_mock_user()

            resp = put_json(client, '/auth/change-password',
                            {'newPassword': 'newpass456'}, auth_headers)

            assert resp.status_code == 400
            mock_db.session.commit.assert_not_called()

    def test_change_password_missing_new(self, client, auth_headers):
        """newPassword absent -> 400."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            MockUser.query.get.return_value = make_mock_user()

            resp = put_json(client, '/auth/change-password',
                            {'currentPassword': 'oldpass'}, auth_headers)

            assert resp.status_code == 400
            mock_db.session.commit.assert_not_called()

    def test_change_password_no_token(self, client):
        """No JWT -> 401 before route logic runs."""
        resp = client.put(
            '/auth/change-password',
            data=json.dumps({'currentPassword': 'a', 'newPassword': 'b'}),
            content_type='application/json',
        )
        assert resp.status_code == 401

    def test_change_password_user_not_found(self, client, auth_headers):
        """Token valid but user missing from DB -> 404."""
        with patch(USER_PATH) as MockUser:
            MockUser.query.get.return_value = None

            resp = put_json(client, '/auth/change-password', {
                'currentPassword': 'old', 'newPassword': 'newpass1'
            }, auth_headers)

            assert resp.status_code == 404
            assert 'User not found' in resp.get_json()['error']


# =============================================================================
# TEST 5 — PUT /auth/update-profile
# =============================================================================

class TestUpdateProfile:

    def test_update_all_fields(self, client, auth_headers):
        """All three fields -> 200, user attributes mutated, commit called."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            user = make_mock_user()
            MockUser.query.get.return_value = user

            resp = put_json(client, '/auth/update-profile', {
                'name': 'Updated Name', 'phone': '0779999999', 'location': 'Galle'
            }, auth_headers)

            assert resp.status_code == 200
            assert resp.get_json()['message'] == 'Profile updated successfully'
            assert user.name     == 'Updated Name'
            assert user.phone    == '0779999999'
            assert user.location == 'Galle'
            mock_db.session.commit.assert_called_once()
            user.to_dict.assert_called_once()

    def test_update_only_name_leaves_others_unchanged(self, client, auth_headers):
        """Only name in payload — phone + location must stay original."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH):
            user = make_mock_user(phone='0771234567', location='Colombo')
            MockUser.query.get.return_value = user

            put_json(client, '/auth/update-profile',
                     {'name': 'New Name Only'}, auth_headers)

            assert user.name     == 'New Name Only'
            assert user.phone    == '0771234567'   # unchanged
            assert user.location == 'Colombo'      # unchanged

    def test_update_only_phone_leaves_others_unchanged(self, client, auth_headers):
        """Only phone in payload — name + location must stay original."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH):
            user = make_mock_user(name='Original Name', location='Colombo')
            MockUser.query.get.return_value = user

            put_json(client, '/auth/update-profile',
                     {'phone': '0700000000'}, auth_headers)

            assert user.phone    == '0700000000'
            assert user.name     == 'Original Name'  # unchanged
            assert user.location == 'Colombo'         # unchanged

    def test_update_only_location_leaves_others_unchanged(self, client, auth_headers):
        """Only location in payload — name + phone must stay original."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH):
            user = make_mock_user(name='Original Name', phone='0771234567')
            MockUser.query.get.return_value = user

            put_json(client, '/auth/update-profile',
                     {'location': 'Jaffna'}, auth_headers)

            assert user.location == 'Jaffna'
            assert user.name     == 'Original Name'  # unchanged
            assert user.phone    == '0771234567'      # unchanged

    def test_update_empty_payload_still_returns_200(self, client, auth_headers):
        """Empty payload is valid — nothing to change, still 200 + commit."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            MockUser.query.get.return_value = make_mock_user()

            resp = put_json(client, '/auth/update-profile', {}, auth_headers)

            assert resp.status_code == 200
            mock_db.session.commit.assert_called_once()

    def test_update_no_token(self, client):
        """No JWT -> 401, DB never queried."""
        with patch(USER_PATH) as MockUser:
            resp = client.put(
                '/auth/update-profile',
                data=json.dumps({'name': 'Hacker'}),
                content_type='application/json',
            )
            assert resp.status_code == 401
            MockUser.query.get.assert_not_called()

    def test_update_user_not_found(self, client, auth_headers):
        """Token valid but no user in DB -> 404, commit never called."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH) as mock_db:
            MockUser.query.get.return_value = None

            resp = put_json(client, '/auth/update-profile',
                            {'name': 'Ghost'}, auth_headers)

            assert resp.status_code == 404
            assert 'User not found' in resp.get_json()['error']
            mock_db.session.commit.assert_not_called()

    def test_update_query_get_uses_jwt_identity(self, client, auth_headers):
        """User.query.get() must be called with the JWT identity string '1'."""
        with patch(USER_PATH) as MockUser, patch(DB_PATH):
            MockUser.query.get.return_value = make_mock_user()

            put_json(client, '/auth/update-profile',
                     {'name': 'Check Identity'}, auth_headers)

            MockUser.query.get.assert_called_once_with('1')

    def test_update_email_field_in_payload_is_ignored(self, client, auth_headers):
        """
        Security: route only handles name/phone/location.
        Sending 'email' in payload must NOT change user.email.
        """
        with patch(USER_PATH) as MockUser, patch(DB_PATH):
            user = make_mock_user(email='original@smartpaddy.com')
            MockUser.query.get.return_value = user

            put_json(client, '/auth/update-profile', {
                'name':  'Legit Update',
                'email': 'attacker@evil.com',   # must be ignored
            }, auth_headers)

            assert user.email == 'original@smartpaddy.com'