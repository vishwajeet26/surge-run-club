import re
import time
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .database import get_db, init_db
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    generate_member_id,
    get_current_user,
    get_current_user_optional,
)
from .schemas import (
    RegisterRequest,
    LoginRequest,
    MemberUpdate,
    RunCreate,
    AttendanceToggle,
    BatchWhatsAppRequest,
)
from .seed import seed_data

app = FastAPI(title="Surge Run Club API", version="2.0.0")

# Allow CORS for development with Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    seed_data()

# Helper for badges
def calculate_badge(runs_attended: int) -> dict:
    if runs_attended >= 10:
        return {"title": "Surge Legend", "tier": "Legend", "icon": "🌟", "desc": "10+ Club Runs Completed"}
    elif runs_attended >= 4:
        return {"title": "Pacesetter", "tier": "Pacesetter", "icon": "🏆", "desc": "Consistent Group Runner"}
    elif runs_attended >= 1:
        return {"title": "Active Runner", "tier": "Active", "icon": "⚡", "desc": "Off to a strong start"}
    else:
        return {"title": "Rookie Runner", "tier": "Rookie", "icon": "🏃", "desc": "Registered & ready for first run"}

# ----------------- AUTH ENDPOINTS ----------------- #

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    email = req.email.strip().lower()
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        raise HTTPException(status_code=400, detail="Invalid email address.")

    with get_db() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered. Please log in.")

        p_hash = hash_password(req.password)
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            (email, p_hash, "member")
        )
        user_id = cursor.lastrowid

        # Generate unique Member ID for the digital runner card
        member_id = generate_member_id(conn)
        now_ms = int(time.time() * 1000)

        # Clean phone
        phone = re.sub(r"\D", "", req.phone or "")
        if len(phone) == 12 and phone.startswith("91"):
            phone = phone[2:]

        conn.execute(
            """INSERT INTO members (id, user_id, name, phone, goal, level, health, issued_at, added_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                member_id,
                user_id,
                req.name.strip(),
                phone,
                req.goal.strip() if req.goal else "5K Finisher",
                req.level.strip() if req.level else "Beginner",
                req.health.strip() if req.health else "None",
                now_ms,
                now_ms,
            )
        )

        member = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,)).fetchone()
        token = create_access_token({"sub": str(user_id), "email": email})

        return {
            "token": token,
            "user": {"id": user_id, "email": email, "role": "member"},
            "member": member,
            "stats": {"runs_attended": 0, "badge": calculate_badge(0)}
        }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    email = req.email.strip().lower()
    with get_db() as conn:
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not user or not verify_password(req.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        member = conn.execute("SELECT * FROM members WHERE user_id = ?", (user["id"],)).fetchone()
        
        # Calculate attended runs count
        res = conn.execute(
            "SELECT COUNT(*) as count FROM run_registrations WHERE user_id = ? AND attended = 1",
            (user["id"],)
        ).fetchone()
        attended_count = res["count"] if res else 0

        token = create_access_token({"sub": str(user["id"]), "email": email})

        return {
            "token": token,
            "user": {"id": user["id"], "email": user["email"], "role": user["role"]},
            "member": member,
            "stats": {
                "runs_attended": attended_count,
                "badge": calculate_badge(attended_count)
            }
        }

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        member = conn.execute("SELECT * FROM members WHERE user_id = ?", (user_id,)).fetchone()
        attended_res = conn.execute(
            "SELECT COUNT(*) as count FROM run_registrations WHERE user_id = ? AND attended = 1",
            (user_id,)
        ).fetchone()
        attended_count = attended_res["count"] if attended_res else 0

        upcoming_res = conn.execute(
            """SELECT COUNT(*) as count 
               FROM run_registrations reg
               JOIN runs r ON reg.run_id = r.id
               WHERE reg.user_id = ? AND r.status = 'upcoming'""",
            (user_id,)
        ).fetchone()
        upcoming_count = upcoming_res["count"] if upcoming_res else 0

        return {
            "user": {
                "id": current_user["id"],
                "email": current_user["email"],
                "role": current_user["role"],
            },
            "member": member,
            "stats": {
                "runs_attended": attended_count,
                "upcoming_registered": upcoming_count,
                "badge": calculate_badge(attended_count),
            }
        }

# ----------------- MEMBER / CARD ENDPOINTS ----------------- #

@app.get("/api/members/me")
def get_my_card(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        member = conn.execute("SELECT * FROM members WHERE user_id = ?", (user_id,)).fetchone()
        if not member:
            raise HTTPException(status_code=404, detail="Member profile not found.")

        attended_res = conn.execute(
            "SELECT COUNT(*) as count FROM run_registrations WHERE user_id = ? AND attended = 1",
            (user_id,)
        ).fetchone()
        attended_count = attended_res["count"] if attended_res else 0

        # Runs attended history
        attended_runs = conn.execute(
            """SELECT r.*, reg.attended_at 
               FROM run_registrations reg
               JOIN runs r ON reg.run_id = r.id
               WHERE reg.user_id = ? AND reg.attended = 1
               ORDER BY r.date DESC""",
            (user_id,)
        ).fetchall()

        # Upcoming registered runs
        upcoming_runs = conn.execute(
            """SELECT r.*, reg.registered_at 
               FROM run_registrations reg
               JOIN runs r ON reg.run_id = r.id
               WHERE reg.user_id = ? AND r.status = 'upcoming'
               ORDER BY r.date ASC""",
            (user_id,)
        ).fetchall()

        return {
            "member": member,
            "stats": {
                "runs_attended": attended_count,
                "upcoming_registered": len(upcoming_runs),
                "badge": calculate_badge(attended_count),
            },
            "attended_runs": attended_runs,
            "upcoming_runs": upcoming_runs,
        }

@app.put("/api/members/me")
def update_my_profile(data: MemberUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        member = conn.execute("SELECT * FROM members WHERE user_id = ?", (user_id,)).fetchone()
        if not member:
            raise HTTPException(status_code=404, detail="Member profile not found.")

        name = data.name if data.name is not None else member["name"]
        phone = data.phone if data.phone is not None else member["phone"]
        goal = data.goal if data.goal is not None else member["goal"]
        level = data.level if data.level is not None else member["level"]
        health = data.health if data.health is not None else member["health"]

        conn.execute(
            """UPDATE members 
               SET name = ?, phone = ?, goal = ?, level = ?, health = ?
               WHERE user_id = ?""",
            (name, phone, goal, level, health, user_id)
        )
        updated = conn.execute("SELECT * FROM members WHERE user_id = ?", (user_id,)).fetchone()
        return updated

@app.get("/api/members")
def list_members(search: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        query = """
            SELECT m.*, 
                   COALESCE((SELECT COUNT(*) FROM run_registrations rr WHERE rr.user_id = m.user_id AND rr.attended = 1), 0) as runs_attended,
                   u.email
            FROM members m
            LEFT JOIN users u ON m.user_id = u.id
        """
        params = []
        if search:
            s = f"%{search.strip().lower()}%"
            query += " WHERE LOWER(m.name) LIKE ? OR LOWER(m.id) LIKE ? OR LOWER(m.phone) LIKE ? OR LOWER(m.goal) LIKE ?"
            params.extend([s, s, s, s])

        query += " ORDER BY m.issued_at DESC, m.added_at DESC"
        members = conn.execute(query, params).fetchall()
        return members

@app.delete("/api/members/{member_id}")
def delete_member(member_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        member = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,)).fetchone()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found.")

        # Check permissions: owner or organizer
        if current_user["role"] != "organizer" and member["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to remove this member.")

        conn.execute("DELETE FROM members WHERE id = ?", (member_id,))
        return {"ok": True, "message": f"Member {member_id} removed."}

# ----------------- WHATSAPP BATCH REGISTRATION (SURGE FEATURE) ----------------- #

@app.post("/api/members/batch-whatsapp")
def batch_whatsapp(req: BatchWhatsAppRequest, current_user: dict = Depends(get_current_user)):
    text = req.text or ""
    lines = text.splitlines()

    recs = []
    cur = None
    last = None
    stamp_pattern = re.compile(r"^\s*\[?\d{1,2}[/.–-]\d{1,2}[/.–-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?m\.?)?\]?\s*[-–]?\s*[^:]{1,40}:\s*", re.I)
    field_pattern = re.compile(r"^(name|member id|whatsapp|goal|level|issued|injuries or health notes)\s*:\s*(.*)$", re.I)
    keys_map = {
        "name": "name",
        "member id": "id",
        "whatsapp": "phone",
        "goal": "goal",
        "level": "level",
        "issued": "issued",
        "injuries or health notes": "health",
    }

    def flush():
        nonlocal cur, last
        if cur:
            recs.append(cur)
        cur = None
        last = None

    for line in lines:
        fresh = False
        if stamp_pattern.match(line):
            line = stamp_pattern.sub("", line)
            fresh = True
        line = line.strip()
        if fresh:
            last = None
        if not line:
            last = None
            continue
        m = field_pattern.match(line)
        if m:
            key = keys_map[m.group(1).lower()]
            if key == "name":
                flush()
                cur = {}
            if cur is None:
                cur = {}
            cur[key] = m.group(2).strip()
            last = key
            continue
        if re.search(r"just registered", line, re.I):
            flush()
            continue
        if cur and last == "health":
            cur["health"] = (cur.get("health", "") + " " + line).strip()
    flush()

    added = 0
    dups = 0
    skipped = 0
    id_regex = re.compile(r"^[A-Z]{2,5}-\d{2}-[A-Z0-9]{4}-[A-Z0-9]{4}$")
    now_ms = int(time.time() * 1000)

    with get_db() as conn:
        for r in recs:
            raw_id = (r.get("id") or "").upper().replace(" ", "")
            if not id_regex.match(raw_id):
                skipped += 1
                continue

            existing = conn.execute("SELECT id FROM members WHERE id = ?", (raw_id,)).fetchone()
            if existing:
                dups += 1
                continue

            phone = re.sub(r"\D", "", r.get("phone") or "")
            if len(phone) == 12 and phone.startswith("91"):
                phone = phone[2:]

            conn.execute(
                """INSERT INTO members (id, user_id, name, phone, goal, level, health, issued_at, added_at)
                   VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    raw_id,
                    r.get("name", "Unknown")[:60],
                    phone,
                    r.get("goal", "5K Finisher")[:40],
                    r.get("level", "Beginner")[:40],
                    r.get("health", "None")[:300],
                    now_ms,
                    now_ms,
                )
            )
            added += 1

    return {"added": added, "duplicates": dups, "skipped": skipped}

