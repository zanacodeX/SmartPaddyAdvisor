from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Configuration from environment variables
    mysql_user = os.getenv('MYSQL_USER', 'root')
    mysql_password = os.getenv('MYSQL_PASSWORD', '')
    mysql_host = os.getenv('MYSQL_HOST', 'localhost')
    mysql_db = os.getenv('MYSQL_DB', 'smartpaddy')
    
    # Database URI for MySQL
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_db}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # JWT configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # Register blueprints
    from app.controller.yield_controller import api as yield_api
    from app.controller.auth_controller import auth as auth_api
    
    app.register_blueprint(yield_api)
    app.register_blueprint(auth_api, url_prefix='/auth')
    
    # Create database tables and seed admin
    with app.app_context():
        from app.models import User
        db.create_all()
        
        # Seed admin user if no users exist
        if User.query.count() == 0:
            admin = User(
                email=os.getenv('ADMIN_EMAIL', 'admin@example.com'),
                role='admin'
            )
            admin.set_password(os.getenv('ADMIN_PASSWORD', 'Password123'))
            db.session.add(admin)
            db.session.commit()
            print(f"✓ Seeded admin user: {admin.email}")
    
    return app