from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

FIXED_USERNAME = "ayushman"
FIXED_PASSWORD = "ascendent123"


@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)


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
