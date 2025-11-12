from app import db
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    
    def set_password(self, password):
        """Hash and store password"""
        self.password_hash = pwd_context.hash(password)
    
    def check_password(self, password):
        """Verify password against hash"""
        return pwd_context.verify(password, self.password_hash)
    
    def to_dict(self):
        """Return user data as dict (safe for JSON)"""
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role
        }


class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    soil_ph = db.Column(db.Float, nullable=False)
    rainfall = db.Column(db.Float, nullable=False)
    field_area = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)

    predicted_yield_kg_ha = db.Column(db.Float)
    plough_depth_cm = db.Column(db.Float)
    soil_adjustment_kg_lime = db.Column(db.Float)
    seed_amount_kg = db.Column(db.Float)
    plant_spacing_cm = db.Column(db.Float)
    fertilizer_basal_urea_kg = db.Column(db.Float)
    fertilizer_basal_tsp_kg = db.Column(db.Float)
    fertilizer_basal_mop_kg = db.Column(db.Float)
    fertilizer_2nd_dose_urea_kg = db.Column(db.Float)
    fertilizer_2nd_dose_tsp_kg = db.Column(db.Float)
    fertilizer_2nd_dose_mop_kg = db.Column(db.Float)
    final_moisture_pct = db.Column(db.Float)

    plough_method = db.Column(db.String(50))
    irrigation_advice = db.Column(db.String(255))
    water_management_advice_stage4 = db.Column(db.String(255))
    tiller_increase_tip = db.Column(db.String(255))
    water_control_advice_stage5 = db.Column(db.String(255))
    water_control_advice_stage6 = db.Column(db.String(255))
    pesticide_suggestion = db.Column(db.String(255))
    water_level_advice_stage7 = db.Column(db.String(255))
    harvesting_date = db.Column(db.String(50))
    post_harvest_advice = db.Column(db.String(255))

    tsp_kg = db.Column(db.Float)
    mop_kg = db.Column(db.Float)
    urea_kg = db.Column(db.Float)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
