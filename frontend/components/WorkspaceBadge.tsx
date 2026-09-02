"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Key, Shield } from "lucide-react";
import { getUserId } from "@/lib/user";

export default function WorkspaceBadge() {
  const [userId, setUserIdState] = useState("");

  useEffect(() => {
    setUserIdState(getUserId());

    const handleUserChanged = () => {
      setUserIdState(getUserId());
    };

    window.addEventListener("netsentinel_user_changed", handleUserChanged);
    return () => {
      window.removeEventListener("netsentinel_user_changed", handleUserChanged);
    };
  }, []);

  if (!userId) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/40">
      <Link
        href="/dashboard/settings"
        className="flex items-center justify-between p-2 rounded-lg bg-accent/40 border border-border/50 hover:bg-accent/70 transition-all text-xs group"
        title="Your scans are private to this workspace key. Click to manage."
      >
        <div className="flex items-center space-x-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
              Private Workspace
            </span>
            <span className="font-mono text-[11px] text-foreground font-semibold truncate block group-hover:text-primary transition-colors">
              {userId}
            </span>
          </div>
        </div>
        <Key className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-1.5" />
      </Link>
    </div>
  );
}
