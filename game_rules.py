# game_rules.py — ALL the game rules live here (XP, levels, streaks, shields,
# tiers, achievements). The browser can only ASK for things; the server decides.
# Pure functions: no Flask, no database -> easy to test.

import copy
import math
import random
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import config

# ---------------- rules (same numbers the frontend used) ----------------
DIFFICULTY_XP = {'Easy': 10, 'Normal': 20, 'Hard': 35, 'Extreme': 50}
TIERS = [('Bronze', 1), ('Silver', 10), ('Gold', 20), ('Platinum', 35), ('Legendary', 50)]
TITLES = [('Rookie', 1), ('Grinder', 10), ('Consistency Master', 25), ('Legend', 50)]

PLAYER_BASE_XP = 1000
PLAYER_GROWTH = 1.2
HABIT_BASE_XP = 100
HABIT_GROWTH = 1.15

MAX_HABITS = 20
MAX_LEVEL = 100          # nobody can really get here; anything higher is fake data
MAX_ACTIVITY_LOG = 5000

# Fields only the server may change
PROTECTED_USER_FIELDS = (
    'level', 'xp', 'xpToNextLevel', 'currentStreak', 'longestStreak', 'streakShields',
    'badges', 'tier', 'title', 'tierHistory', 'unlockedAchievements', 'activityLog',
    'lastCompletedDate', 'shieldedDate',
)

ACHIEVEMENTS = [
    ('first-step', 'First Step', lambda u, done: done >= 1),
    ('seven-day-warrior', '7 Day Warrior', lambda u, done: u['longestStreak'] >= 7),
    ('consistent', 'Consistent', lambda u, done: done >= 25),
    ('month-master', 'Month Master', lambda u, done: u['longestStreak'] >= 30),
    ('legend', 'Legend', lambda u, done: u['level'] >= 50),
]


def _round(x):
    """Same rounding as JavaScript's Math.round (for positive numbers)."""
    return int(math.floor(x + 0.5))


# ---------------- dates (decided by the server) ----------------
def _now_local():
    return datetime.now(ZoneInfo(config.APP_TIMEZONE))


def today_key():
    return _now_local().strftime('%Y-%m-%d')


def yesterday_key():
    return (_now_local() - timedelta(days=1)).strftime('%Y-%m-%d')


def next_streak(current, last_key, shield_key=None):
    """Streaks count DAYS.
    - already done today            -> unchanged
    - last done (or shielded) yesterday -> +1
    - older / never                 -> starts again at 1
    A day covered by a Streak Shield keeps the chain alive, like a completed day."""
    today, yesterday = today_key(), yesterday_key()
    if not last_key and not shield_key:
        return (current or 0) + 1
    if last_key == today:
        return current
    anchor = max(k for k in (last_key, shield_key) if k)   # YYYY-MM-DD sorts correctly as text
    if anchor == yesterday:
        return current + 1
    if anchor == today:                  # shield used today, and now completing as well
        return current + 1 if last_key == yesterday else current
    return 1


def streak_alive(last_key, shield_key):
    """Is the streak still unbroken as of today (done/shielded yesterday or today)?"""
    return any(k in (today_key(), yesterday_key()) for k in (last_key, shield_key) if k)


# ---------------- tiers / titles ----------------
def tier_for_level(level):
    name = TIERS[0][0]
    for tier, minimum in TIERS:
        if level >= minimum:
            name = tier
    return name


def title_for_level(level):
    name = TITLES[0][0]
    for title, minimum in TITLES:
        if level >= minimum:
            name = title
    return name


# ---------------- default / repaired data ----------------
def default_user(username):
    return {
        'username': username,
        'level': 1,
        'xp': 0,
        'xpToNextLevel': PLAYER_BASE_XP,
        'currentStreak': 0,
        'longestStreak': 0,
        'streakShields': 1,
        'badges': ['🥇 First Step', '🔥 7 Day Streak'],
        'tier': 'Bronze',
        'title': 'Rookie',
        'cardId': '#' + str(random.randint(1000, 9999)),
        'habits': [],
        'activityLog': [],
        'tierHistory': [{'tier': 'Bronze', 'level': 1, 'date': datetime.now(timezone.utc).isoformat()}],
        'unlockedAchievements': [],
    }


def ensure_defaults(user):
    """Fills in any protected field that is missing (older saved data)."""
    base = default_user(user.get('username', 'Player'))
    for field in PROTECTED_USER_FIELDS:
        if field in ('lastCompletedDate', 'shieldedDate'):
            continue
        if field not in user or user[field] is None:
            user[field] = base[field]
    user.setdefault('habits', [])
    return user


