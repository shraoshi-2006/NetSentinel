"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Lock,
  Globe,
  Radio,
  Sliders,
  ArrowRight,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { fetchSecurityScore, SecurityScoreData } from "@/lib/api";

export default function SecurityScorePage() {
  const [data, setData] = useState<SecurityScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScoreData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchSecurityScore();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load security score:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load security score. Please ensure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScoreData();
  }, []);

  const getScoreColor = (score: number | null) => {
    if (score === null) return { stroke: "#64748b", text: "text-muted-foreground", bg: "bg-muted" };
    if (score >= 90) return { stroke: "#10b981", text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score >= 75) return { stroke: "#06b6d4", text: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" };
    if (score >= 60) return { stroke: "#f59e0b", text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    if (score >= 40) return { stroke: "#f97316", text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" };
    return { stroke: "#ef4444", text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" };
  };

  const getRatingBadge = (rating: string | null) => {
    if (!rating) return null;
    const r = rating.toLowerCase();
    if (r === "excellent") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> EXCELLENT
        </span>
      );
    }
    if (r === "good") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> GOOD
        </span>
      );
    }
    if (r === "moderate") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> MODERATE
        </span>
      );
    }
    if (r === "poor") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-500 border border-orange-500/30">
          <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> POOR
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-destructive/15 text-destructive border border-destructive/30 animate-pulse">
        <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> CRITICAL
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <Shield className="w-6 h-6 text-primary absolute inset-0 m-auto" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Calculating Security Posture...</p>
          <p className="text-sm text-muted-foreground">Analyzing vulnerabilities, ports, and configuration scores</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl glass-panel border-destructive/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Failed to Load Security Score</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <div className="pt-2">
          <button
            onClick={loadScoreData}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.has_data || data.overall_score === null) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-10 rounded-2xl glass-panel text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-inner">
          <Shield className="w-10 h-10" />
        </div>
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">No Security Score Available Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Run a security scan to analyze open ports, assess vulnerabilities, and generate your comprehensive security score.
          </p>
        </div>
        <div className="pt-2 relative z-10">
          <Link
            href="/dashboard/scans/new"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/25"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Launch First Scan
          </Link>
        </div>
      </div>
    );
  }

  const score = data.overall_score;
  const rating = data.rating;
  const colors = getScoreColor(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const categories = [
    { key: "network_security", label: "Network Security", score: data.categories.network_security, icon: Radio, desc: "Exposed network protocols and perimeter security" },
    { key: "port_security", label: "Port Security", score: data.categories.port_security, icon: Server, desc: "Port exposure hygiene and dangerous port minimization" },
    { key: "service_security", label: "Service Security", score: data.categories.service_security, icon: Activity, desc: "Active service banners, software identification, and daemon health" },
    { key: "vulnerability_security", label: "Vulnerability Security", score: data.categories.vulnerability_security, icon: Lock, desc: "Known CVE severity impact and exploit surface" },
    { key: "configuration_security", label: "Configuration Security", score: data.categories.configuration_security, icon: Sliders, desc: "Encryption enforcement and configuration hardening" },
    { key: "web_security", label: "Web Security", score: data.categories.web_security, icon: Globe, desc: "HTTP/HTTPS encryption, TLS parameters, and web headers" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Security Score</h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-primary/10 text-primary border border-primary/20">
              Live Posture
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            Dynamic security evaluation calculated from your latest network vulnerability assessment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadScoreData}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 bg-background/50 px-3 text-sm font-medium hover:bg-accent hover:text-foreground transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            href="/dashboard/scans/new"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-110 transition-all"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Assessment
          </Link>
        </div>
      </div>

      {/* Main Score & Last Scan Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Overall Security Score Radial Card */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Overall Security Score
          </span>

          <div className="relative flex items-center justify-center my-2">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/40"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={colors.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tight text-foreground">{score}</span>
              <span className="text-xs font-semibold text-muted-foreground mt-0.5">/ 100</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            {getRatingBadge(rating)}
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Based on deduction weighting from Critical (-15), High (-8), Medium (-4), and Low (-1) findings.
            </p>
          </div>
        </div>

        {/* Last Scan Information Banner */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/40">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Last Assessment Summary</h3>
                  <p className="text-xs text-muted-foreground">Most recent target evaluated by NetSentinel</p>
                </div>
              </div>
              {data.last_scan?.id && (
                <Link
                  href={`/dashboard/scans/${data.last_scan.id}`}
                  className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                >
                  View Full Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-background/40 border border-border/50">
                <span className="text-xs text-muted-foreground font-medium">Target</span>
                <p className="text-sm font-bold text-foreground truncate mt-1">
                  {data.last_scan?.target || "None"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background/40 border border-border/50">
                <span className="text-xs text-muted-foreground font-medium">Scan Type</span>
                <p className="text-sm font-bold text-foreground mt-1">
                  {data.last_scan?.scan_type || "Standard"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background/40 border border-border/50">
                <span className="text-xs text-muted-foreground font-medium">Status</span>
                <p className="text-sm font-bold text-emerald-500 capitalize mt-1 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                  {data.last_scan?.status || "Completed"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background/40 border border-border/50">
                <span className="text-xs text-muted-foreground font-medium">Vulnerabilities</span>
                <p className="text-sm font-bold text-destructive mt-1">
                  {data.last_scan?.vulnerabilities ?? 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background/40 border border-border/50">
                <span className="text-xs text-muted-foreground font-medium">Scan Date</span>
                <p className="text-xs font-semibold text-foreground mt-1.5 truncate">
                  {data.last_scan?.date ? new Date(data.last_scan.date).toLocaleString() : "Recently"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background/40 border border-border/50">
                <span className="text-xs text-muted-foreground font-medium">Scan Score</span>
                <p className={`text-sm font-bold mt-1 ${colors.text}`}>
                  {data.last_scan?.security_score ?? score} / 100
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>Score formula: Transparent 100-point severity baseline</span>
            <span className="font-mono text-[11px] bg-accent/50 px-2 py-0.5 rounded">v1.0 Engine</span>
          </div>
        </div>
      </div>

      {/* Risk Breakdown Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Risk Breakdown</h2>
          <p className="text-xs text-muted-foreground">Distribution of discovered vulnerabilities by severity level</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Critical */}
          <div className="p-5 rounded-2xl glass-panel border-destructive/20 hover:border-destructive/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-destructive">Critical</span>
              <span className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                <ShieldAlert className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-foreground">{data.risk_breakdown.critical}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                {data.risk_breakdown.percentages?.critical ?? 0}%
              </span>
            </div>
            <div className="w-full bg-muted/60 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-destructive h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, data.risk_breakdown.percentages?.critical ?? 0)}%` }}
              ></div>
            </div>
          </div>

          {/* High */}
          <div className="p-5 rounded-2xl glass-panel border-orange-500/20 hover:border-orange-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">High</span>
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-foreground">{data.risk_breakdown.high}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                {data.risk_breakdown.percentages?.high ?? 0}%
              </span>
            </div>
            <div className="w-full bg-muted/60 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, data.risk_breakdown.percentages?.high ?? 0)}%` }}
              ></div>
            </div>
          </div>

          {/* Medium */}
          <div className="p-5 rounded-2xl glass-panel border-amber-500/20 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Medium</span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Shield className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-foreground">{data.risk_breakdown.medium}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                {data.risk_breakdown.percentages?.medium ?? 0}%
              </span>
            </div>
            <div className="w-full bg-muted/60 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, data.risk_breakdown.percentages?.medium ?? 0)}%` }}
              ></div>
            </div>
          </div>

          {/* Low */}
          <div className="p-5 rounded-2xl glass-panel border-blue-500/20 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Low</span>
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-foreground">{data.risk_breakdown.low}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                {data.risk_breakdown.percentages?.low ?? 0}%
              </span>
            </div>
            <div className="w-full bg-muted/60 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, data.risk_breakdown.percentages?.low ?? 0)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Categories */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Security Categories</h2>
          <p className="text-xs text-muted-foreground">Detailed posture scores across individual security domains</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const hasData = cat.score !== null && cat.score !== undefined;
            const catColors = getScoreColor(cat.score);
            return (
              <div
                key={cat.key}
                className="p-5 rounded-2xl glass-panel hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <cat.icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{cat.label}</h3>
                    </div>
                    {hasData ? (
                      <span className={`text-sm font-black ${catColors.text}`}>
                        {cat.score} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground bg-muted/70 px-2 py-0.5 rounded">
                        No data available
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{cat.desc}</p>
                </div>

                <div className="mt-4">
                  {hasData ? (
                    <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(5, cat.score!)}%`,
                          backgroundColor: catColors.stroke,
                        }}
                      ></div>
                    </div>
                  ) : (
                    <div className="w-full bg-muted/30 h-2 rounded-full border border-dashed border-border/60"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Security Issues & Recommendations 2-column Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Security Issues */}
        <div className="rounded-2xl glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/40">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                <h3 className="text-lg font-bold text-foreground">Top Security Issues</h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {data.top_issues.length} detected
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1 hide-scrollbar">
              {data.top_issues.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-foreground">No severe issues detected</p>
                  <p className="text-xs text-muted-foreground mt-1">Your scanned services do not show major critical findings.</p>
                </div>
              ) : (
                data.top_issues.map((issue, idx) => {
                  const sev = issue.severity.toLowerCase();
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-background/40 border border-border/50 hover:border-border transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                sev === "critical"
                                  ? "bg-destructive/15 text-destructive border border-destructive/20"
                                  : sev === "high"
                                  ? "bg-orange-500/15 text-orange-500 border border-orange-500/20"
                                  : sev === "medium"
                                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/20"
                                  : "bg-blue-500/15 text-blue-500 border border-blue-500/20"
                              }`}
                            >
                              {issue.severity}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">{issue.category}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground mt-1.5">{issue.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{issue.description}</p>
                          {issue.remediation && (
                            <div className="mt-2.5 p-2 rounded-lg bg-accent/40 border border-border/40 text-xs">
                              <span className="font-bold text-primary mr-1">Recommended action:</span>
                              <span className="text-muted-foreground">{issue.remediation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="rounded-2xl glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/40">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Security Recommendations</h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Action Plan</span>
            </div>

            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1 hide-scrollbar">
              {data.recommendations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-foreground">All recommended controls in place</p>
                  <p className="text-xs text-muted-foreground mt-1">No pending remediation recommendations.</p>
                </div>
              ) : (
                data.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-background/40 border border-border/50 hover:bg-accent/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              rec.priority.toLowerCase() === "critical"
                                ? "bg-destructive/15 text-destructive"
                                : rec.priority.toLowerCase() === "high"
                                ? "bg-orange-500/15 text-orange-500"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {rec.priority} Priority
                          </span>
                          <span className="text-xs text-muted-foreground">{rec.category}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mt-1.5">{rec.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Score History Trend */}
      <div className="rounded-2xl glass-panel p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/40">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Security Score History
            </h2>
            <p className="text-xs text-muted-foreground">Track security posture changes and improvements across scans</p>
          </div>
          {data.history && data.history.length > 1 && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {data.history[data.history.length - 1].score >= data.history[0].score ? "Improving Trend" : "Needs Attention"}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6">
          {!data.history || data.history.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No historical scan data available yet.</p>
            </div>
          ) : data.history.length === 1 ? (
            <div className="p-6 rounded-xl bg-background/40 border border-border/40 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">Initial Assessment Recorded</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Scan #{data.history[0].scan_number || 1} ({data.history[0].target}) scored {data.history[0].score}/100.
                Run subsequent scans to generate longitudinal security score trends.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SVG Line Chart */}
              <div className="relative w-full h-48 sm:h-60 pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 25, 50, 75, 100].map((val) => {
                    const y = 160 - (val / 100) * 140;
                    return (
                      <g key={val}>
                        <line x1="0" y1={y} x2="600" y2={y} stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
                        <text x="5" y={y - 4} fill="currentColor" className="text-muted-foreground text-[9px]">
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill under curve */}
                  {(() => {
                    const points = data.history.map((item, idx) => {
                      const x = (idx / (data.history.length - 1)) * 560 + 20;
                      const y = 160 - (item.score / 100) * 140;
                      return `${x},${y}`;
                    });
                    const firstX = 20;
                    const lastX = 580;
                    const areaD = `M ${firstX},160 L ${points.join(" L ")} L ${lastX},160 Z`;
                    const lineD = `M ${points.join(" L ")}`;

                    return (
                      <>
                        <path d={areaD} fill="url(#scoreGradient)" />
                        <path d={lineD} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    );
                  })()}

                  {/* Data Points */}
                  {data.history.map((item, idx) => {
                    const x = (idx / (data.history.length - 1)) * 560 + 20;
                    const y = 160 - (item.score / 100) * 140;
                    return (
                      <g key={idx} className="group cursor-pointer">
                        <circle cx={x} cy={y} r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" className="transition-all group-hover:r-7" />
                        <text x={x} y={y - 10} textAnchor="middle" fill="currentColor" className="text-foreground text-[10px] font-bold">
                          {item.score}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* History timeline list */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {data.history.slice(-4).map((h, idx) => (
                  <div key={h.scan_id} className="p-3 rounded-xl bg-background/40 border border-border/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Scan #{h.scan_number || (data.history.length > 4 ? data.history.length - 4 + idx + 1 : idx + 1)}</span>
                      <span className="font-black text-cyan-500">{h.score}/100</span>
                    </div>
                    <p className="text-muted-foreground truncate mt-1">{h.target}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{h.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
