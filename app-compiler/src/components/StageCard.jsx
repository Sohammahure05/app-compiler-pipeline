import React, { useState } from "react";

const STATUS_CONFIG = {
  idle:     { color: "#444",   label: "",          bg: "transparent" },
  running:  { color: "#378ADD", label: "running",  bg: "#0a1628" },
  done:     { color: "#639922", label: "done",     bg: "#0d1a08" },
  repaired: { color: "#BA7517", label: "repaired", bg: "#1a1008" },
  error:    { color: "#E24B4A", label: "error",    bg: "#1a0808" },
};

export default function StageCard({ index, title, status, output, validation }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <div style={{
      border: `1px solid ${status === "idle" ? "#2a2a2a" : cfg.color}44`,
      borderRadius: 8,
      overflow: "hidden",
      background: "#141414",
      marginBottom: 8,
      transition: "border-color 0.3s",
    }}>
      {/* Header */}
      <div
        onClick={() => output && setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", cursor: output ? "pointer" : "default",
          background: open ? "#1a1a1a" : "transparent",
        }}
      >
        {/* Stage number circle */}
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600, flexShrink: 0,
          border: `1px solid ${cfg.color}`,
          color: cfg.color,
          background: cfg.bg,
        }}>
          {status === "running" ? <Spinner /> : index + 1}
        </div>

        <span style={{ fontSize: 13, color: "#ccc", flex: 1, fontFamily: "monospace" }}>
          {title}
        </span>

        {status !== "idle" && (
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 10,
            border: `1px solid ${cfg.color}44`,
            color: cfg.color, background: cfg.bg,
          }}>
            {cfg.label}
          </span>
        )}

        {output && (
          <span style={{ fontSize: 12, color: "#555" }}>{open ? "▲" : "▼"}</span>
        )}
      </div>

      {/* Body */}
      {open && output && (
        <div style={{ borderTop: "1px solid #222", padding: "12px 16px" }}>
          {/* Validation checks */}
          {validation && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {validation.checks.map((c, i) => (
                <span key={i} style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 10,
                  background: c.pass ? "#0d1a08" : "#1a0808",
                  color: c.pass ? "#639922" : "#E24B4A",
                  border: `1px solid ${c.pass ? "#63992244" : "#E24B4A44"}`,
                }}>
                  {c.pass ? "✓" : "✗"} {c.label}
                </span>
              ))}
            </div>
          )}
          <pre style={{
            fontSize: 11, lineHeight: 1.6, color: "#888",
            whiteSpace: "pre-wrap", wordBreak: "break-all",
            maxHeight: 240, overflowY: "auto", fontFamily: "monospace",
          }}>
            {typeof output === "string" ? output : JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 12, height: 12, border: "2px solid #333",
      borderTop: "2px solid #378ADD", borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}
