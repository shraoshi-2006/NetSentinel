import httpx
from typing import List, Dict

class NVDClient:
    """Client for National Vulnerability Database API"""
    
    BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.headers = {}
        if self.api_key:
            self.headers["apiKey"] = self.api_key
            
    async def search_cpe(self, cpe_name: str) -> List[Dict]:
        """Search vulnerabilities by CPE name (e.g., cpe:2.3:a:apache:http_server:2.4.49)"""
        params = {
            "cpeName": cpe_name,
            "resultsPerPage": 5
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.BASE_URL,
                    params=params,
                    headers=self.headers,
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    vulnerabilities = data.get("vulnerabilities", [])
                    # Extract useful info
                    parsed_vulns = []
                    for v in vulnerabilities:
                        cve_data = v.get("cve", {})
                        parsed_vulns.append({
                            "id": cve_data.get("id"),
                            "description": cve_data.get("descriptions", [{}])[0].get("value"),
                            "cvss": self._extract_cvss(cve_data)
                        })
                    return parsed_vulns
                else:
                    print(f"NVD API Error: {response.status_code}")
                    return []
            except Exception as e:
                print(f"NVD request failed: {e}")
                return []
                
    def _extract_cvss(self, cve_data: Dict) -> float:
        metrics = cve_data.get("metrics", {})
        if "cvssMetricV31" in metrics:
            return metrics["cvssMetricV31"][0].get("cvssData", {}).get("baseScore", 0.0)
        elif "cvssMetricV30" in metrics:
            return metrics["cvssMetricV30"][0].get("cvssData", {}).get("baseScore", 0.0)
        elif "cvssMetricV2" in metrics:
            return metrics["cvssMetricV2"][0].get("cvssData", {}).get("baseScore", 0.0)
        return 0.0
