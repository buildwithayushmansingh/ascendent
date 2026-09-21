# app.py - Minimal Flask login server
# Verifies a fixed username/password (hardcoded for now, no database yet).
#
# Run with: python3 app.py
# Runs on: http://localhost:5001

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

FIXED_USERNAME = "ayushman"
FIXED_PASSWORD = "ascendent123"


@app.route('/')
def home():
    return "Ascendent login backend is running."


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    username = data.get('username', '')
    password = data.get('password', '')

    if username == FIXED_USERNAME and password == FIXED_PASSWORD:
        return jsonify({
            "success": True,
            "message": "Login successful",
            "username": username
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401


if __name__ == '__main__':
    app.run(debug=True, port=5001)
