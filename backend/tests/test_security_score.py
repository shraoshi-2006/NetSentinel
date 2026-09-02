from app.services.scanner.security_score import (
    calculate_overall_security_score,
    calculate_risk_breakdown,
    calculate_category_scores,
    generate_recommendations,
    extract_top_issues,
    get_rating_from_score,
)


class MockFinding:
    def __init__(self, title, category, severity, remediation=None, description=""):
        self.id = 1
        self.title = title
        self.category = category
        self.severity = severity
        self.remediation = remediation
        self.description = description
        self.evidence = "Port open"
        self.confidence = "High"
        self.cve_id = None


class MockPort:
    def __init__(self, port_number, state="open", service_name=None):
        self.port_number = port_number
        self.state = state
        self.service_name = service_name
        self.protocol = "tcp"


def test_rating_mapping():
    assert get_rating_from_score(95) == "Excellent"
    assert get_rating_from_score(80) == "Good"
    assert get_rating_from_score(65) == "Moderate"
    assert get_rating_from_score(45) == "Poor"
    assert get_rating_from_score(20) == "Critical"


def test_score_calculation():
    # Base 100 - 15 (Critical) - 8 (High) - 4 (Medium) - 1 (Low) = 72
    findings = [
        MockFinding("Telnet Exposed", "Network Services", "Critical"),
        MockFinding("FTP Exposed", "Network Services", "High"),
        MockFinding("HTTP Plaintext", "Web Security", "Medium"),
        MockFinding("SSH Exposed", "Remote Access", "Low"),
    ]
    ports = [MockPort(22), MockPort(80)]
    score, rating = calculate_overall_security_score(findings, ports)
    assert score == 72
    assert rating == "Moderate"


def test_risk_breakdown():
    findings = [
        MockFinding("Telnet Exposed", "Network Services", "Critical"),
        MockFinding("FTP Exposed", "Network Services", "High"),
        MockFinding("HTTP Plaintext", "Web Security", "Medium"),
    ]
    breakdown = calculate_risk_breakdown(findings)
    assert breakdown["critical"] == 1
    assert breakdown["high"] == 1
    assert breakdown["medium"] == 1
    assert breakdown["total"] == 3
    assert breakdown["percentages"]["critical"] == 33.3


def test_category_scores():
    findings = [
        MockFinding("Telnet Exposed", "Network Services", "Critical"),
        MockFinding("HTTP Plaintext", "Web Security", "Medium"),
    ]
    ports = [MockPort(23), MockPort(80)]
    categories = calculate_category_scores(findings, ports)
    assert categories["network_security"] is not None
    assert categories["network_security"] < 100
    assert categories["web_security"] is not None
    assert categories["port_security"] is not None


def test_recommendations_generation():
    findings = [MockFinding("Telnet Exposed", "Network Services", "Critical")]
    ports = [MockPort(23)]
    recs = generate_recommendations(findings, ports)
    assert len(recs) > 0
    assert any("Telnet" in r["title"] for r in recs)


if __name__ == "__main__":
    test_rating_mapping()
    test_score_calculation()
    test_risk_breakdown()
    test_category_scores()
    test_recommendations_generation()
    print("ALL BACKEND SECURITY SCORE TESTS PASSED SUCCESSFULLY!")
