from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # allow React frontend

    from app.controller.yield_controller import api
    app.register_blueprint(api)

    return app
