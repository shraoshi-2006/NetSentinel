from typing import List, Dict, Any, Optional, Tuple


def get_rating_from_score(score: int) -> str:
    if score >= 90:
        return "Excellent"
    elif score >= 75:
        return "Good"
    elif score >= 60:
        return "Moderate"
    elif score >= 40:
        return "Poor"
    else:
        return "Critical"


def calculate_overall_security_score(findings: List[Any], ports: List[Any]) -> Tuple[int, str]:
    """
    Calculate an overall security score from 0 to 100 based on findings and open ports.
    Base score: 100
    Deductions:
      - Critical: -15 points each
      - High: -8 points each
      - Medium: -4 points each
      - Low: -1 point each
    """
    score = 100

    # Finding deductions
    for finding in findings:
        sev = (getattr(finding, "severity", "") or "").capitalize()
        if sev == "Critical":
            score -= 15
        elif sev == "High":
            score -= 8
        elif sev == "Medium":
            score -= 4
        elif sev == "Low":
            score -= 1

    # Port deductions for unhedged risky services
    risky_ports = {21, 23, 139, 445, 1433, 3306, 3389, 5432, 6379, 27017}
    open_ports = [p for p in ports if getattr(p, "state", "") == "open"]
    
    # If there are open risky ports, add small deduction
    for p in open_ports:
        port_num = getattr(p, "port_number", 0)
        if port_num in risky_ports:
            score -= 2

    # Cap score cleanly between 0 and 100
    score = max(0, min(100, score))
    rating = get_rating_from_score(score)
    return score, rating


def calculate_risk_breakdown(findings: List[Any]) -> Dict[str, Any]:
    counts = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0,
    }

    for finding in findings:
        sev = (getattr(finding, "severity", "") or "").lower()
        if sev in counts:
            counts[sev] += 1

    total = sum(counts.values())
    
    percentages = {
        "critical": round((counts["critical"] / total) * 100, 1) if total > 0 else 0.0,
        "high": round((counts["high"] / total) * 100, 1) if total > 0 else 0.0,
        "medium": round((counts["medium"] / total) * 100, 1) if total > 0 else 0.0,
        "low": round((counts["low"] / total) * 100, 1) if total > 0 else 0.0,
        "info": round((counts["info"] / total) * 100, 1) if total > 0 else 0.0,
    }

    return {
        "critical": counts["critical"],
        "high": counts["high"],
        "medium": counts["medium"],
        "low": counts["low"],
        "info": counts["info"],
        "total": total,
        "percentages": percentages,
    }


