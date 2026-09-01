import httpx
import asyncio

class HTTPAnalyzer:
    def __init__(self, target: str):
        self.target = target
        # Add http/https if missing
        if not self.target.startswith("http://") and not self.target.startswith("https://"):
            self.target_url = f"http://{self.target}"
        else:
            self.target_url = self.target

    async def analyze(self):
        results = {
            "headers": {},
            "status_code": None,
            "security_headers": {},
            "tls_info": {}
        }

        try:
            async with httpx.AsyncClient(verify=False, timeout=10.0) as client:
                # Basic HTTP check
                response = await client.get(self.target_url, follow_redirects=True)
                results["status_code"] = response.status_code
                results["headers"] = dict(response.headers)
                
                # Check for security headers
                headers_to_check = [
                    "Strict-Transport-Security",
                    "Content-Security-Policy",
                    "X-Frame-Options",
                    "X-Content-Type-Options",
                    "Referrer-Policy"
                ]
                for header in headers_to_check:
                    if header.lower() in response.headers:
                        results["security_headers"][header] = response.headers[header.lower()]
                    else:
                        results["security_headers"][header] = "Missing"

        except httpx.RequestError as exc:
            print(f"An error occurred while requesting {exc.request.url!r}.")
        
        return results

def run_http_analyzer(target: str):
    analyzer = HTTPAnalyzer(target)
    return asyncio.run(analyzer.analyze())