def new_habit(client_habit):
    """A brand-new habit: the server decides XP value and all counters."""
    return {
        'id': client_habit['id'],
        'name': client_habit['name'],
        'icon': client_habit['icon'],
        'target': client_habit['target'],
        'frequency': client_habit['frequency'],
        'difficulty': client_habit['difficulty'],
        'xpPerComplete': DIFFICULTY_XP[client_habit['difficulty']],
        'level': 1,
        'xp': 0,
        'xpToNextLevel': HABIT_BASE_XP,
        'streak': 0,
        'completed': False,
        'missedReasons': [],
    }


# ---------------- merging what the browser sends ----------------
def _clean_habit_fields(raw):
    """Validates the fields a player is allowed to edit. Raises ValueError if bad."""
    if not isinstance(raw, dict):
        raise ValueError('Invalid habit.')
    hid, name = raw.get('id'), raw.get('name')
    if not isinstance(hid, str) or not (1 <= len(hid) <= 100):
        raise ValueError('Invalid habit id.')
    if not isinstance(name, str) or not (1 <= len(name.strip()) <= 60):
        raise ValueError('Habit names must be 1-60 characters.')

    def number(value, low, high, default):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            return default
        return int(max(low, min(high, value)))

    icon = raw.get('icon')
    difficulty = raw.get('difficulty')
    return {
        'id': hid,
        'name': name.strip(),
        'icon': icon if isinstance(icon, str) and 0 < len(icon) <= 8 else '⭐',
        'target': number(raw.get('target'), 1, 1440, 30),
        'frequency': number(raw.get('frequency'), 1, 7, 5),
        'difficulty': difficulty if difficulty in DIFFICULTY_XP else 'Normal',
    }


def merge_habits(server_habits, client_habits):
    if not isinstance(client_habits, list):
        raise ValueError('Invalid habits.')
    if len(client_habits) > MAX_HABITS:
        raise ValueError(f'You can have at most {MAX_HABITS} habits.')

    known = {h.get('id'): h for h in server_habits if isinstance(h, dict)}
    merged, seen = [], set()
    for raw in client_habits:
        fields = _clean_habit_fields(raw)
        if fields['id'] in seen:
            raise ValueError('Duplicate habit.')
        seen.add(fields['id'])

        existing = known.get(fields['id'])
        if existing:
            habit = copy.deepcopy(existing)          # counters stay as the server has them
            habit.update(fields)
            habit['xpPerComplete'] = DIFFICULTY_XP[fields['difficulty']]
        else:
            habit = new_habit(fields)
        merged.append(habit)
    return merged


def merge_user(server_user, client_user, username):
    """Takes what the browser sent, but keeps every protected value from the server."""
    base = ensure_defaults(copy.deepcopy(server_user)) if server_user else default_user(username)

    merged = {k: v for k, v in client_user.items()
              if k not in PROTECTED_USER_FIELDS and k != 'habits'}
    for field in PROTECTED_USER_FIELDS:
        if field in base:
            merged[field] = copy.deepcopy(base[field])
    merged['username'] = username                      # the account name cannot be faked
    merged['habits'] = merge_habits(base.get('habits', []), client_user.get('habits', []))
    return merged


def merge_client_state(server_game, client_state, username):
    """Result = the client's snapshot, with the game-critical parts forced to the server's values."""
    server_user = (server_game or {}).get('user')
    merged = dict(client_state)
    if isinstance(client_state.get('user'), dict):
        merged['user'] = merge_user(server_user, client_state['user'], username)
    elif server_user:
        merged['user'] = server_user
    return merged


# ---------------- actions ----------------
def check_achievements(user):
    done = sum(1 for e in user['activityLog'] if e.get('status') == 'completed')
    unlocked = user['unlockedAchievements']
    new = []
    for ach_id, name, check in ACHIEVEMENTS:
        if ach_id not in unlocked and check(user, done):
            unlocked.append(ach_id)
            new.append({'id': ach_id, 'name': name})
    return new


def _log(user, entry):
    user['activityLog'].append(entry)
    if len(user['activityLog']) > MAX_ACTIVITY_LOG:
        del user['activityLog'][:len(user['activityLog']) - MAX_ACTIVITY_LOG]


def _repair(obj, base_need):
    """Old saved data could hold impossible numbers (0 XP needed would loop forever)."""
    def is_num(v):
        return isinstance(v, (int, float)) and not isinstance(v, bool)
    if not is_num(obj.get('xpToNextLevel')) or obj['xpToNextLevel'] < 1:
        obj['xpToNextLevel'] = base_need
    if not is_num(obj.get('xp')) or obj['xp'] < 0:
        obj['xp'] = 0
    if not isinstance(obj.get('level'), int) or obj['level'] < 1:
        obj['level'] = 1
    obj['level'] = min(obj['level'], MAX_LEVEL)


