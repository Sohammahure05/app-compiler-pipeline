import React from "react";

export default function MetricsBar({ metrics }) {
  const { runs, successes, repairs, latencies } = metrics;
  const successRate = runs > 0 ? Math.round((successes / runs) * 100) + "%" : "—";
  const avgLatency  = latencies.length > 0
    ? (latencies.reduce((a, b) => a + b, 0) / latencies.length / 1000).toFixed(1) + "s"
    : "—";

  const items = [
    { label: "RUNS",         value: runs },
    { label: "SUCCESS RATE", value: successRate },
    { label: "REPAIRS",      value: repairs },
    { label: "AVG LATENCY",  value: avgLatency },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
      {items.map((item) => (
        <div key={item.label} style={{
          background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: 8, padding: "10px 14px",
        }}>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 4 }}>
            {item.label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#e0e0e0", fontFamily: "monospace" }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
