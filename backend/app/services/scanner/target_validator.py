import re
import ipaddress
from urllib.parse import urlparse

def validate_target(target: str) -> str:
    """
    Normalizes and validates a target, preventing SSRF on private/loopback networks.
    Returns the target type: URL, IP, or Domain.
    """
    target = target.strip()
    
    if target.startswith("http://") or target.startswith("https://"):
        parsed = urlparse(target)
        hostname = parsed.hostname
        if not hostname:
            raise ValueError("Invalid URL format.")
        validate_hostname_or_ip(hostname)
        return "URL"
    
    # Check if it's an IP
    try:
        ip = ipaddress.ip_address(target)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            raise ValueError("Scanning private/loopback IP addresses is prohibited.")
        return "IP"
    except ValueError:
        pass # Not an IP
    
    # Validate Domain/Hostname
    validate_hostname_or_ip(target)
    return "Domain"

def validate_hostname_or_ip(hostname: str):
    # Prevent localhost
    if hostname.lower() in ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]:
        raise ValueError("Scanning localhost is prohibited.")
    
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            raise ValueError("Scanning private/loopback IP addresses is prohibited.")
        return
    except ValueError:
        pass
    
    # Basic domain regex
    domain_regex = re.compile(
        r'^(?:[a-zA-Z0-9]' # First character of the domain
        r'(?:[a-zA-Z0-9-_]{0,61}[a-zA-Z0-9])?\.)' # Sub domain + hostname
        r'+[a-zA-Z]{2,6}$' # Top level domain
    )
    if not domain_regex.match(hostname):
        raise ValueError("Invalid domain format.")
