"use client";

import { Bell, Search, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getInitials } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      style={{
        height: "var(--header-height)",
        background: "var(--background-secondary)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 30,
        gap: 16,
      }}
    >
      {/* Title / Breadcrumb */}
      <div style={{ fontWeight: 600, fontSize: 15, color: "var(--foreground)" }}>
        {title}
      </div>

      {/* Right Side */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Search hint */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 7,
            color: "var(--foreground-muted)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          <Search size={14} />
          <span>Search...</span>
          <kbd
            style={{
              background: "var(--border)",
              borderRadius: 4,
              padding: "1px 5px",
              fontSize: 10,
              color: "var(--foreground-muted)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          style={{
            position: "relative",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--foreground-muted)",
            cursor: "pointer",
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              width: 6,
              height: 6,
              background: "var(--primary)",
              borderRadius: "50%",
              border: "1px solid var(--background-secondary)",
            }}
          />
        </button>

        {/* User Avatar */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px 4px 4px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              cursor: "pointer",
              color: "var(--foreground)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              {user ? getInitials(`${user.firstName} ${user.lastName}`) : "A"}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>
                {user ? `${user.firstName} ${user.lastName}` : "Admin"}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--foreground-muted)", textTransform: "capitalize" }}>
                {user?.role?.slug || "admin"}
              </div>
            </div>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                width: 180,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                overflow: "hidden",
                zIndex: 50,
              }}
            >
              <Link
                href="/settings"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  color: "var(--foreground-muted)",
                  textDecoration: "none",
                  fontSize: 13,
                }}
              >
                <Settings size={14} /> Settings
              </Link>
              <div style={{ height: 1, background: "var(--border)" }} />
              <button
                onClick={logout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  color: "var(--danger)",
                  background: "transparent",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
