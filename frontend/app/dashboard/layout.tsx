import Link from "next/link";
import { Shield, ShieldCheck, LayoutDashboard, PlusCircle, History, Settings, Bell } from "lucide-react";
import WorkspaceBadge from "@/components/WorkspaceBadge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-card/50 hidden md:flex flex-col backdrop-blur-sm">
        <div className="flex h-16 items-center px-6 border-b border-border/40 bg-card/50">
          <Link className="flex items-center group" href="/">
            <div className="flex items-center justify-center p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <Shield className="h-5 w-5" />
            </div>
            <span className="ml-3 font-bold tracking-tight text-foreground">NetSentinel</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1.5 flex-1 flex flex-col">
          <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:translate-x-1 transition-all duration-200">
            <LayoutDashboard className="h-5 w-5 mr-3 text-primary/70" />
            Overview
          </Link>
          <Link href="/dashboard/security-score" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:translate-x-1 transition-all duration-200">
            <ShieldCheck className="h-5 w-5 mr-3 text-emerald-500" />
            Security Score
          </Link>
          <Link href="/dashboard/scans/new" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:translate-x-1 transition-all duration-200">
            <PlusCircle className="h-5 w-5 mr-3" />
            New Scan
          </Link>
          <Link href="/dashboard/scans" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:translate-x-1 transition-all duration-200">
            <History className="h-5 w-5 mr-3" />
            Scan History
          </Link>
          <Link href="/dashboard/notifications" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:translate-x-1 transition-all duration-200">
            <Bell className="h-5 w-5 mr-3 text-amber-500/80" />
            Notifications
          </Link>
          <div className="pt-4 mt-auto border-t border-border/40">
            <Link href="/dashboard/settings" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:translate-x-1 transition-all duration-200">
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </Link>
            <WorkspaceBadge />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-6 border-b border-border/40 md:hidden">
          <Link className="flex items-center" href="/">
            <Shield className="h-6 w-6 text-primary" />
            <span className="ml-2 font-bold">NetSentinel</span>
          </Link>
        </header>
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
