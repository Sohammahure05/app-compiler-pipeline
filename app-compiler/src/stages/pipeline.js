import { callClaude } from "../utils/api";
import { safeParseJSON, getMissingFields, VALIDATORS } from "../utils/validator";
import {
  buildStage1Prompt,
  buildStage2Prompt,
  buildStage3Prompt,
  buildStage4Prompt,
  buildJsonRepairPrompt,
  buildFieldRepairPrompt,
} from "./prompts";

const PROMPT_BUILDERS = [
  (userPrompt, _prev)   => buildStage1Prompt(userPrompt),
  (userPrompt, prev)    => buildStage2Prompt(userPrompt, prev),
  (userPrompt, prev)    => buildStage3Prompt(userPrompt, prev),
  (userPrompt, prev)    => buildStage4Prompt(userPrompt, prev),
];

// ─── Run a single stage with validation + surgical repair ─────────────────────
export async function runStage(stageIndex, userPrompt, prevOutput, apiKey, onRepair) {
  const buildPrompt = PROMPT_BUILDERS[stageIndex];
  const validate    = VALIDATORS[stageIndex];
  const prompt      = buildPrompt(userPrompt, prevOutput);

  let raw, parsed, validation;

  // ── Step 1: Call Claude ──
  raw = await callClaude(prompt, apiKey);

  // ── Step 2: Parse JSON (repair if broken) ──
  try {
    parsed = safeParseJSON(raw);
  } catch (_parseErr) {
    onRepair?.("json_parse");
    const repairRaw = await callClaude(buildJsonRepairPrompt(raw), apiKey);
    parsed = safeParseJSON(repairRaw); // throws if still broken
  }

  // ── Step 3: Validate fields (surgical repair if missing) ──
  validation = validate(parsed);
  if (!validation.valid) {
    onRepair?.("missing_fields");
    const missing    = getMissingFields(validation);
    const repairRaw  = await callClaude(buildFieldRepairPrompt(parsed, missing), apiKey);
    parsed           = safeParseJSON(repairRaw);
    validation       = validate(parsed);
  }

  return { parsed, validation, repaired: !validation.valid === false };
}

// ─── Run the full 4-stage pipeline ───────────────────────────────────────────
export async function runFullPipeline(userPrompt, apiKey, callbacks) {
  const {
    onStageStart,   // (stageIndex) => void
    onStageDone,    // (stageIndex, result) => void
    onStageError,   // (stageIndex, error) => void
    onRepair,       // (stageIndex, repairType) => void
  } = callbacks;

  const outputs = [];

  for (let i = 0; i < 4; i++) {
    onStageStart?.(i);
    try {
      const prevOutput = i > 0 ? outputs[i - 1] : null;
      const result = await runStage(
        i,
        userPrompt,
        prevOutput,
        apiKey,
        (type) => onRepair?.(i, type)
      );
      outputs.push(result.parsed);
      onStageDone?.(i, result);
    } catch (err) {
      onStageError?.(i, err);
      throw err; // stop pipeline
    }
  }

  return outputs[3]; // final config from stage 4
}
