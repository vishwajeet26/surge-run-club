import time
from .database import get_db, init_db
from .auth import hash_password

def seed_data():
    init_db()
    with get_db() as conn:
        # Check if already seeded
        existing_user = conn.execute("SELECT id FROM users LIMIT 1").fetchone()
        if existing_user:
            return

        print("Seeding initial Surge Run Club data...")

        # 1. Admin/Organizer user
        admin_pass = hash_password("admin123")
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            ("admin@surge.club", admin_pass, "organizer")
        )
        admin_id = cursor.lastrowid
        conn.execute(
            """INSERT INTO members (id, user_id, name, phone, goal, level, health, issued_at, added_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            ("SRG-26-LEAD-0001", admin_id, "Sohail (Club Lead)", "9876500000", "Marathon / Lead", "Advanced", "None", int(time.time() * 1000) - 86400000 * 30, int(time.time() * 1000) - 86400000 * 30)
        )

        # 2. Member demo account (rahul@example.com / member123)
        member_pass = hash_password("member123")
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            ("rahul@example.com", member_pass, "member")
        )
        rahul_id = cursor.lastrowid
        conn.execute(
            """INSERT INTO members (id, user_id, name, phone, goal, level, health, issued_at, added_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            ("SRG-26-K7M4-Q2XH", rahul_id, "Rahul Sharma", "9876543210", "Half Marathon", "Intermediate", "None", int(time.time() * 1000) - 86400000 * 14, int(time.time() * 1000) - 86400000 * 14)
        )

        # 3. Additional demo runners
        runners = [
            ("Priya Nair", "SRG-26-PRYA-9102", "9812345678", "5K Finisher", "Beginner", "Left ankle sprain (recovered)"),
            ("Aman Verma", "SRG-26-AMAN-4421", "9845671230", "10K Under 50m", "Intermediate", "None"),
            ("Sneha Reddy", "SRG-26-SNHA-7733", "9731239845", "General Fitness", "Beginner", "Mild asthma (carries inhaler)"),
            ("Vikram Malhotra", "SRG-26-VKRM-1188", "9900112233", "Full Marathon", "Advanced", "None")
        ]
        for name, mid, phone, goal, level, health in runners:
            p = hash_password("runner123")
            email = f"{name.split()[0].lower()}@surge.club"
            c = conn.execute("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)", (email, p, "member"))
            uid = c.lastrowid
            conn.execute(
                """INSERT INTO members (id, user_id, name, phone, goal, level, health, issued_at, added_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (mid, uid, name, phone, goal, level, health, int(time.time() * 1000) - 86400000 * 10, int(time.time() * 1000) - 86400000 * 10)
            )

        # 4. Runs (Past run with attendances + Upcoming runs)
        now_ms = int(time.time() * 1000)

        # Past Run:
        c = conn.execute(
            """INSERT INTO runs (title, date, time, location, distance_km, pace_groups, description, status, created_by)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            ("Surge Kickoff 5K", "2026-11-15", "06:30 AM", "Cubbon Park, Bandstand", 5.0, "5:30, 6:30, 7:30", "Our inaugural run club community shakeout! Great coffee afterwards.", "completed", admin_id)
        )
        past_run_id = c.lastrowid
        # Mark Rahul and Aman as attended for this past run!
        conn.execute("INSERT INTO run_registrations (run_id, user_id, member_id, registered_at, attended, attended_at) VALUES (?, ?, ?, ?, 1, ?)",
                     (past_run_id, rahul_id, "SRG-26-K7M4-Q2XH", now_ms - 86400000 * 4, now_ms - 86400000 * 3))

        # Upcoming Runs:
        runs_data = [
            ("Saturday Sunrise 5K & Coffee", "2026-11-21", "06:15 AM", "Cubbon Park Gate 2 (Near Queen's Statue)", 5.0, "5:15/km, 6:00/km, 6:45/km, Walk-Run", "Easy pace community group run through the shaded loop, followed by filter coffee & breakfast at Airlines Hotel. All paces welcome!", "upcoming"),
            ("Tuesday Speed & Tempo Intervals", "2026-11-24", "06:00 AM", "Kanteerava Outer Loop", 7.0, "4:45/km (Fast), 5:30/km (Steady), 6:15/km", "Warmup 1.5km + 5x800m tempo efforts with recovery jogs + cool down. Perfect for building cadence and stamina.", "upcoming"),
            ("Sunday 10K / 15K Endurance Long Run", "2026-11-29", "05:45 AM", "Sankey Tank Forest Gate", 12.0, "5:45/km, 6:30/km", "Hydration stations provided at km 4 and 8. scenic lake route with rolling hills. Pacer flags available.", "upcoming")
        ]

        for title, r_date, r_time, loc, dist, pace, desc, stat in runs_data:
            c = conn.execute(
                """INSERT INTO runs (title, date, time, location, distance_km, pace_groups, description, status, created_by)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (title, r_date, r_time, loc, dist, pace, desc, stat, admin_id)
            )
            r_id = c.lastrowid
            # Auto-register Rahul and Priya for the first upcoming run!
            if "Sunrise" in title:
                conn.execute("INSERT INTO run_registrations (run_id, user_id, member_id, registered_at, attended) VALUES (?, ?, ?, ?, 0)",
                             (r_id, rahul_id, "SRG-26-K7M4-Q2XH", now_ms))

        print("Seeding complete!")
