"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Save,
  ShieldAlert,
  Mail,
  MessageSquare,
  Radio,
  Sliders,
  AlertCircle,
  Activity,
} from "lucide-react";

export default function NotificationsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Notification toggles state
  const [channels, setChannels] = useState<{ [key: string]: { email: boolean; slack: boolean } }>({
    critical: { email: true, slack: true },
    scan_complete: { email: true, slack: false },
    asset_discovery: { email: false, slack: true },
    system_updates: { email: true, slack: false },
  });

  const toggleChannel = (type: string, channel: "email" | "slack") => {
    setChannels((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type][channel],
      },
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  const alertItems = [
    {
      id: "critical",
      title: "Critical Vulnerabilities",
      desc: "Notify immediately when a high or critical risk exposure is detected during assessment.",
      icon: ShieldAlert,
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
    },
    {
      id: "scan_complete",
      title: "Scan Completions",
      desc: "Receive a comprehensive summary report whenever an automated or manual scan finishes.",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
    },
    {
      id: "asset_discovery",
      title: "New Asset & Port Discovery",
      desc: "Alert when a new open port, service banner change, or host is discovered in your scope.",
      icon: Radio,
      iconColor: "text-cyan-500",
      iconBg: "bg-cyan-500/10",
    },
    {
      id: "system_updates",
      title: "System & CVE Feed Updates",
      desc: "Get notified of platform maintenance, scanner engine enhancements, and CVE database synchronization.",
      icon: Activity,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
    },
  ];

  const recentAlerts = [
    {
      id: 1,
      title: "Assessment Completed",
      time: "2 hours ago",
      desc: "Scan for scanme.nmap.org finished with 0 Critical findings and 1 Low risk port.",
      type: "info",
    },
    {
      id: 2,
      title: "CVE Database Synchronized",
      time: "Yesterday",
      desc: "National Vulnerability Database (NVD) definitions updated successfully.",
      type: "success",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications & Alerts</h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
            Realtime
          </span>
        </div>
        <p className="text-muted-foreground mt-1">
          Configure notification channels and view your recent security alerts.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Alert Preferences Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="space-y-2 pb-6 border-b border-border/40">
              <h2 className="text-lg font-bold text-foreground">Notification Preferences</h2>
              <p className="text-xs text-muted-foreground">
                Select which communication channels should receive alerts for each event type.
              </p>
            </div>

            <div className="space-y-4 mt-6">
              {alertItems.map((item) => {
                const config = channels[item.id] || { email: false, slack: false };
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-background/40 border border-border/50 hover:bg-accent/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2.5 rounded-xl ${item.iconBg} ${item.iconColor} shrink-0 mt-0.5 sm:mt-0`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-md">{item.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleChannel(item.id, "email")}
                        className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          config.email
                            ? "bg-primary/15 text-primary border-primary/30 shadow-sm"
                            : "bg-muted/40 text-muted-foreground border-border/50 hover:text-foreground"
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5 mr-1.5" />
                        Email
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleChannel(item.id, "slack")}
                        className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          config.slack
                            ? "bg-primary/15 text-primary border-primary/30 shadow-sm"
                            : "bg-muted/40 text-muted-foreground border-border/50 hover:text-foreground"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        Slack
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Changes apply immediately to your active scanner profile</span>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-6 py-2.5 bg-primary hover:brightness-110 text-primary-foreground rounded-lg transition-all font-semibold disabled:opacity-70 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <h3 className="font-bold text-sm text-foreground flex items-center">
                <Bell className="w-4 h-4 mr-2 text-primary" />
                Recent Alerts
              </h3>
              <span className="text-[11px] text-muted-foreground font-mono">Live log</span>
            </div>

            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3.5 rounded-xl bg-background/40 border border-border/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">{alert.title}</h4>
                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-muted-foreground">Alert history is retained for 30 days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
