"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Shield,
  Key,
  User,
  Database,
  Globe,
  MonitorSmartphone,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { getUserId, setUserId, resetUserKey } from "@/lib/user";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentKey, setCurrentKey] = useState("");
  const [customKeyInput, setCustomKeyInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState("");

  useEffect(() => {
    setCurrentKey(getUserId());
  }, []);

  const handleCopyKey = () => {
    if (!currentKey) return;
    navigator.clipboard.writeText(currentKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCustomKey = () => {
    const cleaned = customKeyInput.trim();
    if (!cleaned) return;
    setUserId(cleaned);
    setCurrentKey(cleaned);
    setCustomKeyInput("");
    setKeyFeedback("Workspace key updated! Your scans and security score will now sync to this key.");
    setTimeout(() => setKeyFeedback(""), 4000);
  };

  const handleGenerateNewKey = () => {
    if (confirm("Are you sure you want to generate a new private workspace key? Your current scan history will remain safe under the old key, but this browser will switch to a fresh private session.")) {
      const newKey = resetUserKey();
      setCurrentKey(newKey);
      setKeyFeedback("New private workspace key generated successfully!");
      setTimeout(() => setKeyFeedback(""), 4000);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground tracking-tight">Full Name</label>
                <input
                  type="text"
                  defaultValue="Security Admin"
                  className="w-full bg-background/50 border border-input/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground tracking-tight">Email Address</label>
                <input
                  type="email"
                  defaultValue="admin@netsentinel.io"
                  className="w-full bg-background/50 border border-input/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground tracking-tight">Role</label>
                <input
                  type="text"
                  disabled
                  defaultValue="Super Administrator"
                  className="w-full bg-muted/50 border border-input/40 rounded-lg px-4 py-2 text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground tracking-tight">Timezone</label>
                <select className="w-full bg-background/50 border border-input/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                  <option>GMT (Greenwich Mean Time)</option>
                </select>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border/40">
              <h3 className="text-lg font-semibold text-foreground mb-4 tracking-tight">Security Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-6 bg-primary rounded-full shadow-inner transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-primary-foreground rounded-full transition-transform translate-x-4"></div>
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Enable Two-Factor Authentication (2FA)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-6 bg-primary rounded-full shadow-inner transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-primary-foreground rounded-full transition-transform translate-x-4"></div>
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Require SSO for login</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-border/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground tracking-tight flex items-center">
                    <Key className="w-5 h-5 mr-2 text-primary" />
                    Private Workspace & User Key
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your scans and security posture are strictly isolated to your private key. Outsiders cannot view your assessments.
                  </p>
                </div>
              </div>

              {keyFeedback && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                  {keyFeedback}
                </div>
              )}

              <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Active User Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentKey}
                    className="flex-1 font-mono text-sm bg-muted/40 border border-input/60 rounded-lg px-3.5 py-2 text-foreground select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-primary/15 text-primary border border-primary/25 hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy Key
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateNewKey}
                    title="Generate a fresh private workspace key"
                    className="inline-flex items-center px-3 py-2 rounded-lg border border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs font-semibold text-muted-foreground transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Reset Key
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Keep this key safe. You can paste it into another browser or device below to sync your scan history.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background/30 border border-border/40 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Restore / Sync Key from Another Device</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Paste another usr_... key here"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    className="flex-1 font-mono text-sm bg-background/50 border border-input/60 rounded-lg px-3.5 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomKey}
                    disabled={!customKeyInput.trim()}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all shadow-sm"
                  >
                    Sync Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "scanner":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Default Scan Configuration</h3>
              <p className="text-sm text-muted-foreground">Configure global defaults for all automated and manual scans.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground tracking-tight">Concurrent Scans Limit</label>
                  <input
                    type="number"
                    defaultValue={5}
                    min={1}
                    max={20}
                    className="w-full bg-background/50 border border-input/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground tracking-tight">Timeout per Target (seconds)</label>
                  <input
                    type="number"
                    defaultValue={3600}
                    className="w-full bg-background/50 border border-input/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/40">
              <h3 className="text-lg font-semibold text-foreground mb-4 tracking-tight">Advanced Analysis</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-6 bg-primary rounded-full shadow-inner transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-primary-foreground rounded-full transition-transform translate-x-4"></div>
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Heuristic Threat Detection</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-6 bg-primary rounded-full shadow-inner transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-primary-foreground rounded-full transition-transform translate-x-4"></div>
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">OSINT Data Correlation</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-10 h-6 bg-muted rounded-full shadow-inner transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-muted-foreground/30 rounded-full transition-transform"></div>
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Aggressive Subdomain Bruteforcing</span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and platform preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar">
            {[
              { id: "profile", label: "Profile & Security", icon: User },
              { id: "scanner", label: "Scanner Config", icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.03)]"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-panel rounded-2xl p-6 lg:p-8 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10">
            {renderContent()}

            <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-6 py-2.5 bg-primary hover:brightness-110 text-primary-foreground rounded-lg transition-all shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
