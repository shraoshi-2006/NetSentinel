import { Activity, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Welcome to NetSentinel. Here is a summary of your recent security assessments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl glass-panel text-card-foreground hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Scans</h3>
            <div className="p-2 bg-primary/10 rounded-md">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold tracking-tight">12</div>
            <p className="text-xs text-muted-foreground mt-1">+2 from last week</p>
          </div>
        </div>
        
        <div className="rounded-xl glass-panel text-card-foreground hover:-translate-y-1 hover:shadow-lg hover:shadow-destructive/5 transition-all duration-300">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Critical Findings</h3>
            <div className="p-2 bg-destructive/10 rounded-md">
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold tracking-tight text-destructive">3</div>
            <p className="text-xs text-muted-foreground mt-1">Across 2 targets</p>
          </div>
        </div>

        <div className="rounded-xl glass-panel text-card-foreground hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Safe Targets</h3>
            <div className="p-2 bg-emerald-500/10 rounded-md">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold tracking-tight">8</div>
            <p className="text-xs text-muted-foreground mt-1">Score &lt; 20</p>
          </div>
        </div>

        <div className="rounded-xl glass-panel text-card-foreground hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Avg. Scan Time</h3>
            <div className="p-2 bg-muted rounded-md">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold tracking-tight">1.2m</div>
            <p className="text-xs text-muted-foreground mt-1">-0.3m from last week</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl glass-panel text-card-foreground hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="p-6 flex flex-col space-y-1.5 relative z-10">
            <h3 className="font-semibold text-lg leading-none tracking-tight">Recent Scans</h3>
            <p className="text-sm text-muted-foreground">
              Your most recent assessment results.
            </p>
          </div>
          <div className="p-6 pt-0 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center group p-3 -mx-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">scanme.nmap.org</p>
                  <p className="text-xs text-muted-foreground">Completed 2 hours ago</p>
                </div>
                <div className="ml-auto font-medium">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Low Risk (12)
                  </span>
                </div>
              </div>
              <div className="flex items-center group p-3 -mx-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">testphp.vulnweb.com</p>
                  <p className="text-xs text-muted-foreground">Completed yesterday</p>
                </div>
                <div className="ml-auto font-medium">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-destructive/10 text-destructive border-destructive/20">
                    High Risk (85)
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border/40 text-center">
              <Link href="/dashboard/scans" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                View all scans &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="col-span-3 rounded-xl glass-panel text-card-foreground hover:shadow-lg transition-all duration-300">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold text-lg leading-none tracking-tight">Quick Actions</h3>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <Link href="/dashboard/scans/new" className="block w-full p-4 rounded-lg bg-accent/30 border border-border/40 hover:bg-primary/10 hover:border-primary/30 hover:shadow-sm transition-all group">
              <div className="font-medium group-hover:text-primary transition-colors">Run New Scan</div>
              <div className="text-sm text-muted-foreground mt-1">Start a security assessment on a new target.</div>
            </Link>
            <Link href="/dashboard/settings" className="block w-full p-4 rounded-lg bg-accent/30 border border-border/40 hover:bg-primary/10 hover:border-primary/30 hover:shadow-sm transition-all group">
              <div className="font-medium group-hover:text-primary transition-colors">Configure Enrichment</div>
              <div className="text-sm text-muted-foreground mt-1">Add API keys for NVD, Shodan, etc.</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
