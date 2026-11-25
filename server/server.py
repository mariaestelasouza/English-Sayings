"""
Tiny usage counter for the Say It Professionally app.

Endpoints:
- POST /api/visit  -> the app calls this once each time it is opened
- GET  /api/stats  -> request counts per day and per endpoint, as JSON
- GET  /admin      -> admin page with visits per day and requests per endpoint

Every request is counted by day and endpoint (for example "POST /api/visit").
Unknown paths are grouped together as "other (not found)".

Privacy: only numbers per day and endpoint are stored. No IP addresses,
cookies, names, emails or device details are saved.

Uses only the Python standard library, so there is nothing to install.

Run:
    python3 server/server.py

Admin login:
    /admin and /api/stats always need a username and password.
    They are read from environment variables, or from server/.env:
        ADMIN_USER=admin
        ADMIN_PASSWORD=your-password
    If no password is set, the server creates a random one on first start,
    saves it in server/.env and prints it once in the terminal.
    server/.env is ignored by git, so the password is never committed.

Optional environment variables:
    PORT            Port to listen on (default 8787)
    HOST            Address to listen on (default 127.0.0.1, this computer only)
"""

import base64
import hmac
import json
import os
import secrets
import sqlite3
import time
from datetime import date
from html import escape
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DB_PATH = Path(__file__).with_name("usage.db")
ENV_PATH = Path(__file__).with_name(".env")


def load_env_file():
    """Reads KEY=VALUE lines from server/.env (if it exists)."""
    values = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def load_admin_login():
    """Environment variables win over server/.env. Creates a password if none is set."""
    file_values = load_env_file()
    user = os.environ.get("ADMIN_USER") or file_values.get("ADMIN_USER") or "admin"
    password = os.environ.get("ADMIN_PASSWORD") or file_values.get("ADMIN_PASSWORD") or ""
    created = False
    if not password:
        password = secrets.token_urlsafe(12)
        lines = [line for line in (ENV_PATH.read_text().splitlines() if ENV_PATH.exists() else [])
                 if not line.strip().startswith(("ADMIN_USER=", "ADMIN_PASSWORD="))]
        lines += [f"ADMIN_USER={user}", f"ADMIN_PASSWORD={password}"]
        ENV_PATH.write_text("\n".join(lines) + "\n")
        ENV_PATH.chmod(0o600)
        created = True
    return user, password, created


HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8787"))
ADMIN_USER, ADMIN_PASSWORD, PASSWORD_CREATED = load_admin_login()
FAILED_LOGIN_DELAY = 1.0  # seconds; slows down password guessing

VISIT_ENDPOINT = "POST /api/visit"
KNOWN_ENDPOINTS = {VISIT_ENDPOINT, "GET /api/stats", "GET /admin"}
OTHER_ENDPOINT = "other (not found)"


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS requests ("
        " day TEXT NOT NULL, endpoint TEXT NOT NULL, count INTEGER NOT NULL,"
        " PRIMARY KEY (day, endpoint))"
    )
    return conn


def count_request(endpoint):
    if endpoint not in KNOWN_ENDPOINTS:
        endpoint = OTHER_ENDPOINT
    with db() as conn:
        conn.execute(
            "INSERT INTO requests (day, endpoint, count) VALUES (?, ?, 1) "
            "ON CONFLICT(day, endpoint) DO UPDATE SET count = count + 1",
            (date.today().isoformat(), endpoint),
        )


def get_stats(days=365):
    """Returns a list of days (newest first), each with a total and per-endpoint counts."""
    with db() as conn:
        rows = conn.execute(
            "SELECT day, endpoint, count FROM requests "
            "WHERE day IN (SELECT DISTINCT day FROM requests ORDER BY day DESC LIMIT ?) "
            "ORDER BY day DESC, endpoint",
            (days,),
        ).fetchall()
    by_day = {}
    for day, endpoint, count in rows:
        entry = by_day.setdefault(day, {"day": day, "visits": 0, "total_requests": 0, "endpoints": {}})
        entry["endpoints"][endpoint] = count
        entry["total_requests"] += count
        if endpoint == VISIT_ENDPOINT:
            entry["visits"] = count
    return list(by_day.values())


