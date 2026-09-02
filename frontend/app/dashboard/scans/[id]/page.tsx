"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Shield,
  Download,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Wrench,
  FileCode,
  Check,
} from "lucide-react";
import { fetchScan } from "@/lib/api";

export default function ScanReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const scanId = parseInt(resolvedParams.id, 10);
  const [scan, setScan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadScan = async () => {
    try {
      const data = await fetchScan(scanId);
      setScan(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load scan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!scan) return;
    const blob = new Blob([JSON.stringify(scan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `netsentinel_scan_${scan.scan_number || scan.id}_${scan.target || "report"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadScan();
    // Auto-refresh if scan is pending or running
    let interval: NodeJS.Timeout;
    if (scan && (scan.status === "pending" || scan.status === "running" || scan.status === "in_progress")) {
      interval = setInterval(loadScan, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scan?.status]);

  if (isLoading && !scan) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-muted-foreground">
          <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
          <p>Loading scan report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-center">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <Link href="/dashboard/scans" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Scans
        </Link>
      </div>
    );
  }

  if (!scan) return null;

  const isScanning = scan.status === "pending" || scan.status === "running" || scan.status === "in_progress";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/scans" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 font-mono font-bold">
                Scan #{scan.scan_number || scan.id}
              </span>
              <span>Scan Report: {scan.target || `Target #${scan.target_id}`}</span>
            </h2>
            <p className="text-muted-foreground text-sm flex items-center mt-1">
              Started on {new Date(scan.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isScanning && (
            <button 
              onClick={loadScan}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </button>
          )}
          {scan.status === "completed" && (
            <button 
              onClick={handleExport}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </button>
          )}
        </div>
      </div>

      {/* Vulnerability Posture Executive Banner */}
      {scan.status === "completed" && (
        <div>
          {(scan.findings && scan.findings.filter((f: any) => ["Critical", "High", "Medium"].includes(f.severity)).length > 0) ? (
            <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-destructive/20 border border-destructive/30 text-destructive shrink-0 mt-0.5">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-destructive tracking-tight">
                      Target Is Vulnerable
                    </h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-black tracking-wider uppercase">
                      Action Required
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                    Security vulnerabilities and exposed services were identified that leave this target susceptible to unauthorized access, credential sniffing, or service compromise.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {scan.findings.filter((f: any) => f.severity === "Critical").length > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-destructive/20 text-destructive text-xs font-bold border border-destructive/30">
                    {scan.findings.filter((f: any) => f.severity === "Critical").length} Critical
                  </span>
                )}
                {scan.findings.filter((f: any) => f.severity === "High").length > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-500 text-xs font-bold border border-orange-500/30">
                    {scan.findings.filter((f: any) => f.severity === "High").length} High
                  </span>
                )}
                {scan.findings.filter((f: any) => f.severity === "Medium").length > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-500 text-xs font-bold border border-amber-500/30">
                    {scan.findings.filter((f: any) => f.severity === "Medium").length} Medium
                  </span>
                )}
                {scan.findings.filter((f: any) => f.severity === "Low").length > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-500 text-xs font-bold border border-blue-500/30">
                    {scan.findings.filter((f: any) => f.severity === "Low").length} Low
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-3.5 shadow-sm">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 shrink-0 mt-0.5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-emerald-500 tracking-tight">
                    No High-Risk Vulnerabilities Detected
                  </h3>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black tracking-wider uppercase border border-emerald-500/30">
                    Hardened
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  No critical or high-risk vulnerabilities were identified on discovered endpoints. Network and web services enforce standard security configurations.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-2">Scan Status</div>
          <div className="text-xl font-bold capitalize flex items-center">
            {scan.status === 'running' || scan.status === 'in_progress' ? (
              <><span className="relative flex h-3 w-3 mr-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span> Running</>
            ) : scan.status === 'completed' ? (
              <><span className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></span> Completed</>
            ) : scan.status === 'failed' ? (
              <><span className="h-3 w-3 rounded-full bg-destructive mr-2"></span> Failed</>
            ) : (
              <><span className="h-3 w-3 rounded-full bg-amber-400 mr-2 animate-pulse"></span> Pending</>
            )}
          </div>
        </div>
        
        <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-2">Calculated Risk Score</div>
          <div className="text-2xl font-bold">
            {scan.risk_score !== null ? scan.risk_score : "-"}
            <span className="text-sm font-normal text-muted-foreground ml-2">/ 100</span>
          </div>
        </div>
        
        <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-2">Open Ports Found</div>
          <div className="text-2xl font-bold">
            {scan.ports ? scan.ports.filter((p: any) => p.state === 'open').length : "-"}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-2">Identified Vulnerabilities</div>
          <div className={`text-2xl font-bold ${scan.findings && scan.findings.length > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
            {scan.findings ? scan.findings.length : "-"}
          </div>
        </div>
      </div>

      {/* Discovered Services (Ports) Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center border-b border-border/40 pb-2">
          <Server className="mr-2 h-5 w-5 text-primary" />
          Discovered Services & Port Vulnerability Status
        </h3>
        
        {!scan.ports || scan.ports.length === 0 ? (
          <div className="p-8 text-center border border-border/40 rounded-xl bg-card text-muted-foreground">
             {scan.status === "completed" ? "No open ports found on this target." : "Waiting for scan results..."}
          </div>
        ) : (
          <div className="border border-border/40 rounded-xl overflow-hidden bg-card shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-semibold">Port</th>
                  <th className="px-6 py-3 font-semibold">Service</th>
                  <th className="px-6 py-3 font-semibold">Version / Banner</th>
                  <th className="px-6 py-3 font-semibold">Port State</th>
                  <th className="px-6 py-3 font-semibold">Vulnerability Posture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {scan.ports.map((port: any) => {
                  const status = port.vulnerability_status || (port.port_number === 443 ? "Safe" : "Exposed");
                  return (
                    <tr key={port.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-foreground">
                        {port.port_number} <span className="text-xs font-normal text-muted-foreground uppercase">/{port.protocol}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {port.service_name || port.service || (port.port_number === 80 ? "http" : port.port_number === 443 ? "https" : "-")}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs truncate max-w-xs">
                        {port.service_version || port.version || "Active"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          port.state === 'open' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-muted text-muted-foreground'
                        }`}>
                          {port.state}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {status === "Vulnerable" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-destructive/15 text-destructive border border-destructive/25 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive mr-1.5 animate-pulse"></span>
                            Vulnerable
                          </span>
                        ) : status === "At Risk" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                            At Risk
                          </span>
                        ) : status === "Exposed" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-500 border border-blue-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                            Exposed Service
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            Safe / Secured
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Findings & Vulnerability Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center border-b border-border/40 pb-2">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Vulnerability Findings & Detailed Remediation
        </h3>
        
        {!scan.findings || scan.findings.length === 0 ? (
          <div className="p-8 text-center border border-border/40 rounded-xl bg-card text-muted-foreground">
            {scan.status === "completed" ? "No vulnerabilities found on this target. Good job!" : "Scan is still running or findings are not available yet."}
          </div>
        ) : (
          <div className="space-y-4">
            {scan.findings.map((finding: any) => (
              <div key={finding.id} className="p-5 border border-border/40 rounded-xl bg-card hover:border-border/80 transition-all shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <h4 className="font-bold text-base text-foreground">{finding.title}</h4>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${
                      finding.severity === 'Critical' ? 'bg-destructive text-destructive-foreground' :
                      finding.severity === 'High' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                      finding.severity === 'Medium' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {finding.severity}
                    </span>
                    {finding.category && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border/50">
                        {finding.category}
                      </span>
                    )}
                    {finding.cve_id && (
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        {finding.cve_id}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {finding.description}
                </p>

                {finding.evidence && (
                  <div className="p-3 rounded-lg bg-background/60 border border-border/50 text-xs">
                    <div className="font-bold text-muted-foreground flex items-center mb-1">
                      <FileCode className="w-3.5 h-3.5 mr-1.5 text-primary" />
                      Observed Evidence / Technical Details
                    </div>
                    <code className="text-foreground/90 font-mono break-all">{finding.evidence}</code>
                  </div>
                )}

                {finding.remediation && (
                  <div className="p-3.5 rounded-lg bg-primary/10 border border-primary/25 text-xs">
                    <div className="font-bold text-primary flex items-center mb-1">
                      <Wrench className="w-3.5 h-3.5 mr-1.5" />
                      Recommended Remediation
                    </div>
                    <p className="text-foreground/90 leading-relaxed font-medium">{finding.remediation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
