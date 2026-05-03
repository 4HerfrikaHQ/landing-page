"use client";

import { useState, useEffect } from "react";

const COOKIE_NAME = "4herfrika_staff";

function readCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim() === `${COOKIE_NAME}=true`);
}

export default function StaffPage() {
  const [isStaff, setIsStaff] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [justChanged, setJustChanged] = useState(false);

  useEffect(() => {
    setIsStaff(readCookie());
    setMounted(true);
  }, []);

  function enable() {
    document.cookie = `${COOKIE_NAME}=true; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
    setIsStaff(true);
    flash();
  }

  function disable() {
    document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
    setIsStaff(false);
    flash();
  }

  function flash() {
    setJustChanged(true);
    setTimeout(() => setJustChanged(false), 1800);
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FFF4FC 0%, #EDEEFF 100%)",
        padding: "24px",
        fontFamily: "inherit",
      }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-120px",
          right: "-120px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,0,140,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: "-80px",
          left: "-80px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(3,6,92,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #f0e6f6",
          boxShadow: "0 8px 40px rgba(236,0,140,0.08), 0 2px 8px rgba(3,6,92,0.06)",
          padding: "40px 36px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #ec008c, #03065c)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #ec008c, #c4006e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
              letterSpacing: "-0.5px",
              flexShrink: 0,
            }}
          >
            4H
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#03065c",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Staff Portal
          </span>
        </div>

        <h1
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#171717",
            marginBottom: "8px",
            lineHeight: "1.2",
          }}
        >
          Analytics Opt-Out
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#555555",
            lineHeight: "1.6",
            marginBottom: "32px",
          }}
        >
          Mark this browser as a staff device so your visits are excluded from our analytics reports.
        </p>

        {/* Status indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 16px",
            borderRadius: "12px",
            background: mounted && isStaff ? "rgba(236,0,140,0.06)" : "#f8f8f8",
            border: `1px solid ${mounted && isStaff ? "rgba(236,0,140,0.15)" : "#e5e5e5"}`,
            marginBottom: "24px",
            transition: "all 0.3s ease",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: mounted && isStaff ? "#ec008c" : "#ccc",
              flexShrink: 0,
              boxShadow: mounted && isStaff ? "0 0 0 3px rgba(236,0,140,0.2)" : "none",
              transition: "all 0.3s ease",
              animation: mounted && isStaff ? "pulse 2s infinite" : "none",
            }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: "500",
              color: mounted && isStaff ? "#ec008c" : "#999",
            }}
          >
            {!mounted
              ? "Checking status…"
              : isStaff
              ? "Staff cookie is active — you're excluded from analytics"
              : "No staff cookie — your visits are being tracked"}
          </span>
        </div>

        {/* Confirmation flash */}
        {justChanged && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#15803d",
              fontSize: "13px",
              fontWeight: "500",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {isStaff
              ? "Done! Cookie saved. You're now invisible to analytics."
              : "Cookie removed. Analytics tracking resumed."}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={enable}
            disabled={!mounted || isStaff}
            style={{
              padding: "13px 20px",
              borderRadius: "10px",
              border: "none",
              background:
                mounted && !isStaff
                  ? "linear-gradient(135deg, #ec008c, #c4006e)"
                  : "#f2f2f2",
              color: mounted && !isStaff ? "#ffffff" : "#aaa",
              fontSize: "14px",
              fontWeight: "600",
              cursor: mounted && !isStaff ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              letterSpacing: "0.01em",
            }}
          >
            Mark as Staff
          </button>
          <button
            onClick={disable}
            disabled={!mounted || !isStaff}
            style={{
              padding: "13px 20px",
              borderRadius: "10px",
              border: `1px solid ${mounted && isStaff ? "#e5e5e5" : "#f2f2f2"}`,
              background: "transparent",
              color: mounted && isStaff ? "#555555" : "#ccc",
              fontSize: "14px",
              fontWeight: "500",
              cursor: mounted && isStaff ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
            }}
          >
            Remove Staff Status
          </button>
        </div>

        <p
          style={{
            fontSize: "12px",
            color: "#aaa",
            marginTop: "24px",
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          Cookie expires in 1 year. Repeat on each browser or device you use.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(236,0,140,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(236,0,140,0.05); }
        }
      `}</style>
    </div>
  );
}