ADMIN_PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Usage admin</title>
<style>
  body {{ font-family: system-ui, sans-serif; max-width: 860px; margin: 40px auto; padding: 0 16px; color: #2a2233; background: #f6f1fb; }}
  h1 {{ margin-bottom: 4px; }}
  h2 {{ margin-top: 32px; }}
  .muted {{ color: #6b6178; }}
  .cards {{ display: flex; gap: 12px; margin: 20px 0; flex-wrap: wrap; }}
  .card {{ background: #fff; border: 1px solid #e4d9f0; border-radius: 12px; padding: 14px 18px; flex: 1; min-width: 140px; }}
  .card b {{ display: block; font-size: 1.8rem; color: #7c3aed; }}
  .scroll {{ overflow-x: auto; }}
  table {{ width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }}
  th, td {{ text-align: left; padding: 10px 14px; border-bottom: 1px solid #e4d9f0; white-space: nowrap; }}
  th {{ background: #ede4fd; }}
  .num {{ text-align: right; font-variant-numeric: tabular-nums; }}
  code {{ font-size: 0.9em; }}
</style>
</head>
<body>
  <h1>Usage admin</h1>
  <p class="muted">Only counts are stored: no IP addresses, cookies or personal data.
  A "visit" is one time the app was opened.</p>

  <div class="cards">
    <div class="card"><span class="muted">Visits today</span><b>{today}</b></div>
    <div class="card"><span class="muted">Visits, last 7 days</span><b>{week}</b></div>
    <div class="card"><span class="muted">Visits, all time</span><b>{total}</b></div>
    <div class="card"><span class="muted">Requests, all time</span><b>{total_requests}</b></div>
  </div>

  <h2>Requests per endpoint (all time)</h2>
  <div class="scroll"><table>
    <thead><tr><th>Endpoint</th><th class="num">Requests</th></tr></thead>
    <tbody>{endpoint_rows}</tbody>
  </table></div>

  <h2>Per day</h2>
  <div class="scroll"><table>
    <thead><tr><th>Day</th><th class="num">Visits</th>{endpoint_headers}<th class="num">All requests</th></tr></thead>
    <tbody>{day_rows}</tbody>
  </table></div>
</body>
</html>"""


def render_admin():
    stats = get_stats()
    today = date.today().isoformat()

    endpoint_totals = {}
    for entry in stats:
        for endpoint, count in entry["endpoints"].items():
            endpoint_totals[endpoint] = endpoint_totals.get(endpoint, 0) + count
    endpoints = sorted(endpoint_totals, key=lambda e: (-endpoint_totals[e], e))

    endpoint_rows = "".join(
        f'<tr><td><code>{escape(e)}</code></td><td class="num">{endpoint_totals[e]}</td></tr>' for e in endpoints
    ) or '<tr><td colspan="2" class="muted">No requests yet.</td></tr>'

    endpoint_headers = "".join(f'<th class="num"><code>{escape(e)}</code></th>' for e in endpoints)
    day_rows = "".join(
        f'<tr><td>{escape(s["day"])}</td><td class="num"><b>{s["visits"]}</b></td>'
        + "".join(f'<td class="num">{s["endpoints"].get(e, 0)}</td>' for e in endpoints)
        + f'<td class="num">{s["total_requests"]}</td></tr>'
        for s in stats
    ) or f'<tr><td colspan="{len(endpoints) + 3}" class="muted">No requests yet.</td></tr>'

    return ADMIN_PAGE.format(
        today=next((s["visits"] for s in stats if s["day"] == today), 0),
        week=sum(s["visits"] for s in stats[:7]),
        total=sum(s["visits"] for s in stats),
        total_requests=sum(endpoint_totals.values()),
        endpoint_rows=endpoint_rows,
        endpoint_headers=endpoint_headers,
        day_rows=day_rows,
    )


class Handler(BaseHTTPRequestHandler):
    def _send(self, status, body, content_type="text/plain; charset=utf-8"):
        data = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _path(self):
        path = self.path.split("?", 1)[0]
        return path.rstrip("/") or "/"

    def _is_admin(self):
        header = self.headers.get("Authorization", "")
        if header.startswith("Basic "):
            try:
                user, _, password = base64.b64decode(header[6:]).decode("utf-8").partition(":")
            except Exception:
                user, password = "", ""
            user_ok = hmac.compare_digest(user.encode(), ADMIN_USER.encode())
            password_ok = hmac.compare_digest(password.encode(), ADMIN_PASSWORD.encode())
            if user_ok and password_ok:
                return True
            time.sleep(FAILED_LOGIN_DELAY)
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="Usage admin"')
        self.send_header("Content-Length", "0")
        self.end_headers()
        return False

    def do_POST(self):
        path = self._path()
        count_request(f"POST {path}")
        if path == "/api/visit":
            # Read and ignore any body; nothing from the request is stored.
            length = int(self.headers.get("Content-Length") or 0)
            if length:
                self.rfile.read(min(length, 1024))
            self.send_response(204)
            self.end_headers()
        else:
            self._send(404, "Not found")

    def do_GET(self):
        path = self._path()
        count_request(f"GET {path}")
        if path == "/api/stats":
            if self._is_admin():
                self._send(200, json.dumps(get_stats(), indent=2), "application/json")
        elif path == "/admin":
            if self._is_admin():
                self._send(200, render_admin(), "text/html; charset=utf-8")
        else:
            self._send(404, "Not found")

    def log_message(self, format, *args):
        # Keep the terminal quiet and avoid printing visitor IP addresses.
        pass


if __name__ == "__main__":
    db().close()
    print(f"Usage counter running on http://{HOST}:{PORT}")
    print(f"Admin page: http://{HOST}:{PORT}/admin (username: {ADMIN_USER})")
    if PASSWORD_CREATED:
        print(f"A new admin password was created and saved in {ENV_PATH}:")
        print(f"    {ADMIN_PASSWORD}")
        print("Keep it safe. To change it, edit that file and restart the server.")
    else:
        print("Admin password loaded (from the environment or server/.env).")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
