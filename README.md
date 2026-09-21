# Ascendent — Frontend (Phase 1)

This is the **frontend-only** version of Ascendent — plain HTML, CSS, and
JavaScript, with no backend yet. It's built so all pages work and connect
to each other right now, using a temporary `localStorage`-based demo state
(see `js/demo-data.js`).

## Pages

- `index.html` — Login / signup
- `dashboard.html` — Mini player card, activity logging, Boss Battle widget, Notes
- `card.html` — Full player card with a flip-to-reveal Future Self card

## How to run

Just open `index.html` in a browser, or serve the folder with any static
server, e.g.:

```bash
python3 -m http.server 5500
```

Then visit `http://localhost:5500`.

## Current behavior (temporary, until backend exists)

- Login/Signup just saves a username locally and goes to the dashboard —
  no real accounts yet.
- "Mark Complete" / "Mark Missed" update a fake user object stored in
  `localStorage` (see `js/demo-data.js`) to simulate XP, levels, streaks,
  and card tier changes.
- Notes are saved to `localStorage`.

## Next phase: Backend

When the Flask backend is built, replace the `TODO` comments in:
- `js/auth.js`
- `js/dashboard.js`
- `js/activity.js`
- `js/card.js`

with real `fetch()` calls to the API, and then `js/demo-data.js` can be
deleted.

## Next-next phase: Database

Once the backend is built and connected to MongoDB, all the demo data
becomes real, persistent data tied to real user accounts.