def complete_habit(user, habit):
    """Completes a habit for today (once per day). Changes `user` and `habit` in place."""
    ensure_defaults(user)
    _repair(user, PLAYER_BASE_XP)
    _repair(habit, HABIT_BASE_XP)
    if not isinstance(habit.get('streak'), int) or habit['streak'] < 0:
        habit['streak'] = 0
    today = today_key()
    if habit.get('lastCompletedDate') == today:
        return {'alreadyDone': True}

    old_tier = user['tier']
    # XP always comes from the difficulty table, never from a stored/edited number
    gain = DIFFICULTY_XP.get(habit.get('difficulty'), DIFFICULTY_XP['Normal'])
    habit['xpPerComplete'] = gain

    # --- habit level ---
    habit['xp'] += gain
    habit['streak'] = next_streak(habit.get('streak', 0), habit.get('lastCompletedDate'), habit.get('shieldedDate'))
    habit['lastCompletedDate'] = today
    habit['completed'] = True
    while habit['xp'] >= habit['xpToNextLevel'] and habit['level'] < MAX_LEVEL:
        habit['xp'] -= habit['xpToNextLevel']
        habit['level'] += 1
        habit['xpToNextLevel'] = _round(habit['xpToNextLevel'] * HABIT_GROWTH)

    # --- player level / overall streak ---
    user['xp'] += gain
    user['currentStreak'] = next_streak(user['currentStreak'], user.get('lastCompletedDate'), user.get('shieldedDate'))
    user['lastCompletedDate'] = today
    user['longestStreak'] = max(user['longestStreak'], user['currentStreak'])

    leveled_up = False
    while user['xp'] >= user['xpToNextLevel'] and user['level'] < MAX_LEVEL:
        user['xp'] -= user['xpToNextLevel']
        user['level'] += 1
        user['xpToNextLevel'] = _round(user['xpToNextLevel'] * PLAYER_GROWTH)
        leveled_up = True

    user['tier'] = tier_for_level(user['level'])
    user['title'] = title_for_level(user['level'])
    tier_changed = user['tier'] != old_tier

    now_iso = datetime.now(timezone.utc).isoformat()
    _log(user, {'date': now_iso, 'category': habit['name'], 'status': 'completed', 'xpEarned': gain})
    if tier_changed:
        user['tierHistory'].append({'tier': user['tier'], 'level': user['level'], 'date': now_iso})

    return {
        'alreadyDone': False,
        'xpEarned': gain,
        'playerLeveledUp': leveled_up,
        'tierChanged': tier_changed,
        'newAchievements': check_achievements(user),
    }


def miss_habit(user, habit, reason, use_shield):
    """Logs a missed habit. A shield keeps the streak; without it the streak resets."""
    ensure_defaults(user)
    reason = (reason or '').strip()[:200]
    now_iso = datetime.now(timezone.utc).isoformat()

    habit.setdefault('missedReasons', []).append({'reason': reason, 'date': now_iso})
    _log(user, {'date': now_iso, 'category': habit['name'], 'status': 'missed', 'reason': reason})

    # A shield can only SAVE a streak that is still alive; it cannot bring back a
    # streak that was already broken days ago (and then it is not used up).
    alive = streak_alive(user.get('lastCompletedDate'), user.get('shieldedDate'))
    shield_used = False
    if use_shield and user['streakShields'] > 0 and alive:
        user['streakShields'] -= 1
        shield_used = True
        today = today_key()
        user['shieldedDate'] = today        # today counts as "covered": the streak continues tomorrow
        habit['shieldedDate'] = today
    else:
        habit['streak'] = 0
        user['currentStreak'] = 0

    return {'alreadyDone': False, 'shieldUsed': shield_used, 'newAchievements': check_achievements(user)}


# ---------------- leaderboard numbers ----------------
def total_xp(level, xp):
    """All XP ever earned (XP of finished levels + XP inside the current level)."""
    total, need = 0, PLAYER_BASE_XP
    level = int(min(max(level, 1), MAX_LEVEL))   # protects against absurd saved levels
    for _ in range(1, level):
        total += need
        need = _round(need * PLAYER_GROWTH)
    return total + xp


def compute_stats(user):
    log = user.get('activityLog') or []
    completed = sum(1 for e in log if e.get('status') == 'completed')
    return {
        'score': total_xp(user.get('level', 1), user.get('xp', 0)),
        'level': user.get('level', 1),
        'tier': user.get('tier', 'Bronze'),
        'title': user.get('title', 'Rookie'),
        'streak': user.get('currentStreak', 0),
        'consistency': _round(completed / (len(log) or 1) * 100),
    }