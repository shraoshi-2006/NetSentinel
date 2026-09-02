from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_user_isolation():
    # 1. User Alice creates a scan
    alice_headers = {"X-User-ID": "usr_alice_test"}
    res = client.post("/api/v1/scans", json={"target": "127.0.0.1", "scan_type": "quick"}, headers=alice_headers)
    assert res.status_code == 200, res.text
    alice_scan_id = res.json()["id"]

    # 2. User Bob creates a scan
    bob_headers = {"X-User-ID": "usr_bob_test"}
    res = client.post("/api/v1/scans", json={"target": "192.168.1.1", "scan_type": "quick"}, headers=bob_headers)
    assert res.status_code == 200, res.text
    bob_scan_id = res.json()["id"]

    # 3. User Alice queries scans: MUST only see Alice's scans!
    res = client.get("/api/v1/scans", headers=alice_headers)
    assert res.status_code == 200
    alice_scans = res.json()
    alice_ids = [s["id"] for s in alice_scans]
    assert alice_scan_id in alice_ids
    assert bob_scan_id not in alice_ids

    # 4. User Bob queries scans: MUST only see Bob's scans!
    res = client.get("/api/v1/scans", headers=bob_headers)
    assert res.status_code == 200
    bob_scans = res.json()
    bob_ids = [s["id"] for s in bob_scans]
    assert bob_scan_id in bob_ids
    assert alice_scan_id not in bob_ids

    # 5. User Charlie (outsider visiting the link for the first time)
    charlie_headers = {"X-User-ID": "usr_charlie_outsider"}
    res = client.get("/api/v1/scans", headers=charlie_headers)
    assert res.status_code == 200
    assert len(res.json()) == 0, "Charlie should see 0 scans from others!"

    # 6. Charlie tries to view Alice's scan directly by ID
    res = client.get(f"/api/v1/scans/{alice_scan_id}", headers=charlie_headers)
    assert res.status_code == 404, "Charlie should not be able to view Alice's scan report!"

    # 7. Charlie queries security score
    res = client.get("/api/v1/security-score", headers=charlie_headers)
    assert res.status_code == 200
    score_data = res.json()
    assert score_data["has_data"] is False
    assert score_data["overall_score"] is None
    assert len(score_data["history"]) == 0

    print("ALL USER ISOLATION TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_user_isolation()