# ----------------- RUNS & ATTENDANCE ENDPOINTS ----------------- #

@app.get("/api/runs")
def list_runs(status_filter: Optional[str] = None, user: Optional[dict] = Depends(get_current_user_optional)):
    current_user_id = user["id"] if user else None
    with get_db() as conn:
        query = "SELECT * FROM runs"
        params = []
        if status_filter:
            query += " WHERE status = ?"
            params.append(status_filter)
        query += " ORDER BY CASE WHEN status = 'upcoming' THEN 0 ELSE 1 END, date ASC, time ASC"

        runs = conn.execute(query, params).fetchall()

        result = []
        for r in runs:
            r_dict = dict(r)
            # Count attendees
            cnt_res = conn.execute(
                "SELECT COUNT(*) as cnt FROM run_registrations WHERE run_id = ?",
                (r["id"],)
            ).fetchone()
            r_dict["attendees_count"] = cnt_res["cnt"] if cnt_res else 0

            # Check if current user is registered
            if current_user_id:
                reg_res = conn.execute(
                    "SELECT attended FROM run_registrations WHERE run_id = ? AND user_id = ?",
                    (r["id"], current_user_id)
                ).fetchone()
                r_dict["is_registered"] = bool(reg_res)
                r_dict["is_attended"] = bool(reg_res["attended"]) if reg_res else False
            else:
                r_dict["is_registered"] = False
                r_dict["is_attended"] = False

            result.append(r_dict)
        return result

