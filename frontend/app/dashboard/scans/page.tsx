"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Search, Shield, RefreshCw } from "lucide-react";
import { fetchScans } from "@/lib/api";

export default function ScansPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadScans = async () => {
    setIsLoading(true);
    try {
      const data = await fetchScans();
      setScans(data);
    } catch (error) {
      console.error("Failed to fetch scans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Completed</span>;
      case "running":
      case "in_progress":
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse">Running</span>;
      case "failed":
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-destructive/10 text-destructive border-destructive/20">Failed</span>;
      default:
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground border-border">Pending</span>;
    }
  };

  const getRiskBadge = (score: number | null) => {
    if (score === null) return <span className="text-muted-foreground">-</span>;
    if (score < 20) return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Low ({score})</span>;
    if (score < 60) return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-500 border-amber-500/20">Medium ({score})</span>;
    if (score < 90) return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-500/10 text-orange-500 border-orange-500/20">High ({score})</span>;
    return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-destructive/10 text-destructive border-destructive/20">Critical ({score})</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scan History</h2>
          <p className="text-muted-foreground">
            View past security assessments and their results.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadScans}
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            href="/dashboard/scans/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Scan
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm">
        <div className="p-4 border-b border-border/40 flex items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search targets..."
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
            />
          </div>
        </div>
        
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b [&_tr]:border-border/40">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Target</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Risk Score</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <span className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2 align-middle"></span>
                    Loading scans...
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Shield className="h-10 w-10 text-muted-foreground/50" />
                      <p>No scans found. Start your first security assessment.</p>
                      <Link
                        href="/dashboard/scans/new"
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        New Scan
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                scans.map((scan, index) => (
                  <tr key={scan.id} className="border-b border-border/40 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">#{scan.scan_number ?? (scans.length - index)}</td>
                    <td className="p-4 align-middle font-medium">{scan.target}</td>
                    <td className="p-4 align-middle text-muted-foreground capitalize">{scan.scan_type}</td>
                    <td className="p-4 align-middle">{getStatusBadge(scan.status)}</td>
                    <td className="p-4 align-middle">{getRiskBadge(scan.risk_score)}</td>
                    <td className="p-4 align-middle text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(scan.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Link 
                        href={`/dashboard/scans/${scan.id}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
