import React, { useState } from "react";

const TABS = ["ui_schema", "api_schema", "db_schema", "auth_schema", "full config"];

export default function FinalOutput({ config }) {
  const [activeTab, setActiveTab] = useState("ui_schema");
  if (!config) return null;

  const cfg = config.app_config || config;

  const getTabContent = () => {
    if (activeTab === "full config") return config;
    return cfg[activeTab] || {};
  };

  const report = cfg.consistency_report;

  return (
    <div style={{
      border: "1px solid #2a2a2a", borderRadius: 8,
      overflow: "hidden", background: "#141414", marginTop: 16,
    }}>
      {/* Consistency report banner */}
      {report && (
        <div style={{
          padding: "8px 16px", background: "#0d1a08",
          borderBottom: "1px solid #2a2a2a", fontSize: 12,
          color: "#639922", display: "flex", gap: 16,
        }}>
          <span>✓ Consistency check complete</span>
          <span>Issues found: {report.issues_found}</span>
          <span>Issues fixed: {report.issues_fixed}</span>
          {report.warnings?.length > 0 && (
            <span style={{ color: "#BA7517" }}>⚠ {report.warnings.length} warnings</span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #2a2a2a" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 14px", fontSize: 12, cursor: "pointer",
              background: "transparent", border: "none",
              borderBottom: activeTab === tab ? "2px solid #378ADD" : "2px solid transparent",
              color: activeTab === tab ? "#e0e0e0" : "#555",
              fontFamily: "monospace", transition: "color 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "12px 16px" }}>
        <pre style={{
          fontSize: 11, lineHeight: 1.7, color: "#888",
          whiteSpace: "pre-wrap", wordBreak: "break-all",
          maxHeight: 400, overflowY: "auto", fontFamily: "monospace",
        }}>
          {JSON.stringify(getTabContent(), null, 2)}
        </pre>
      </div>
    </div>
  );
}