@app.get("/api/runs/{run_id}")
def get_run_details(run_id: int, user: Optional[dict] = Depends(get_current_user_optional)):
    current_user_id = user["id"] if user else None
    with get_db() as conn:
        run = conn.execute("SELECT * FROM runs WHERE id = ?", (run_id,)).fetchone()
        if not run:
            raise HTTPException(status_code=404, detail="Run not found.")

        run_dict = dict(run)

        # Get attendees list
        attendees = conn.execute(
            """SELECT rr.user_id, rr.registered_at, rr.attended, rr.attended_at,
                      m.id as member_id, m.name, m.level, m.goal
               FROM run_registrations rr
               JOIN members m ON rr.member_id = m.id
               WHERE rr.run_id = ?
               ORDER BY rr.registered_at ASC""",
            (run_id,)
        ).fetchall()

        run_dict["attendees"] = attendees
        run_dict["attendees_count"] = len(attendees)

        if current_user_id:
            reg = next((a for a in attendees if a["user_id"] == current_user_id), None)
            run_dict["is_registered"] = bool(reg)
            run_dict["is_attended"] = bool(reg["attended"]) if reg else False
        else:
            run_dict["is_registered"] = False
            run_dict["is_attended"] = False

        return run_dict

@app.post("/api/runs")
def create_run(req: RunCreate, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.execute(
            """INSERT INTO runs (title, date, time, location, distance_km, pace_groups, description, route_map_url, status, created_by)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?)""",
            (
                req.title.strip(),
                req.date.strip(),
                req.time.strip(),
                req.location.strip(),
                req.distance_km,
                req.pace_groups,
                req.description,
                req.route_map_url,
                current_user["id"],
            )
        )
        new_id = cursor.lastrowid
        run = conn.execute("SELECT * FROM runs WHERE id = ?", (new_id,)).fetchone()
        return run

@app.post("/api/runs/{run_id}/register")
def register_for_run(run_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        run = conn.execute("SELECT * FROM runs WHERE id = ?", (run_id,)).fetchone()
        if not run:
            raise HTTPException(status_code=404, detail="Run not found.")

        member = conn.execute("SELECT id FROM members WHERE user_id = ?", (user_id,)).fetchone()
        if not member:
            raise HTTPException(status_code=400, detail="Please create your member card before registering.")

        existing = conn.execute(
            "SELECT id FROM run_registrations WHERE run_id = ? AND user_id = ?",
            (run_id, user_id)
        ).fetchone()
        if existing:
            return {"ok": True, "message": "Already registered for this run."}

        now_ms = int(time.time() * 1000)
        conn.execute(
            """INSERT INTO run_registrations (run_id, user_id, member_id, registered_at, attended)
               VALUES (?, ?, ?, ?, 0)""",
            (run_id, user_id, member["id"], now_ms)
        )
        return {"ok": True, "message": f"Successfully registered for {run['title']}! See you at the starting line 🏃"}

@app.delete("/api/runs/{run_id}/register")
def cancel_run_registration(run_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        conn.execute(
            "DELETE FROM run_registrations WHERE run_id = ? AND user_id = ?",
            (run_id, user_id)
        )
        return {"ok": True, "message": "Run registration cancelled."}

@app.post("/api/runs/{run_id}/attendees/{target_user_id}/attendance")
def toggle_attendance(
    run_id: int,
    target_user_id: int,
    toggle: AttendanceToggle,
    current_user: dict = Depends(get_current_user)
):
    with get_db() as conn:
        reg = conn.execute(
            "SELECT * FROM run_registrations WHERE run_id = ? AND user_id = ?",
            (run_id, target_user_id)
        ).fetchone()
        if not reg:
            raise HTTPException(status_code=404, detail="Runner is not registered for this run.")

        # Check permission: self check-in or organizer
        if current_user["role"] != "organizer" and current_user["id"] != target_user_id:
            raise HTTPException(status_code=403, detail="Not authorized to mark attendance for another runner.")

        attended_val = 1 if toggle.attended else 0
        attended_at = int(time.time() * 1000) if toggle.attended else None

        conn.execute(
            "UPDATE run_registrations SET attended = ?, attended_at = ? WHERE run_id = ? AND user_id = ?",
            (attended_val, attended_at, run_id, target_user_id)
        )

        # Return updated runner attended count
        res = conn.execute(
            "SELECT COUNT(*) as count FROM run_registrations WHERE user_id = ? AND attended = 1",
            (target_user_id,)
        ).fetchone()
        total_attended = res["count"] if res else 0

        return {
            "ok": True,
            "attended": bool(attended_val),
            "runs_attended": total_attended,
            "badge": calculate_badge(total_attended)
        }

# ----------------- CLUB STATS & OVERVIEW ----------------- #

@app.get("/api/stats")
def get_club_stats():
    with get_db() as conn:
        total_members = conn.execute("SELECT COUNT(*) as cnt FROM members").fetchone()["cnt"]
        total_runs = conn.execute("SELECT COUNT(*) as cnt FROM runs").fetchone()["cnt"]
        total_attendances = conn.execute("SELECT COUNT(*) as cnt FROM run_registrations WHERE attended = 1").fetchone()["cnt"]

        # Goals breakdown
        goals = conn.execute(
            "SELECT goal, COUNT(*) as cnt FROM members GROUP BY goal ORDER BY cnt DESC"
        ).fetchall()

        # Levels breakdown
        levels = conn.execute(
            "SELECT level, COUNT(*) as cnt FROM members GROUP BY level ORDER BY cnt DESC"
        ).fetchall()

        # Recent registrations (last 7 days)
        week_ago = int(time.time() * 1000) - (7 * 86400000)
        recent_count = conn.execute(
            "SELECT COUNT(*) as cnt FROM members WHERE added_at >= ?", (week_ago,)
        ).fetchone()["cnt"]

        # Members with health notes
        none_pattern = "^(none|no|nil|nothing|n/a|na|nope|-|—)?$"
        health_members = conn.execute(
            "SELECT COUNT(*) as cnt FROM members WHERE TRIM(health) != '' AND LOWER(health) NOT IN ('none', 'no', 'nil', 'na', 'n/a', '-')",
        ).fetchone()["cnt"]

        return {
            "total_members": total_members,
            "total_runs": total_runs,
            "total_attendances": total_attendances,
            "recent_week_members": recent_count,
            "health_notes_members": health_members,
            "by_goal": goals,
            "by_level": levels,
        }

# ----------------- SERVE REACT FRONTEND ----------------- #

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

DIST_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend",
    "dist"
)

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "Frontend build not found. Run 'npm run build' in frontend/"}

