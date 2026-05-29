# App Compiler Pipeline

> Natural language → validated JSON app config · 4-stage AI pipeline

A compiler-style system that converts open-ended product descriptions into complete, validated, executable app configurations. Built as a demo task for an AI Engineer internship.

---

## Architecture

```
User Prompt
    │
    ▼
┌─────────────────────────┐
│  Stage 1                │  Intent Extraction
│  Parse user intent      │  → app_name, features, roles, assumptions
└──────────┬──────────────┘
           │
    ▼
┌─────────────────────────┐
│  Stage 2                │  System Design Layer
│  App architecture       │  → entities, pages, auth model, business logic
└──────────┬──────────────┘
           │
    ▼
┌─────────────────────────┐
│  Stage 3                │  Schema Generation
│  Full schemas           │  → UI schema, API schema, DB schema, Auth schema
└──────────┬──────────────┘
           │
    ▼
┌─────────────────────────┐
│  Stage 4                │  Refinement + Consistency
│  Cross-layer validation │  → fixes orphaned refs, ensures all layers align
└──────────┬──────────────┘
           │
    ▼
Final JSON App Config
```

Each stage has a strict JSON contract. Outputs are validated before being passed to the next stage.

---

## Validation + Repair Engine

The core of the system. After every stage:

1. **JSON parse check** — strips markdown fences, finds JSON boundaries
2. **Required field check** — validates schema-specific required fields
3. **Cross-layer consistency** — checks API endpoints reference real DB tables, UI pages reference real API paths, all roles exist in auth schema
4. **Surgical repair** — if validation fails, only the broken part is re-prompted (not a full retry)

Repair types:
- `json_parse` — Claude returned malformed JSON → send repair prompt
- `missing_fields` — required fields absent → send surgical field repair prompt

---

## Live Metrics

Tracked per session:
- **Runs** — total pipeline executions
- **Success rate** — % that completed without unrecoverable errors
- **Repairs** — how many surgical repairs were triggered
- **Avg latency** — average end-to-end time per run

---

## Setup

### Prerequisites
- Node.js 16+
- Anthropic API key ([get one here](https://console.anthropic.com))

### Run locally

```bash
git clone https://github.com/YOUR_USERNAME/app-compiler-pipeline
cd app-compiler-pipeline
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

Enter your Anthropic API key in the UI (stored in localStorage only).

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variable in Vercel dashboard:  
`REACT_APP_ANTHROPIC_API_KEY` = your key (optional — UI also accepts it at runtime)

---

## Project Structure

```
src/
├── stages/
│   ├── prompts.js      # All 4 stage prompts + repair prompts
│   └── pipeline.js     # Pipeline orchestrator with repair logic
├── utils/
│   ├── api.js          # Claude API caller
│   └── validator.js    # Per-stage validators + JSON parser
└── components/
    ├── StageCard.jsx   # Individual stage display
    ├── MetricsBar.jsx  # Live metrics display
    └── FinalOutput.jsx # Tabbed final JSON viewer
```

---

## Evaluation Dataset

See `evaluation/` folder for:
- 10 normal product prompts
- 10 edge cases (vague, conflicting, underspecified)
- Results with success rate, repair count, latency per prompt

---

## Failure Handling

| Input type | Behavior |
|---|---|
| Vague prompt | Stage 1 documents assumptions made |
| Conflicting requirements | Stage 1 flags ambiguities, Stage 4 resolves |
| Underspecified inputs | Reasonable defaults applied, documented in `assumptions` |
| Malformed API response | JSON repair prompt triggered automatically |
| Missing required fields | Surgical field repair triggered automatically |

---

## Cost vs Quality Tradeoffs

| Setting | Latency | Cost | Quality |
|---|---|---|---|
| 4 stages, max_tokens=2000 | ~30-40s | ~$0.04/run | High |
| 2 stages (merged) | ~15-20s | ~$0.02/run | Medium |
| Single prompt | ~5s | ~$0.005/run | Low (fails validation) |

The multi-stage approach is deliberate: each stage only sees what it needs, reducing hallucinations and improving schema correctness. The cost per run is acceptable for a compiler that would be used once per app generation.

---

## Tech Stack

- React 18
- Anthropic Claude Sonnet (claude-sonnet-4-20250514)
- Zero external dependencies (no UI library, no state management library)
