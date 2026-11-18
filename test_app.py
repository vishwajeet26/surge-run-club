import sys
from backend.app.main import (
    register, login, get_me, get_my_card, list_runs, get_run_details,
    register_for_run, toggle_attendance, batch_whatsapp, get_club_stats
)
from backend.app.schemas import (
    RegisterRequest, LoginRequest, AttendanceToggle, BatchWhatsAppRequest
)
from backend.app.database import get_db

def test_full_flow():
    print("=== Testing 1: Register New Runner ===")
    reg_req = RegisterRequest(
        email="arjun@test.com",
        password="password123",
        name="Arjun Mehta",
        phone="9876543210",
        goal="10K Goal",
        level="Intermediate",
        health="None"
    )
    # If already registered in a previous run, cleanup first
    with get_db() as conn:
        conn.execute("DELETE FROM users WHERE email = 'arjun@test.com'")
        conn.execute("DELETE FROM members WHERE phone = '9876543210'")

    data = register(reg_req)
    token = data["token"]
    user = data["user"]
    member = data["member"]
    print(f"Registered successfully! User ID: {user['id']}, Member ID: {member['id']}")
    assert member["id"].startswith("SRG-26-"), "Member ID must start with SRG-26-"
    assert member["name"] == "Arjun Mehta"

    current_user = {"id": user["id"], "email": user["email"], "role": user["role"]}

    print("\n=== Testing 2: Get My Card & Stats ===")
    card = get_my_card(current_user)
    assert card["member"]["name"] == "Arjun Mehta"
    assert card["stats"]["runs_attended"] == 0
    print(f"Card verified: {card['member']['name']} ({card['member']['id']}) - Attended: {card['stats']['runs_attended']}")

    print("\n=== Testing 3: List Runs ===")
    runs = list_runs(None, current_user)
    assert len(runs) > 0
    first_run = runs[0]
    run_id = first_run["id"]
    print(f"Found {len(runs)} runs. Selected Run ID {run_id}: {first_run['title']}")

    print("\n=== Testing 4: Free Registration for Run ===")
    rsvp_res = register_for_run(run_id, current_user)
    print(f"RSVP Result: {rsvp_res['message']}")
    assert rsvp_res["ok"] is True

    # Check run details
    details = get_run_details(run_id, current_user)
    assert details["is_registered"] is True
    attendee_names = [a["name"] for a in details["attendees"]]
    assert "Arjun Mehta" in attendee_names
    print(f"Verified registered in roster: {attendee_names}")

    print("\n=== Testing 5: Check In / Mark Attendance ===")
    att_res = toggle_attendance(run_id, user["id"], AttendanceToggle(user_id=user["id"], attended=True), current_user)
    print(f"Attendance toggled! Runs Attended: {att_res['runs_attended']}, Tier: {att_res['badge']['title']}")
    assert att_res["runs_attended"] == 1
    assert att_res["attended"] is True

    # Re-fetch card to verify updated stats
    updated_card = get_my_card(current_user)
    assert updated_card["stats"]["runs_attended"] == 1
    assert len(updated_card["attended_runs"]) == 1
    print(f"Confirmed member card now shows {updated_card['stats']['runs_attended']} runs attended!")

    print("\n=== Testing 6: Batch WhatsApp Import ===")
    sample_whatsapp = """Hi Surge! I just registered.
Name: Tanvi Sen
Member ID: SRG-26-TNV8-7712
WhatsApp: 9988776655
Goal: 5K Finisher
Level: Beginner
Issued: 18 NOV 2026
Injuries or health notes: Minor shin splints"""
    with get_db() as conn:
        conn.execute("DELETE FROM members WHERE id = 'SRG-26-TNV8-7712'")

    batch_res = batch_whatsapp(BatchWhatsAppRequest(text=sample_whatsapp), current_user)
    print(f"Batch import result: {batch_res}")
    assert batch_res["added"] == 1

    with get_db() as conn:
        tanvi = conn.execute("SELECT * FROM members WHERE id = 'SRG-26-TNV8-7712'").fetchone()
        assert tanvi is not None
        assert tanvi["name"] == "Tanvi Sen"
        print(f"Tanvi verified in DB: {tanvi['id']} | Health: {tanvi['health']}")

    print("\n=== Testing 7: Club Stats ===")
    stats = get_club_stats()
    print(f"Club Stats: Total Members: {stats['total_members']}, Runs: {stats['total_runs']}, Attendances: {stats['total_attendances']}")
    assert stats["total_members"] >= 5

    print("\n==========================================")
    print(">>> ALL BACKEND & CLUB TESTS PASSED! <<<")
    print("==========================================")

if __name__ == "__main__":
    test_full_flow()
