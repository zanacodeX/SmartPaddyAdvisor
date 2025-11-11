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