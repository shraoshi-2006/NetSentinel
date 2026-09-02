import axios from 'axios';

const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl && envUrl !== "undefined") {
    const clean = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchScans = async () => {
  const response = await api.get('/scans');
  return response.data;
};

export const fetchScan = async (id: number) => {
  const response = await api.get(`/scans/${id}`);
  return response.data;
};

export const createScan = async (target: string, scanType: string = 'full') => {
  const response = await api.post('/scans', {
    target,
    scan_type: scanType,
  });
  return response.data;
};

export interface RiskBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
  percentages: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
    info?: number;
  };
}

export interface CategoryScores {
  network_security: number | null;
  port_security: number | null;
  service_security: number | null;
  vulnerability_security: number | null;
  configuration_security: number | null;
  web_security: number | null;
}

export interface TopSecurityIssue {
  id?: number | null;
  title: string;
  category: string;
  severity: string;
  confidence?: string | null;
  description: string;
  evidence?: string | null;
  remediation?: string | null;
  cve_id?: string | null;
}

export interface SecurityRecommendation {
  title: string;
  description: string;
  priority: string;
  category: string;
}

export interface LastScanInfo {
  id?: number | null;
  target?: string | null;
  scan_type?: string | null;
  status?: string | null;
  date?: string | null;
  vulnerabilities: number;
  security_score?: number | null;
}

export interface ScoreHistoryItem {
  scan_id: number;
  target: string;
  date: string;
  score: number;
  scan_type: string;
}

export interface SecurityScoreData {
  has_data: boolean;
  overall_score: number | null;
  rating: string | null;
  risk_breakdown: RiskBreakdown;
  categories: CategoryScores;
  top_issues: TopSecurityIssue[];
  recommendations: SecurityRecommendation[];
  last_scan: LastScanInfo | null;
  history: ScoreHistoryItem[];
}

export const fetchSecurityScore = async (scanId?: number): Promise<SecurityScoreData> => {
  const params = scanId ? { scan_id: scanId } : {};
  const response = await api.get('/security-score', { params });
  return response.data;
};

