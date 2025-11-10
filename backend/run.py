from flask import Flask
from flask_cors import CORS
from app.controller.yield_controller import api # type: ignore

app = Flask(__name__)
CORS(app)

# Register blueprint
app.register_blueprint(api, url_prefix='/')  # Endpoint: /predict

if __name__ == "__main__":
    app.run(debug=True)