def calculate_category_scores(findings: List[Any], ports: List[Any]) -> Dict[str, Optional[int]]:
    """
    Calculate category scores (0-100) or None if no relevant data exists.
    Categories:
      - Network Security
      - Port Security
      - Service Security
      - Vulnerability Security
      - Configuration Security
      - Web Security
    """
    open_ports = [p for p in ports if getattr(p, "state", "") == "open"]
    open_port_numbers = {getattr(p, "port_number", 0) for p in open_ports}

    # 1. Network Security: Exposed raw protocols, dangerous open ports
    if not ports and not findings:
        network_security = None
    else:
        net_score = 100
        for f in findings:
            cat = (getattr(f, "category", "") or "").lower()
            sev = (getattr(f, "severity", "") or "").capitalize()
            if "network" in cat or "remote" in cat:
                if sev == "Critical":
                    net_score -= 20
                elif sev == "High":
                    net_score -= 12
                elif sev == "Medium":
                    net_score -= 6
                elif sev == "Low":
                    net_score -= 2
        
        if 23 in open_port_numbers:  # Telnet
            net_score -= 15
        if 21 in open_port_numbers:  # FTP
            net_score -= 10
        if 445 in open_port_numbers or 139 in open_port_numbers:  # SMB
            net_score -= 10
            
        network_security = max(0, min(100, net_score))

    # 2. Port Security: Number and sensitivity of open ports
    if not ports:
        port_security = None
    else:
        port_score = 100
        risky = {21, 23, 139, 445, 1433, 3306, 3389, 5432, 6379, 27017}
        for port_num in open_port_numbers:
            if port_num in risky:
                port_score -= 12
            elif port_num not in {80, 443}:
                port_score -= 4
        port_security = max(0, min(100, port_score))

    # 3. Service Security: Service-level security and exposures
    services_found = [p for p in open_ports if getattr(p, "service_name", None)]
    if not services_found and not any("service" in (getattr(f, "category", "") or "").lower() for f in findings):
        if open_ports:
            srv_score = 100
            for p in open_ports:
                if getattr(p, "port_number", 0) in {21, 23, 3389}:
                    srv_score -= 15
            service_security = max(0, min(100, srv_score))
        else:
            service_security = None
    else:
        srv_score = 100
        for f in findings:
            cat = (getattr(f, "category", "") or "").lower()
            sev = (getattr(f, "severity", "") or "").capitalize()
            if "service" in cat or "application" in cat or "database" in cat:
                if sev == "Critical":
                    srv_score -= 20
                elif sev == "High":
                    srv_score -= 12
                elif sev == "Medium":
                    srv_score -= 6
                elif sev == "Low":
                    srv_score -= 2
        service_security = max(0, min(100, srv_score))

    # 4. Vulnerability Security: General vulnerability posture
    if not findings and not ports:
        vulnerability_security = None
    else:
        vuln_score = 100
        for f in findings:
            sev = (getattr(f, "severity", "") or "").capitalize()
            if sev == "Critical":
                vuln_score -= 20
            elif sev == "High":
                vuln_score -= 12
            elif sev == "Medium":
                vuln_score -= 6
            elif sev == "Low":
                vuln_score -= 2
        vulnerability_security = max(0, min(100, vuln_score))

    # 5. Configuration Security: Config weaknesses, unencrypted services, default credentials
    config_findings = [
        f for f in findings
        if any(w in (getattr(f, "title", "") or "").lower() + (getattr(f, "description", "") or "").lower()
               for w in ["config", "unencrypted", "plaintext", "insecure", "exposed", "weak"])
    ]
    if not config_findings and not ports:
        configuration_security = None
    else:
        cfg_score = 100
        for f in config_findings:
            sev = (getattr(f, "severity", "") or "").capitalize()
            if sev == "Critical":
                cfg_score -= 20
            elif sev == "High":
                cfg_score -= 12
            elif sev == "Medium":
                cfg_score -= 6
            elif sev == "Low":
                cfg_score -= 2
        configuration_security = max(0, min(100, cfg_score))

    # 6. Web Security: Web ports (80, 443, 8080, 8443, 3000, 8000) or Web Security findings
    web_ports = {80, 443, 3000, 8000, 8080, 8443, 9000}
    has_web_ports = bool(open_port_numbers.intersection(web_ports))
    web_findings = [f for f in findings if "web" in (getattr(f, "category", "") or "").lower()]

    if not has_web_ports and not web_findings:
        web_security = None
    else:
        web_score = 100
        if 80 in open_port_numbers and 443 not in open_port_numbers:
            web_score -= 20
        for f in web_findings:
            sev = (getattr(f, "severity", "") or "").capitalize()
            if sev == "Critical":
                web_score -= 25
            elif sev == "High":
                web_score -= 15
            elif sev == "Medium":
                web_score -= 8
            elif sev == "Low":
                web_score -= 3
        web_security = max(0, min(100, web_score))

    return {
        "network_security": network_security,
        "port_security": port_security,
        "service_security": service_security,
        "vulnerability_security": vulnerability_security,
        "configuration_security": configuration_security,
        "web_security": web_security,
    }


