# routes/social_routes.py — leaderboard and friends

from flask import Blueprint, request, jsonify, g
from pymongo.errors import PyMongoError

import database
from auth_utils import login_required, USERNAME_RE

social_bp = Blueprint('social', __name__, url_prefix='/api')

MAX_FRIENDS = 50
BOARD_SIZE = 50
PUBLIC_FIELDS = {'username': 1, 'stats': 1}


def _fail(message, status):
    return jsonify({'success': False, 'message': message}), status


def _entry(doc):
    """What other players are allowed to see (never email, never habits)."""
    s = doc.get('stats') or {}
    return {
        'username': doc['username'],
        'level': s.get('level', 1),
        'tier': s.get('tier', 'Bronze'),
        'title': s.get('title', 'Rookie'),
        'xp': s.get('score', 0),
        'streak': s.get('streak', 0),
        'consistency': s.get('consistency', 0),
        'isCurrentPlayer': doc['_id'] == g.user['_id'],
    }


@social_bp.route('/leaderboard', methods=['GET'])
@login_required
def leaderboard():
    scope = request.args.get('scope', 'global')
    users = database.get_db().users

    if scope == 'friends':
        ids = [g.user['_id']] + list(g.user.get('friends', []))
        query = {'_id': {'$in': ids}, 'stats': {'$exists': True}}
    elif scope == 'global':
        query = {'stats': {'$exists': True}}
    else:
        return _fail('Unknown leaderboard.', 400)

    try:
        docs = list(users.find(query, PUBLIC_FIELDS)
                    .sort([('stats.score', -1), ('username_lower', 1)])
                    .limit(BOARD_SIZE))

        players = []
        for i, doc in enumerate(docs):
            entry = _entry(doc)
            entry['rank'] = i + 1
            players.append(entry)

        # Always show the current player, even if outside the top list
        if scope == 'global' and g.user.get('stats') and not any(p['isCurrentPlayer'] for p in players):
            entry = _entry(g.user)
            entry['rank'] = users.count_documents({'stats.score': {'$gt': g.user['stats']['score']}}) + 1
            players.append(entry)
    except PyMongoError:
        return _fail('Database error. Please try again.', 503)

    return jsonify({'success': True, 'scope': scope, 'players': players})


@social_bp.route('/friends', methods=['GET'])
@login_required
def list_friends():
    ids = list(g.user.get('friends', []))
    try:
        docs = list(database.get_db().users.find({'_id': {'$in': ids}}, PUBLIC_FIELDS)) if ids else []
    except PyMongoError:
        return _fail('Database error. Please try again.', 503)
    friends = sorted((_entry(d) for d in docs), key=lambda e: -e['xp'])
    return jsonify({'success': True, 'friends': friends})


@social_bp.route('/friends', methods=['POST'])
@login_required
def add_friend():
    body = request.get_json(silent=True) or {}
    name = str(body.get('username', '')).strip()
    if not USERNAME_RE.match(name):
        return _fail('Enter a valid username (3-20 letters, numbers or underscore).', 400)

    users = database.get_db().users
    try:
        target = users.find_one({'username_lower': name.lower()})
        if not target:
            return _fail('No player with that username.', 404)
        if target['_id'] == g.user['_id']:
            return _fail('You cannot add yourself.', 400)

        current = list(g.user.get('friends', []))
        if target['_id'] in current:
            return _fail('Already in your friends list.', 409)
        if len(current) >= MAX_FRIENDS:
            return _fail(f'You can have at most {MAX_FRIENDS} friends.', 400)

        users.update_one({'_id': g.user['_id']}, {'$addToSet': {'friends': target['_id']}})
    except PyMongoError:
        return _fail('Database error. Please try again.', 503)

    return jsonify({'success': True, 'friend': _entry(target)}), 201


@social_bp.route('/friends/<username>', methods=['DELETE'])
@login_required
def remove_friend(username):
    users = database.get_db().users
    try:
        target = users.find_one({'username_lower': username.strip().lower()})
        if not target:
            return _fail('No player with that username.', 404)
        users.update_one({'_id': g.user['_id']}, {'$pull': {'friends': target['_id']}})
    except PyMongoError:
        return _fail('Database error. Please try again.', 503)
    return jsonify({'success': True})