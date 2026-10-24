# app.py — Ascendent server (the ONLY backend file you need right now)
#
# Run:   python3 app.py
# Open:  http://localhost:5001
#
# It serves the frontend files AND the /api/login endpoint.
# CORS headers are added, so login also works if you open the frontend
# from another port (for example `python3 -m http.server 5500`).
#
# Credentials can be changed with environment variables:
#   ASCENDENT_USER, ASCENDENT_PASS
# TODO (Phase 2/3): replace the fixed user with real accounts in MongoDB
# and store a hashed password (never a plain-text one).

import os
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

FIXED_USERNAME = os.environ.get('ASCENDENT_USER', 'ayushman')
FIXED_PASSWORD = os.environ.get('ASCENDENT_PASS', 'password123')


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    return response


@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get('username', '')
    password = data.get('password', '')

    if username == FIXED_USERNAME and password == FIXED_PASSWORD:
        return jsonify({
            "success": True,
            "message": "Login successful",
            "username": username
        }), 200

    return jsonify({
        "success": False,
        "message": "Invalid username or password"
    }), 401


if __name__ == '__main__':
    app.run(debug=True, port=5001)