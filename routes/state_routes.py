# routes/state_routes.py — cloud save of the player's game data
#
# The browser sends ONE snapshot of everything it saves (user, notes, settings ...).
# The server keeps a version number so two devices cannot overwrite each other
# by accident: a save is accepted only if it starts from the latest version.

import json
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, g
from pymongo.errors import PyMongoError

import database
import game_rules
import game_store
from auth_utils import login_required

state_bp = Blueprint('state', __name__, url_prefix='/api/state')

ALLOWED_KEYS = {'user', 'avatar', 'notes', 'settings', 'theme', 'cardTheme'}
MAX_STATE_CHARS = 2_000_000
MAX_AVATAR_CHARS = 400_000
MAX_NOTES = 500
MAX_NOTE_CHARS = 5_000
NUMBER_FIELDS = ('level', 'xp', 'xpToNextLevel', 'currentStreak', 'longestStreak', 'streakShields')
LIST_FIELDS = ('habits', 'activityLog', 'tierHistory', 'unlockedAchievements', 'badges')


def _is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _has_bad_keys(value):
    """MongoDB does not like keys that start with $ or contain a dot."""
    if isinstance(value, dict):
        for k, v in value.items():
            if not isinstance(k, str) or k.startswith('$') or '.' in k:
                return True
            if _has_bad_keys(v):
                return True
    elif isinstance(value, list):
        return any(_has_bad_keys(v) for v in value)
    return False


def clean_state(state):
    """Returns (cleaned_state, error_message). Unknown keys are dropped."""
    if not isinstance(state, dict):
        return None, 'Invalid data.'

    cleaned = {}
    for key in ALLOWED_KEYS:
        value = state.get(key)
        if value is None:
            continue

        if key == 'user':
            if not isinstance(value, dict):
                return None, 'Invalid player data.'
            for f in NUMBER_FIELDS:
                if f in value and (not _is_number(value[f]) or value[f] < 0 or value[f] > 10**9):
                    return None, f'Invalid value for {f}.'
            for f in LIST_FIELDS:
                if f in value and not isinstance(value[f], list):
                    return None, f'Invalid value for {f}.'

        elif key == 'avatar':
            # Too big / not an image: just leave it out, the rest still saves
            if not (isinstance(value, str) and value.startswith('data:image/')
                    and len(value) <= MAX_AVATAR_CHARS):
                continue

        elif key == 'notes':
            if (not isinstance(value, list) or len(value) > MAX_NOTES
                    or any(not isinstance(n, str) or len(n) > MAX_NOTE_CHARS for n in value)):
                return None, 'Invalid notes.'

        elif key == 'settings':
            if (not isinstance(value, dict) or len(value) > 40
                    or any(not isinstance(v, (bool, int, float, str)) or (isinstance(v, str) and len(v) > 200)
                           for v in value.values())):
                return None, 'Invalid settings.'

        elif key in ('theme', 'cardTheme'):
            if not isinstance(value, str) or len(value) > 40:
                return None, f'Invalid {key}.'

        cleaned[key] = value

    if _has_bad_keys(cleaned):
        return None, 'Invalid data.'
    if len(json.dumps(cleaned)) > MAX_STATE_CHARS:
        return None, 'That is too much data to save.'
    return cleaned, None


@state_bp.route('', methods=['GET'])
@login_required
def get_state():
    return jsonify({
        'success': True,
        'state': g.user.get('game'),
        'version': g.user.get('state_version', 0),
    })


@state_bp.route('', methods=['PUT'])
@login_required
def put_state():
    data = request.get_json(silent=True) or {}
    base_version = data.get('base_version')
    current = g.user.get('state_version', 0)

    if not isinstance(base_version, int) or isinstance(base_version, bool):
        return jsonify({'success': False, 'message': 'Missing version.'}), 400

    if base_version != current:
        return jsonify({
            'success': False,
            'message': 'Your data was changed on another device.',
            'version': current,
        }), 409

    cleaned, error = clean_state(data.get('state'))
    if error:
        return jsonify({'success': False, 'message': error}), 400

    # The browser may edit names, notes, settings ... but XP, level, streaks, shields,
    # achievements and logs always keep the values the SERVER has.
    try:
        merged = game_rules.merge_client_state(g.user.get('game'), cleaned, g.user['username'])
    except ValueError as err:
        return jsonify({'success': False, 'message': str(err)}), 400

    try:
        new_version = game_store.save_game(g.user, merged)
    except PyMongoError:
        return jsonify({'success': False, 'message': 'Database error. Please try again.'}), 503

    if new_version is None:     # someone else saved at the same moment
        latest = database.get_db().users.find_one({'_id': g.user['_id']}) or {}
        return jsonify({'success': False, 'message': 'Your data was changed on another device.',
                        'version': latest.get('state_version', 0)}), 409

    return jsonify({'success': True, 'version': new_version, 'user': merged.get('user')})