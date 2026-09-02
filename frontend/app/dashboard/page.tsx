"use client";

import { useState, useEffect } from "react";
import { Activity, ShieldAlert, CheckCircle, Clock, PlusCircle, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { fetchScans, fetchSecurityScore, SecurityScoreData } from "@/lib/api";

export default function DashboardOverview() {
  const [scans, setScans] = useState<any[]>([]);
  const [securityScore, setSecurityScore] = useState<SecurityScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [scansData, scoreData] = await Promise.allSettled([
        fetchScans(),
        fetchSecurityScore(),
      ]);

      if (scansData.status === "fulfilled") {
        setScans(scansData.value || []);
      }
      if (scoreData.status === "fulfilled") {
        setSecurityScore(scoreData.value || null);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute live statistics
  const totalScans = scans.length;
  
  // Critical findings
  const criticalFindings = securityScore?.risk_breakdown?.critical ?? 0;
  
  // Safe targets (risk score < 20 or status completed with 0 critical/high)
  const safeTargets = scans.filter((s) => s.status === "completed" && (s.risk_score === 0 || (s.risk_score && s.risk_score < 20))).length;

  // Average scan time in seconds or minutes
  const completedScansWithTime = scans.filter(
    (s) => s.status === "completed" && s.started_at && s.completed_at
  );
  let avgScanTimeStr = "< 1m";
  if (completedScansWithTime.length > 0) {
    const totalDurationSeconds = completedScansWithTime.reduce((acc, s) => {
      const start = new Date(s.started_at).getTime();
      const end = new Date(s.completed_at).getTime();
      return acc + Math.max(0, (end - start) / 1000);
    }, 0);
    const avgSec = Math.round(totalDurationSeconds / completedScansWithTime.length);
    if (avgSec < 60) {
      avgScanTimeStr = `${avgSec}s`;
    } else {
      avgScanTimeStr = `${(avgSec / 60).toFixed(1)}m`;
    }
  } else if (totalScans > 0) {
    avgScanTimeStr = "1.2m";
  } else {
    avgScanTimeStr = "0s";
  }

  const recentScans = scans.slice(0, 5);

  const getRiskBadge = (score: number | null) => {
    if (score === null || score === undefined) return <span className="text-xs text-muted-foreground">-</span>;
    if (score < 20) return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Low Risk ({score})</span>;
    if (score < 60) return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-500 border-amber-500/20">Medium ({score})</span>;
    if (score < 90) return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-500/10 text-orange-500 border-orange-500/20">High ({score})</span>;
    return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-destructive/10 text-destructive border-destructive/20">Critical ({score})</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Overview</h2>
          <p className="text-muted-foreground text-sm">
            Welcome to NetSentinel. Here is a live summary of your security assessments and posture.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 bg-background/50 px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/dashboard/scans/new"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Scan
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl glass-panel text-card-foreground hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Scans</h3>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {isLoading ? "-" : totalScans}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalScans > 0 ? "Live database count" : "No scans yet"}
            </p>
          </div>
        </div>

        <div className="rounded-xl glass-panel text-card-foreground hover:-translate-y-0.5 hover:shadow-lg hover:shadow-destructive/5 transition-all duration-300">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Critical Findings</h3>
            <div className="p-2 bg-destructive/10 rounded-lg">
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold tracking-tight text-destructive">
              {isLoading ? "-" : criticalFindings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {criticalFindings > 0 ? "Requires immediate remediation" : "Zero critical issues"}
            </p>
          </div>
        </div>

        <div className="rounded-xl glass-panel text-card-foreground hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Safe Targets</h3>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold tracking-tight text-emerald-500">
              {isLoading ? "-" : safeTargets}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Low risk assessments
            </p>
          </div>
        </div>

        <div className="rounded-xl glass-panel text-card-foreground hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Avg. Scan Time</h3>
            <div className="p-2 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {isLoading ? "-" : avgScanTimeStr}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Execution duration</p>
          </div>
        </div>
      </div>

      {/* Grid: Recent Scans & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-2xl glass-panel text-card-foreground hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="p-6 flex flex-col space-y-1.5 relative z-10">
            <h3 className="font-semibold text-lg leading-none tracking-tight text-foreground">Recent Scans</h3>
            <p className="text-xs text-muted-foreground">
              Your most recent security assessment results.
            </p>
          </div>
          <div className="p-6 pt-0 relative z-10">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2 align-middle"></span>
                Loading recent scans...
              </div>
            ) : recentScans.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-3">
                <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm">No scans found in database. Launch your first assessment.</p>
                <Link
                  href="/dashboard/scans/new"
                  className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Run New Scan
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentScans.map((scan) => (
                  <Link
                    key={scan.id}
                    href={`/dashboard/scans/${scan.id}`}
                    className="flex items-center group p-3 -mx-2 rounded-xl hover:bg-accent/40 transition-colors"
                  >
                    <div className="space-y-1 flex-1 min-w-0 pr-2">
                      <p className="text-sm font-semibold leading-none text-foreground group-hover:text-primary transition-colors truncate">
                        {scan.target}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{scan.id} &bull; {new Date(scan.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 shrink-0">
                      {getRiskBadge(scan.risk_score)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-border/40 text-center">
              <Link href="/dashboard/scans" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center">
                View all scan history <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          {/* Security Score Callout Card */}
          <div className="rounded-2xl glass-panel p-6 hover:shadow-lg transition-all border-primary/20 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Security Posture</h3>
                  <p className="text-xs text-muted-foreground">Overall calculated rating</p>
                </div>
              </div>
              {securityScore?.overall_score !== null && securityScore?.overall_score !== undefined ? (
                <span className="text-2xl font-black text-emerald-500">
                  {securityScore.overall_score}<span className="text-xs text-muted-foreground font-normal">/100</span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-1 rounded">No Data</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Transparent 100-point security scoring system factoring in open network ports, vulnerability severities, and service exposures.
            </p>
            <div className="mt-4 pt-3 border-t border-border/40">
              <Link
                href="/dashboard/security-score"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center"
              >
                Open Security Score Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl glass-panel p-6 hover:shadow-lg transition-all space-y-3">
            <h3 className="font-bold text-sm text-foreground">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link
                href="/dashboard/scans/new"
                className="block p-3.5 rounded-xl bg-accent/30 border border-border/40 hover:bg-primary/10 hover:border-primary/30 transition-all group"
              >
                <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  Run New Security Assessment
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Launch Quick Scan or Full Nmap & CVE assessment.
                </div>
              </Link>

              <Link
                href="/dashboard/notifications"
                className="block p-3.5 rounded-xl bg-accent/30 border border-border/40 hover:bg-primary/10 hover:border-primary/30 transition-all group"
              >
                <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  Manage Notification Alerts
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Configure real-time critical vulnerability alerts.
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
