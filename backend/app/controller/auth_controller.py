from flask import Blueprint, request, jsonify
from .. import db
from ..models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth = Blueprint('auth', __name__)


@auth.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=email,
        name=data.get('name'),        
        phone=data.get('phone'),      
        location=data.get('location'))
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201


@auth.route('/login', methods=['POST'])
def login():
    """Login and return JWT token"""
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create JWT token (identity must be a string)
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


@auth.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info (requires valid token)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

@auth.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password are required'}), 400

    if not user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'}), 200


@auth.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)
    if not admin or admin.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    users = User.query.all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200


@auth.route('/admin/users/<int:target_id>', methods=['DELETE'])
@jwt_required()
def delete_user(target_id):
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)
    if not admin or admin.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    user = User.query.get(target_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.id == int(user_id):
        return jsonify({'error': 'Cannot delete your own account'}), 400
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200


@auth.route('/admin/users/<int:target_id>/role', methods=['PUT'])
@jwt_required()
def update_user_role(target_id):
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)
    if not admin or admin.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    user = User.query.get(target_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json() or {}
    new_role = data.get('role')
    if new_role not in ['user', 'admin']:
        return jsonify({'error': 'Invalid role'}), 400
    user.role = new_role
    db.session.commit()
    return jsonify({'message': 'Role updated', 'user': user.to_dict()}), 200


@auth.route('/admin/users/<int:target_id>', methods=['PUT'])
@jwt_required()
def admin_update_user(target_id):
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)
    if not admin or admin.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    user = User.query.get(target_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}

    if 'name' in data:
        user.name = data.get('name')
    if 'phone' in data:
        user.phone = data.get('phone')
    if 'location' in data:
        user.location = data.get('location')
    if 'email' in data:
        # check email not taken by another user
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != target_id:
            return jsonify({'error': 'Email already in use'}), 400
        user.email = data['email']

    db.session.commit()
    return jsonify({'message': 'User updated successfully', 'user': user.to_dict()}), 200


@auth.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    
    if 'name' in data:
        user.name = data.get('name')
    if 'phone' in data:
        user.phone = data.get('phone')
    if 'location' in data:
        user.location = data.get('location')

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200