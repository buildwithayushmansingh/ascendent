# database.py — MongoDB Atlas connection (one shared client for the whole app)

from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import PyMongoError

import config

_client = None
_db = None


def get_db():
    """Returns the database object. The connection is created on first use."""
    global _client, _db
    if _db is None:
        _client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=5000)
        _db = _client[config.DB_NAME]
    return _db


def init_db():
    """Checks the connection and creates the indexes. Call once at startup."""
    db = get_db()
    db.command('ping')  # fails fast if the URI / password / network is wrong
    db.users.create_index([('username_lower', ASCENDING)], unique=True)
    db.users.create_index([('stats.score', DESCENDING)])   # leaderboard
    db.users.create_index('friends')


def ping_db():
    try:
        get_db().command('ping')
        return True
    except PyMongoError:
        return False
    

def backfill_stats():
    """Players saved before Phase 3 have no leaderboard numbers yet: calculate them once."""
    import game_rules
    users = get_db().users
    done = 0
    for doc in users.find({'stats': {'$exists': False}}):
        user = (doc.get('game') or {}).get('user')
        if isinstance(user, dict):
            users.update_one({'_id': doc['_id']}, {'$set': {'stats': game_rules.compute_stats(user)}})
            done += 1
    return done