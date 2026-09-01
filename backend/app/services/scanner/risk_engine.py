def calculate_risk_score(findings, ports) -> int:
    score = 0
    
    # Base calculation
    for finding in findings:
        if finding.severity == "Critical":
            score += 25
        elif finding.severity == "High":
            score += 15
        elif finding.severity == "Medium":
            score += 10
        elif finding.severity == "Low":
            score += 5
        elif finding.severity == "Info":
            score += 1

    # Ports
    for port in ports:
        if port.state == "open":
            if port.port_number in [21, 22, 23, 139, 445, 3306, 3389, 5432]:
                score += 10
            else:
                score += 2

    # Cap at 100
    if score > 100:
        score = 100
        
    return score
