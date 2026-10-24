# auth_utils.py — password rules, login tokens and the @login_required guard
#
# Tokens are signed with SECRET_KEY (itsdangerous, installed with Flask),
# so nobody can fake one. The browser sends it as:  Authorization: Bearer <token>

import re
from functools import wraps

from flask import request, jsonify, g
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

import config
import database

USERNAME_RE = re.compile(r'^[A-Za-z0-9_]{3,20}$')
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def _serializer():
    return URLSafeTimedSerializer(config.SECRET_KEY, salt='ascendent-auth')


def make_token(user_id):
    return _serializer().dumps({'uid': user_id})


def read_token(token):
    """Returns the user id inside a valid token, or None."""
    try:
        data = _serializer().loads(token, max_age=config.TOKEN_MAX_AGE_DAYS * 86400)
        return data.get('uid')
    except (BadSignature, SignatureExpired):
        return None


def validate_signup(username, email, password):
    """Returns an error message, or None if everything is fine."""
    if not USERNAME_RE.match(username):
        return 'Username must be 3-20 characters: letters, numbers or underscore.'
    if not EMAIL_RE.match(email):
        return 'Please enter a valid email address.'
    if len(password) < 8:
        return 'Password must be at least 8 characters.'
    return None


def public_user(user):
    """The only user fields that are ever sent to the browser (never the hash)."""
    return {
        'id': user['_id'],
        'username': user['username'],
        'email': user['email'],
        'created_at': user['created_at'],
    }


def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        header = request.headers.get('Authorization', '')
        token = header[7:] if header.startswith('Bearer ') else ''
        uid = read_token(token) if token else None
        user = database.get_db().users.find_one({'_id': uid}) if uid else None
        if not user:
            return jsonify({'success': False, 'message': 'Please log in again.'}), 401
        g.user = user
        return view(*args, **kwargs)
    return wrapper