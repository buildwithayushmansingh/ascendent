# app.py — Ascendent server
#
# First time setup:
#   1) pip install -r requirements.txt
#   2) copy .env.example to .env and fill in MONGO_URI and SECRET_KEY
# Run:
#   python3 app.py          then open  http://localhost:5001

import sys
from flask import Flask, jsonify, send_from_directory, abort

import config
import database
from routes.auth_routes import auth_bp
from routes.state_routes import state_bp
from routes.game_routes import game_bp
from routes.social_routes import social_bp
# Only these folders (and the .html pages in the main folder) are public.
# This keeps .env, app.py, database.py ... private.
PUBLIC_FOLDERS = ('css/', 'js/', 'assets/')


def create_app():
    # static_folder=None -> Flask will NOT serve every file by itself
    app = Flask(__name__, static_folder=None)
    app.config['SECRET_KEY'] = config.SECRET_KEY
    app.config['MAX_CONTENT_LENGTH'] = 3 * 1024 * 1024   # 3 MB max request
    app.register_blueprint(auth_bp)
    app.register_blueprint(state_bp)
    app.register_blueprint(game_bp)
    app.register_blueprint(social_bp)

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({'success': False, 'message': 'That is too much data to save.'}), 413 

    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response

    @app.route('/api/health')
    def health():
        return jsonify({'ok': True, 'database': database.ping_db()})

    @app.route('/')
    def serve_index():
        return send_from_directory('.', 'index.html')

    @app.route('/<path:filename>')
    def serve_static(filename):
        parts = filename.split('/')
        # Block "..", hidden files (.env), backslashes and empty parts
        if '' in parts or '..' in parts or '\\' in filename or any(p.startswith('.') for p in parts):
            abort(404)
        is_page = filename.endswith('.html') and len(parts) == 1
        if not (is_page or filename.startswith(PUBLIC_FOLDERS)):
            abort(404)
        return send_from_directory('.', filename)

    return app


app = create_app()


def check_setup():
    problems = []
    if not config.MONGO_URI:
        problems.append('MONGO_URI is missing in your .env file')
    if not config.SECRET_KEY:
        problems.append('SECRET_KEY is missing in your .env file')
    if problems:
        print('\n❌ Setup problem:')
        for p in problems:
            print('   -', p)
        print('   Copy .env.example to .env and fill it in.\n')
        sys.exit(1)

    try:
        database.init_db()
        print('✅ Connected to MongoDB Atlas')
        updated = database.backfill_stats()
        if updated:
            print(f'✅ Leaderboard numbers added for {updated} existing player(s)')
    except Exception as err:
        print('\n❌ Could not connect to MongoDB Atlas:', err)
        print('   Check: MONGO_URI/password in .env, and Atlas > Network Access allows your IP.\n')
        sys.exit(1)


if __name__ == '__main__':
    check_setup()
    app.run(debug=True, port=5001)