import httpx
from typing import Dict, Any

class ShodanClient:
    """Client for Shodan API"""
    
    BASE_URL = "https://api.shodan.io"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    async def get_host_info(self, ip: str) -> Dict[str, Any]:
        """Get information about an IP address from Shodan"""
        if not self.api_key:
            return {"error": "Shodan API key not configured"}
            
        params = {
            "key": self.api_key
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/shodan/host/{ip}",
                    params=params,
                    timeout=10.0
                )
                if response.status_code == 200:
                    return response.json()
                else:
                    return {"error": f"Shodan API Error: {response.status_code}"}
            except Exception as e:
                return {"error": str(e)}