def generate_recommendations(findings: List[Any], ports: List[Any]) -> List[Dict[str, str]]:
    """
    Generate tailored recommendations ONLY for detected vulnerabilities/risks.
    """
    recommendations: List[Dict[str, str]] = []
    seen_recommendations = set()

    open_ports = [p for p in ports if getattr(p, "state", "") == "open"]
    open_port_numbers = {getattr(p, "port_number", 0) for p in open_ports}

    def add_rec(title: str, description: str, priority: str, category: str):
        if title not in seen_recommendations:
            seen_recommendations.add(title)
            recommendations.append({
                "title": title,
                "description": description,
                "priority": priority,
                "category": category,
            })

    # Telnet recommendation
    if 23 in open_port_numbers or any("telnet" in (getattr(f, "title", "") or "").lower() for f in findings):
        add_rec(
            "Disable Insecure Telnet Service",
            "Telnet transmits all credentials and terminal sessions in cleartext. Immediately terminate Telnet daemon and switch to OpenSSH (port 22) with public-key authentication.",
            "Critical",
            "Network Security"
        )

    # Database exposure recommendation
    db_ports = {1433, 3306, 5432, 6379, 27017}
    found_db_ports = open_port_numbers.intersection(db_ports)
    if found_db_ports or any("database" in (getattr(f, "category", "") or "").lower() for f in findings):
        ports_str = ", ".join(str(p) for p in sorted(found_db_ports)) or "database port"
        add_rec(
            "Restrict Public Database Exposure",
            f"Database services detected on {ports_str}. Bind database listening interfaces to 127.0.0.1 or an isolated private VPC, and place behind a bastion host or VPN.",
            "High",
            "Database Security"
        )

    # RDP exposure recommendation
    if 3389 in open_port_numbers or any("rdp" in (getattr(f, "title", "") or "").lower() for f in findings):
        add_rec(
            "Protect Remote Desktop Protocol (RDP)",
            "Public RDP is a primary attack vector for automated ransomware and brute force attacks. Restrict port 3389 access behind an enterprise VPN with Multi-Factor Authentication (MFA).",
            "High",
            "Remote Access"
        )

    # FTP recommendation
    if 21 in open_port_numbers or any("ftp" in (getattr(f, "title", "") or "").lower() for f in findings):
        add_rec(
            "Replace Unencrypted FTP with SFTP",
            "Plaintext FTP on port 21 is vulnerable to credential sniffing. Migrate file transfer operations to SFTP (SSH File Transfer Protocol) or FTPS with enforced TLS 1.3.",
            "High",
            "Network Security"
        )

    # Web Security & HTTPS recommendation
    if 80 in open_port_numbers or any("plaintext http" in (getattr(f, "title", "") or "").lower() for f in findings):
        add_rec(
            "Enforce HTTPS & HSTS Redirection",
            "HTTP port 80 is serving unencrypted content. Configure automated 301 redirection to HTTPS (port 443) and implement HTTP Strict Transport Security (HSTS) with preloading.",
            "Medium",
            "Web Security"
        )

    # SSH hardening recommendation
    if 22 in open_port_numbers or any("ssh" in (getattr(f, "title", "") or "").lower() for f in findings):
        add_rec(
            "Harden SSH Daemon Configuration",
            "Ensure SSH on port 22 has password authentication disabled (PasswordAuthentication no), root login disabled (PermitRootLogin no), and active rate-limiting (e.g. fail2ban).",
            "Low",
            "Remote Access"
        )

    # General finding remediations
    for finding in findings:
        remediation = getattr(finding, "remediation", None)
        title = getattr(finding, "title", "")
        sev = (getattr(finding, "severity", "") or "Medium").capitalize()
        cat = getattr(finding, "category", "Security Assessment")
        
        if remediation and title not in seen_recommendations:
            add_rec(
                f"Remediate: {title}",
                remediation,
                sev,
                cat
            )

    # Sort recommendations by priority
    priority_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3, "Info": 4}
    recommendations.sort(key=lambda r: priority_order.get(r["priority"], 5))

    return recommendations


def extract_top_issues(findings: List[Any], limit: int = 10) -> List[Dict[str, Any]]:
    """
    Extract and prioritize top security issues sorted by severity.
    """
    priority_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3, "Info": 4}
    
    sorted_findings = sorted(
        findings,
        key=lambda f: priority_order.get((getattr(f, "severity", "") or "").capitalize(), 5)
    )

    issues = []
    for f in sorted_findings[:limit]:
        issues.append({
            "id": getattr(f, "id", None),
            "title": getattr(f, "title", "Security Issue"),
            "category": getattr(f, "category", "General"),
            "severity": (getattr(f, "severity", "") or "Low").capitalize(),
            "confidence": getattr(f, "confidence", None),
            "description": getattr(f, "description", ""),
            "evidence": getattr(f, "evidence", None),
            "remediation": getattr(f, "remediation", "Apply security patches and harden service configuration."),
            "cve_id": getattr(f, "cve_id", None),
        })

    return issues
