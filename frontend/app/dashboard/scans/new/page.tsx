"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Play } from "lucide-react";
import { createScan } from "@/lib/api";

export default function NewScanPage() {
  const router = useRouter();
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState("full");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [speed, setSpeed] = useState("normal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const cleaned = target.trim();
    if (!cleaned) {
      setError("Please enter a target IP address or domain name.");
      setIsLoading(false);
      return;
    }

    try {
      const scan = await createScan(cleaned, scanType);
      router.push(`/dashboard/scans/${scan.id}`);
    } catch (err: any) {
      console.error("Scan launch error:", err);
      const msg = err.response?.data?.detail || err.message || "Failed to start scan. Please ensure the backend server is running.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Security Assessment</h2>
        <p className="text-muted-foreground">
          Configure and launch a new vulnerability scan.
        </p>
      </div>

      <div className="rounded-xl glass-panel text-card-foreground shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 relative z-10">
          {error && (
            <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label htmlFor="target" className="text-sm font-semibold tracking-tight text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Target (Domain or IP Address)
            </label>
            <input
              id="target"
              type="text"
              className="flex h-11 w-full rounded-lg border border-input/60 bg-background/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              placeholder="e.g., example.com or 192.168.1.1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold tracking-tight text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Scan Type
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 p-5 transition-all duration-200 ${scanType === 'full' ? 'border-primary bg-primary/5 text-primary shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'border-border/50 bg-background/40 hover:border-primary/50 hover:bg-accent/30 text-muted-foreground hover:text-foreground'}`}>
                <input
                  type="radio"
                  name="scanType"
                  value="full"
                  className="sr-only"
                  checked={scanType === 'full'}
                  onChange={(e) => setScanType(e.target.value)}
                />
                <Shield className="mb-4 h-8 w-8" />
                <div className="space-y-1.5 text-center">
                  <div className="font-semibold text-foreground">Full Assessment</div>
                  <div className="text-xs text-muted-foreground/80 leading-relaxed">
                    Comprehensive port scan, DNS, HTTP analysis, and CVE enrichment.
                  </div>
                </div>
              </label>
              
              <label className={`flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 p-5 transition-all duration-200 ${scanType === 'quick' ? 'border-primary bg-primary/5 text-primary shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'border-border/50 bg-background/40 hover:border-primary/50 hover:bg-accent/30 text-muted-foreground hover:text-foreground'}`}>
                <input
                  type="radio"
                  name="scanType"
                  value="quick"
                  className="sr-only"
                  checked={scanType === 'quick'}
                  onChange={(e) => setScanType(e.target.value)}
                />
                <Play className="mb-4 h-8 w-8" />
                <div className="space-y-1.5 text-center">
                  <div className="font-semibold text-foreground">Quick Scan</div>
                  <div className="text-xs text-muted-foreground/80 leading-relaxed">
                    Top 100 ports only. Fast, but may miss obscure services.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <button
              type="button"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`mr-2 transition-transform duration-200 group-hover:text-primary ${showAdvanced ? 'rotate-90' : ''}`}
              >
                <path d="m9 18 6-6-6-6"/>
              </svg>
              Advanced Settings
            </button>
            
            {showAdvanced && (
              <div className="p-5 rounded-xl border border-border/40 bg-background/30 backdrop-blur-sm space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Scan Speed / Aggressiveness
                  </label>
                  <select 
                    className="flex h-11 w-full items-center justify-between rounded-lg border border-input/60 bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                  >
                    <option value="sneaky">Sneaky (T1) - Very Slow, avoids IDS</option>
                    <option value="polite">Polite (T2) - Slow, less bandwidth</option>
                    <option value="normal">Normal (T3) - Default speed</option>
                    <option value="aggressive">Aggressive (T4) - Fast, may be detected</option>
                    <option value="insane">Insane (T5) - Extremely fast, requires good connection</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-sm text-muted-foreground/90">
            <span className="font-semibold text-foreground">Authorization Agreement:</span> By clicking "Launch Scan", you confirm that you have explicit authorization to perform security testing against the specified target. NetSentinel is for defensive purposes only.
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-border/40">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background/50 px-6 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !target}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {isLoading ? (
                <>
                  <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
                  Initializing...
                </>
              ) : (
                "Launch Scan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
