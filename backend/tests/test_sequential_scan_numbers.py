from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_sequential_scan_numbers():
    # 1. Alice creates her 1st scan
    alice_headers = {"X-User-ID": "usr_seq_alice"}
    r1 = client.post("/api/v1/scans", json={"target": "10.0.0.1", "scan_type": "quick"}, headers=alice_headers)
    assert r1.status_code == 200
    scan_a1 = r1.json()
    assert scan_a1["scan_number"] == 1, f"Expected Alice scan 1 to have scan_number 1, got {scan_a1['scan_number']}"

    # 2. Alice creates her 2nd scan
    r2 = client.post("/api/v1/scans", json={"target": "10.0.0.2", "scan_type": "quick"}, headers=alice_headers)
    assert r2.status_code == 200
    scan_a2 = r2.json()
    assert scan_a2["scan_number"] == 2, f"Expected Alice scan 2 to have scan_number 2, got {scan_a2['scan_number']}"

    # 3. Bob (outsider) enters website and creates his 1st scan
    bob_headers = {"X-User-ID": "usr_seq_bob"}
    r3 = client.post("/api/v1/scans", json={"target": "192.168.10.1", "scan_type": "quick"}, headers=bob_headers)
    assert r3.status_code == 200
    scan_b1 = r3.json()
    assert scan_b1["scan_number"] == 1, f"Expected Bob's 1st scan to be #1 for him, got {scan_b1['scan_number']}"

    # 4. Bob creates his 2nd scan
    r4 = client.post("/api/v1/scans", json={"target": "192.168.10.2", "scan_type": "quick"}, headers=bob_headers)
    assert r4.status_code == 200
    scan_b2 = r4.json()
    assert scan_b2["scan_number"] == 2, f"Expected Bob's 2nd scan to be #2 for him, got {scan_b2['scan_number']}"

    # 5. Check Bob's scan list
    r5 = client.get("/api/v1/scans", headers=bob_headers)
    assert r5.status_code == 200
    bob_scans = r5.json()
    assert len(bob_scans) == 2
    assert bob_scans[0]["scan_number"] == 2
    assert bob_scans[1]["scan_number"] == 1

    print("ALL SEQUENTIAL SCAN NUMBER TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_sequential_scan_numbers()
