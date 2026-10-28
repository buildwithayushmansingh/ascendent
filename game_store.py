# game_store.py — saving the player's game data safely
#
# save_game() is a "compare-and-set": it only writes if nobody else saved in the
# meantime (the version number is still the one we read). That stops two
# requests at the same moment (a double click, two devices) from both winning.

from datetime import datetime, timezone

import database
import game_rules


def save_game(user_doc, game):
    """Saves `game` for this user. Returns the new version, or None if someone saved first."""
    current = user_doc.get('state_version', 0)

    query = {'_id': user_doc['_id']}
    if current == 0:   # accounts created before versions existed have no field at all
        query['$or'] = [{'state_version': 0}, {'state_version': {'$exists': False}}]
    else:
        query['state_version'] = current

    fields = {
        'game': game,
        'state_version': current + 1,
        'game_updated_at': datetime.now(timezone.utc).isoformat(),
    }
    if isinstance(game, dict) and isinstance(game.get('user'), dict):
        fields['stats'] = game_rules.compute_stats(game['user'])   # powers the leaderboard

    result = database.get_db().users.update_one(query, {'$set': fields})
    return current + 1 if result.matched_count == 1 else None