# routes/auth_routes.py — register / login / me

import uuid
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, g
from pymongo.errors import DuplicateKeyError, PyMongoError
from werkzeug.security import generate_password_hash, check_password_hash

import database
from auth_utils import (
    make_token, validate_signup, public_user, login_required
)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def _fail(message, status):
    return jsonify({'success': False, 'message': message}), status


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get('username', '')).strip()
    email = str(data.get('email', '')).strip()
    password = str(data.get('password', ''))

    error = validate_signup(username, email, password)
    if error:
        return _fail(error, 400)

    user = {
        '_id': uuid.uuid4().hex,
        'username': username,
        'username_lower': username.lower(),
        'email': email,
        'email_lower': email.lower(),
        'password_hash': generate_password_hash(password),  # never store the real password
        'created_at': datetime.now(timezone.utc).isoformat(),
        'game': None,   # Phase 2: the player's game data will be saved here
    }

    try:
        database.get_db().users.insert_one(user)
    except DuplicateKeyError:
        return _fail('That username or email is already registered.', 409)
    except PyMongoError:
        return _fail('Database error. Please try again.', 503)

    return jsonify({
        'success': True,
        'token': make_token(user['_id']),
        'user': public_user(user),
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    identifier = str(data.get('username', '')).strip().lower()  # username OR email
    password = str(data.get('password', ''))

    if not identifier or not password:
        return _fail('Please enter both fields.', 400)

    field = 'email_lower' if '@' in identifier else 'username_lower'
    try:
        user = database.get_db().users.find_one({field: identifier})
    except PyMongoError:
        return _fail('Database error. Please try again.', 503)

    # Same message for "no such user" and "wrong password" (do not reveal which)
    if not user or not check_password_hash(user['password_hash'], password):
        return _fail('Invalid username or password.', 401)

    return jsonify({
        'success': True,
        'token': make_token(user['_id']),
        'user': public_user(user),
    }), 200


@auth_bp.route('/me', methods=['GET'])
@login_required
def me():
    return jsonify({'success': True, 'user': public_user(g.user)}), 200