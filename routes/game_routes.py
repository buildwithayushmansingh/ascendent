# routes/game_routes.py — complete / miss a habit. The SERVER calculates the result.

import copy

from flask import Blueprint, request, jsonify, g
from pymongo.errors import PyMongoError

import database
import game_rules
import game_store
from auth_utils import login_required

game_bp = Blueprint('game', __name__, url_prefix='/api/habits')


def _fail(message, status):
    return jsonify({'success': False, 'message': message}), status


def _run_action(habit_id, action):
    """Loads the saved game, applies `action`, saves it. Retries if another save happened first."""
    for attempt in range(3):
        try:
            doc = g.user if attempt == 0 else database.get_db().users.find_one({'_id': g.user['_id']})
            if doc is None:
                return _fail('Please log in again.', 401)

            game = copy.deepcopy(doc.get('game'))
            if not isinstance(game, dict) or not isinstance(game.get('user'), dict):
                return _fail('Your data is not saved yet. Wait a second and try again.', 404)

            user = game['user']
            habit = next((h for h in user.get('habits', []) if h.get('id') == habit_id), None)
            if habit is None:
                return _fail('Habit not found. Wait a second and try again.', 404)

            result = action(user, habit)
            if result.get('alreadyDone'):
                return jsonify({'success': True, 'alreadyDone': True, 'user': user,
                                'version': doc.get('state_version', 0)})

            version = game_store.save_game(doc, game)
            if version is not None:
                result.update({'success': True, 'user': user, 'version': version})
                return jsonify(result)
        except PyMongoError:
            return _fail('Database error. Please try again.', 503)

    return _fail('Please try again.', 409)


@game_bp.route('/<habit_id>/complete', methods=['POST'])
@login_required
def complete(habit_id):
    return _run_action(habit_id, game_rules.complete_habit)


@game_bp.route('/<habit_id>/miss', methods=['POST'])
@login_required
def miss(habit_id):
    body = request.get_json(silent=True) or {}
    reason = body.get('reason', '')
    reason = reason if isinstance(reason, str) else ''
    use_shield = body.get('useShield') is True
    return _run_action(habit_id, lambda user, habit: game_rules.miss_habit(user, habit, reason, use_shield))