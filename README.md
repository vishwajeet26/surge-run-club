# ⚡ Surge Run Club

A full-stack club membership and group run management platform with **Python (FastAPI)**, **SQLite**, and **React**.

---

## 🏃 Features

1. **User Authentication & Instant Card Minting**
   - Sign up with Email & Password.
   - Upon creating an account, an official **Surge Member Card** is minted with a unique Member ID (`SRG-26-XXXX-XXXX`), Runner Name, WhatsApp link, Goal, Experience Level, and Emergency/Health notes.
   - Live interactive card preview as users type their details during registration.

2. **Group Runs & Free RSVP**
   - View scheduled community group runs with details: Date, Time, Location, Distance (KM), Pace Groups, Route/Coffee stop, and Attendee Count.
   - **Free One-Click Registration (RSVP)**: Members register with a single click and receive a confetti celebration.
   - Cancel RSVP option if plans change.

3. **Run Attendance Tracking**
   - **Attendance Counter**: Digital card displays **"X RUNS ATTENDED"** and milestone tiers:
     - 🏃 **Rookie Runner** (0 runs)
     - ⚡ **Active Runner** (1–3 runs)
     - 🏆 **Pacesetter** (4–9 runs)
     - 🌟 **Surge Legend** (10+ runs)
   - Self check-in on run day or organizer check-in from the run roster modal.
   - Attended runs history log showing date, distance, and location.

4. **Club Roster & WhatsApp Batch Importer**
   - Includes the complete features from the original `Surge Member Records.html`:
   - Summary breakdown of total members, members joined in the last 7 days, health note alerts, and goal breakdown bars.
   - **WhatsApp Paste Tool**: Paste single or bulk WhatsApp registration messages; automatically parses and saves them to the SQLite database.
   - Real-time search filter and **Download CSV** export.

---

## 🚀 Quick Start (Single Command)

To run the entire app (both backend and React frontend):

```bash
./start.sh
```

Or run via Python directly:

```bash
backend/venv/bin/python backend/run.py
```

Open your browser at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 💻 Development Mode (FastAPI + Vite Hot Reload)

If you wish to run the Vite dev server with Hot Module Replacement (HMR):

### 1. Start the Backend:
```bash
backend/venv/bin/python backend/run.py
```
*(Runs on `http://127.0.0.1:8000`)*

### 2. Start the Frontend Dev Server:
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5173`, proxying `/api` requests to the FastAPI backend)*

---

## 🔑 Demo Accounts (Pre-Seeded)

| Account | Email | Password | Role | Description |
|---|---|---|---|---|
| **Club Organizer** | `admin@surge.club` | `admin123` | Organizer / Lead | Can schedule new runs, manage members, and mark attendances |
| **Active Member** | `rahul@example.com` | `member123` | Member | Registered runner with 1 attended run |
| **New Runner** | Register via UI | Your choice | Member | Mints a new card instantly |

---

## 🗄️ Database Schema (`surge_club.db`)

- **`users`**: `id`, `email`, `password_hash`, `role`, `created_at`
- **`members`**: `id` (e.g. `SRG-26-K7M4-Q2XH`), `user_id`, `name`, `phone`, `goal`, `level`, `health`, `issued_at`, `added_at`
- **`runs`**: `id`, `title`, `date`, `time`, `location`, `distance_km`, `pace_groups`, `description`, `status`, `created_by`, `created_at`
- **`run_registrations`**: `id`, `run_id`, `user_id`, `member_id`, `registered_at`, `attended` (0 or 1), `attended_at`, `notes`
