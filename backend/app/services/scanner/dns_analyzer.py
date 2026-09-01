import dns.resolver
import dns.exception

class DNSAnalyzer:
    def __init__(self, target: str):
        self.target = target
        self.resolver = dns.resolver.Resolver()
        self.resolver.timeout = 5
        self.resolver.lifetime = 5

    def analyze(self):
        results = {}
        record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME']
        
        for record_type in record_types:
            try:
                answers = self.resolver.resolve(self.target, record_type)
                results[record_type] = [rdata.to_text() for rdata in answers]
            except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.exception.Timeout, dns.resolver.NoNameservers):
                results[record_type] = []
            except Exception as e:
                print(f"DNS query failed for {record_type}: {e}")
                results[record_type] = []
                
        # Basic DNSsec check
        try:
            # We would do a more thorough check in reality, but this is a stub
            self.resolver.use_edns(0, dns.flags.DO, 4096)
            answers = self.resolver.resolve(self.target, 'A')
            # Check for RRSIG in response
            results['dnssec_enabled'] = bool(answers.response.find_rrset(answers.response.answer, dns.name.from_text(self.target), dns.rdataclass.IN, dns.rdatatype.RRSIG))
        except Exception:
             results['dnssec_enabled'] = False

        return results
