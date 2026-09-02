import socket
import concurrent.futures
from urllib.parse import urlparse

class NmapScanner:
    def __init__(self, target: str, scan_type: str = "full"):
        self.raw_target = target
        self.target = self._normalize_target(target)
        self.scan_type = (scan_type or "full").lower()
        
        # Comprehensive port map with service descriptions
        self.all_ports = {
            21: ("ftp", "File Transfer Protocol"),
            22: ("ssh", "OpenSSH / Dropbear SSH"),
            23: ("telnet", "Telnet Service"),
            25: ("smtp", "Simple Mail Transfer"),
            53: ("dns", "Domain Name System"),
            80: ("http", "Web Server (HTTP)"),
            110: ("pop3", "Post Office Protocol v3"),
            143: ("imap", "Internet Message Access Protocol"),
            443: ("https", "Secure Web Server (HTTPS)"),
            445: ("microsoft-ds", "Server Message Block (SMB)"),
            1433: ("ms-sql", "Microsoft SQL Server"),
            3000: ("node-dev", "Next.js / Node.js Web Server"),
            3306: ("mysql", "MySQL / MariaDB Database"),
            3389: ("ms-wbt-server", "Microsoft Remote Desktop (RDP)"),
            5432: ("postgresql", "PostgreSQL Database"),
            6379: ("redis", "Redis Key-Value Store"),
            8000: ("fastapi", "FastAPI / Uvicorn API"),
            8080: ("http-proxy", "HTTP Alternate / Proxy"),
            8443: ("https-alt", "HTTPS Alternate"),
            9000: ("sonar", "SonarQube / Portainer"),
            27017: ("mongodb", "MongoDB Database"),
        }
        
        self.quick_ports = {
            21: ("ftp", "File Transfer Protocol"),
            22: ("ssh", "OpenSSH / Dropbear SSH"),
            23: ("telnet", "Telnet Service"),
            80: ("http", "Web Server (HTTP)"),
            443: ("https", "Secure Web Server (HTTPS)"),
            3000: ("node-dev", "Next.js / Node.js Web Server"),
            3306: ("mysql", "MySQL / MariaDB Database"),
            5432: ("postgresql", "PostgreSQL Database"),
            8000: ("fastapi", "FastAPI / Uvicorn API"),
            8080: ("http-proxy", "HTTP Alternate / Proxy"),
        }

    def _normalize_target(self, target: str) -> str:
        target = target.strip()
        if target.startswith("http://") or target.startswith("https://"):
            parsed = urlparse(target)
            if parsed.hostname:
                return parsed.hostname
        return target.split("/")[0].split(":")[0].strip()

    def _scan_port(self, port: int, service_info: tuple):
        service_name, product = service_info
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.75)
            result = sock.connect_ex((self.target, port))
            if result == 0:
                version = "Active"
                try:
                    sock.sendall(b"HEAD / HTTP/1.0\r\n\r\n")
                    banner = sock.recv(256).decode(errors="ignore").strip()
                    if banner:
                        if "Server:" in banner:
                            for line in banner.split("\n"):
                                if line.lower().startswith("server:"):
                                    version = line.split(":", 1)[1].strip()
                                    break
                        else:
                            first_line = banner.split("\n")[0].strip()
                            if first_line:
                                version = first_line[:50]
                except Exception:
                    pass
                sock.close()
                return {
                    "port": port,
                    "protocol": "tcp",
                    "state": "open",
                    "service": service_name,
                    "version": version
                }
            sock.close()
        except Exception:
            pass
        return None

    def scan(self):
        open_ports = []
        port_dict = self.quick_ports if self.scan_type == "quick" else self.all_ports
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
            future_to_port = {
                executor.submit(self._scan_port, port, info): port 
                for port, info in port_dict.items()
            }
            for future in concurrent.futures.as_completed(future_to_port):
                result = future.result()
                if result:
                    open_ports.append(result)
                    
        open_ports.sort(key=lambda x: x["port"])
        return {"ports": open_ports}
