"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Shield, Download, Activity, Server } from "lucide-react";
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
    a.download = `netsentinel_scan_${scan.id}_${scan.target || "report"}.json`;
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
            <h2 className="text-2xl font-bold tracking-tight flex items-center">
              Scan Report: {scan.target || `Target #${scan.target_id}`}
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-2">Status</div>
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
          <div className="text-sm font-medium text-muted-foreground mb-2">Risk Score</div>
          <div className="text-2xl font-bold">
            {scan.risk_score !== null ? scan.risk_score : "-"}
            <span className="text-sm font-normal text-muted-foreground ml-2">/ 100</span>
          </div>
        </div>
        
        <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-2">Open Ports</div>
          <div className="text-2xl font-bold">
            {scan.ports ? scan.ports.filter((p: any) => p.state === 'open').length : "-"}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-2">Findings</div>
          <div className="text-2xl font-bold text-destructive">
            {scan.findings ? scan.findings.length : "-"}
          </div>
        </div>
      </div>

      {/* Findings Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center border-b border-border/40 pb-2">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Security Findings
        </h3>
        
        {!scan.findings || scan.findings.length === 0 ? (
          <div className="p-8 text-center border border-border/40 rounded-xl bg-card text-muted-foreground">
            {scan.status === "completed" ? "No vulnerabilities found. Good job!" : "Scan is still running or findings are not available yet."}
          </div>
        ) : (
          <div className="space-y-4">
            {scan.findings.map((finding: any) => (
              <div key={finding.id} className="p-4 border border-border/40 rounded-xl bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-lg">{finding.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        finding.severity === 'Critical' ? 'bg-destructive/20 text-destructive' :
                        finding.severity === 'High' ? 'bg-orange-500/20 text-orange-500' :
                        finding.severity === 'Medium' ? 'bg-amber-500/20 text-amber-500' :
                        'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {finding.severity}
                      </span>
                    </div>
                    <p className="mt-2 text-muted-foreground">{finding.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ports Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center border-b border-border/40 pb-2">
          <Server className="mr-2 h-5 w-5 text-primary" />
          Discovered Services
        </h3>
        
        {!scan.ports || scan.ports.length === 0 ? (
          <div className="p-8 text-center border border-border/40 rounded-xl bg-card text-muted-foreground">
             {scan.status === "completed" ? "No open ports found." : "Waiting for scan results..."}
          </div>
        ) : (
          <div className="border border-border/40 rounded-xl overflow-hidden bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Port</th>
                  <th className="px-6 py-3 font-medium">Protocol</th>
                  <th className="px-6 py-3 font-medium">State</th>
                  <th className="px-6 py-3 font-medium">Service</th>
                  <th className="px-6 py-3 font-medium">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {scan.ports.map((port: any) => (
                  <tr key={port.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{port.port_number}</td>
                    <td className="px-6 py-4">{port.protocol}</td>
                    <td className="px-6 py-4">
                      <span className={port.state === 'open' ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}>
                        {port.state}
                      </span>
                    </td>
                    <td className="px-6 py-4">{port.service || '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{port.version || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
