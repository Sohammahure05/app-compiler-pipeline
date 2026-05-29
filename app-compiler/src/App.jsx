import React, { useState, useRef } from "react";
import StageCard from "./components/StageCard";
import MetricsBar from "./components/MetricsBar";
import FinalOutput from "./components/FinalOutput";
import { runFullPipeline } from "./stages/pipeline";

const STAGE_TITLES = [
  "intent extraction",
  "system design layer",
  "schema generation",
  "refinement + consistency",
];

const EXAMPLE_PROMPTS = [
  "CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins see analytics.",
  "Task management app with teams, projects, due dates, file attachments, and email notifications.",
  "E-commerce store with product catalog, cart, checkout, order tracking, and seller dashboard.",
  "Blog platform with rich text editor, categories, comments, SEO settings, and author profiles.",
];

const initialStages = () =>
  STAGE_TITLES.map((title) => ({ title, status: "idle", output: null, validation: null }));

export default function App() {
  const [apiKey, setApiKey]   = useState(localStorage.getItem("anthropic_key") || "");
  const [prompt, setPrompt]   = useState("");
  const [stages, setStages]   = useState(initialStages());
  const [running, setRunning] = useState(false);
  const [finalConfig, setFinalConfig] = useState(null);
  const [metrics, setMetrics] = useState({ runs: 0, successes: 0, repairs: 0, latencies: [] });
  const t0Ref = useRef(null);

  const saveKey = (k) => { setApiKey(k); localStorage.setItem("anthropic_key", k); };

  const updateStage = (i, patch) =>
    setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const handleRun = async () => {
    if (!apiKey.trim()) { alert("Please enter your Anthropic API key first."); return; }
    if (!prompt.trim())  { alert("Please enter a prompt."); return; }

    setRunning(true);
    setFinalConfig(null);
    setStages(initialStages());
    t0Ref.current = Date.now();
    setMetrics((m) => ({ ...m, runs: m.runs + 1 }));

    try {
      const result = await runFullPipeline(prompt, apiKey, {
        onStageStart: (i) => updateStage(i, { status: "running" }),
        onStageDone: (i, { parsed, validation, repaired }) =>
          updateStage(i, { status: repaired ? "repaired" : "done", output: parsed, validation }),
        onStageError: (i, err) =>
          updateStage(i, { status: "error", output: err.message }),
        onRepair: (_i) =>
          setMetrics((m) => ({ ...m, repairs: m.repairs + 1 })),
      });

      setFinalConfig(result);
      const elapsed = Date.now() - t0Ref.current;
      setMetrics((m) => ({
        ...m,
        successes: m.successes + 1,
        latencies: [...m.latencies, elapsed],
      }));
    } catch (_err) {
      // error already set in onStageError
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", padding: "32px 20px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus, input:focus { outline: 1px solid #378ADD; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e0e0e0", fontFamily: "monospace", letterSpacing: -0.5 }}>
            ⚙ app compiler pipeline
          </h1>
          <p style={{ fontSize: 13, color: "#555", marginTop: 4, fontFamily: "monospace" }}>
            natural language → validated JSON app config · 4-stage pipeline
          </p>
        </div>

        {/* Metrics */}
        <MetricsBar metrics={metrics} />

        {/* API Key */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#555", letterSpacing: 1, display: "block", marginBottom: 6 }}>
            ANTHROPIC API KEY
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => saveKey(e.target.value)}
            placeholder="sk-ant-..."
            style={{
              width: "100%", padding: "9px 12px", fontSize: 13,
              background: "#141414", border: "1px solid #2a2a2a",
              borderRadius: 6, color: "#e0e0e0", fontFamily: "monospace",
            }}
          />
          <p style={{ fontSize: 11, color: "#444", marginTop: 4 }}>
            stored in localStorage · never sent anywhere except api.anthropic.com
          </p>
        </div>

        {/* Prompt input */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: "#555", letterSpacing: 1, display: "block", marginBottom: 6 }}>
            DESCRIBE YOUR APP
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Build a CRM with login, contacts, dashboard, role-based access, and premium plan..."
            rows={3}
            style={{
              width: "100%", padding: "10px 12px", fontSize: 13, resize: "vertical",
              background: "#141414", border: "1px solid #2a2a2a",
              borderRadius: 6, color: "#e0e0e0", fontFamily: "monospace", lineHeight: 1.6,
            }}
          />
        </div>

        {/* Example chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {EXAMPLE_PROMPTS.map((ex, i) => (
            <button key={i} onClick={() => setPrompt(ex)} style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 20,
              border: "1px solid #2a2a2a", cursor: "pointer",
              color: "#666", background: "#141414",
            }}>
              {["CRM app", "Task manager", "E-commerce", "Blog platform"][i]}
            </button>
          ))}
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            width: "100%", padding: "11px", fontSize: 13, fontWeight: 600,
            borderRadius: 6, cursor: running ? "not-allowed" : "pointer",
            border: "1px solid #378ADD44",
            background: running ? "#0a1628" : "#0d1f3c",
            color: running ? "#378ADD88" : "#378ADD",
            fontFamily: "monospace", letterSpacing: 0.5,
            marginBottom: 20, transition: "background 0.2s",
          }}
        >
          {running ? "⏳ compiling..." : "▶ compile app"}
        </button>

        {/* Stage cards */}
        <div style={{ marginBottom: 8 }}>
          {stages.map((s, i) => (
            <StageCard
              key={i} index={i}
              title={s.title} status={s.status}
              output={s.output} validation={s.validation}
            />
          ))}
        </div>

        {/* Final output */}
        {finalConfig && <FinalOutput config={finalConfig} />}

      </div>
    </div>
  );
}
