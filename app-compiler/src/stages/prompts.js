// ─── STAGE 1: Intent Extraction ───────────────────────────────────────────────
export function buildStage1Prompt(userPrompt) {
  return `You are stage 1 of a multi-stage app compiler pipeline. Your ONLY job is intent extraction.

User input: "${userPrompt}"

Extract structured intent. Return ONLY valid JSON, no markdown fences, no explanation.

Required schema:
{
  "app_name": "string",
  "app_type": "crm|ecommerce|saas|social|productivity|other",
  "core_features": ["array of feature strings"],
  "user_roles": ["array of role names"],
  "auth_required": true,
  "payment_required": false,
  "has_analytics": false,
  "has_notifications": false,
  "assumptions": ["list any assumptions made for vague inputs"],
  "ambiguities": ["list unclear or conflicting requirements"]
}`;
}

// ─── STAGE 2: System Design Layer ─────────────────────────────────────────────
export function buildStage2Prompt(userPrompt, stage1Output) {
  return `You are stage 2 of a multi-stage app compiler pipeline. Your ONLY job is system design.

Original user request: "${userPrompt}"
Stage 1 output (extracted intent): ${JSON.stringify(stage1Output, null, 2)}

Based on the extracted intent, design the app architecture.
Return ONLY valid JSON, no markdown fences, no explanation.

Required schema:
{
  "entities": [
    { "name": "string", "description": "string", "key_fields": ["string"] }
  ],
  "pages": [
    { "name": "string", "route": "string", "roles": ["string"], "components": ["string"] }
  ],
  "auth_model": {
    "type": "jwt|session|oauth",
    "roles": ["string"],
    "permissions": { "role_name": ["permission_string"] }
  },
  "business_logic": [
    { "name": "string", "description": "string", "trigger": "string" }
  ],
  "integrations": ["string"]
}`;
}

// ─── STAGE 3: Schema Generation ───────────────────────────────────────────────
export function buildStage3Prompt(userPrompt, stage2Output) {
  return `You are stage 3 of a multi-stage app compiler pipeline. Your ONLY job is generating complete schemas.

Original user request: "${userPrompt}"
Stage 2 output (system design): ${JSON.stringify(stage2Output, null, 2)}

Generate complete UI, API, DB and Auth schemas based on the system design above.
Every page must have matching API endpoints. Every API endpoint must reference a real DB table.
Return ONLY valid JSON, no markdown fences, no explanation.

Required schema:
{
  "ui_schema": {
    "pages": [
      {
        "id": "string",
        "name": "string",
        "route": "string",
        "layout": "string",
        "components": [
          { "id": "string", "type": "string", "props": {}, "api_dependency": "string" }
        ]
      }
    ]
  },
  "api_schema": {
    "endpoints": [
      {
        "method": "GET|POST|PUT|DELETE",
        "path": "string",
        "description": "string",
        "auth_required": true,
        "roles": ["string"],
        "request_body": {},
        "response": {},
        "db_table": "string"
      }
    ]
  },
  "db_schema": {
    "tables": [
      {
        "name": "string",
        "fields": [
          { "name": "string", "type": "string", "required": true, "unique": false }
        ],
        "relations": [
          { "table": "string", "type": "one-to-many|many-to-many|one-to-one", "foreign_key": "string" }
        ]
      }
    ]
  },
  "auth_schema": {
    "strategy": "string",
    "roles": [{ "name": "string", "permissions": ["string"] }],
    "token_type": "JWT|session",
    "session_duration": "string",
    "refresh_token": true
  }
}`;
}

// ─── STAGE 4: Refinement + Cross-Layer Consistency ────────────────────────────
export function buildStage4Prompt(userPrompt, stage3Output) {
  return `You are stage 4 of a multi-stage app compiler pipeline. Your ONLY job is refinement and cross-layer consistency.

Original user request: "${userPrompt}"
Stage 3 output (schemas): ${JSON.stringify(stage3Output, null, 2)}

Perform these consistency checks and FIX any issues found:
1. Every UI component with api_dependency must reference an existing API endpoint path
2. Every API endpoint's db_table must reference an existing DB table name
3. All roles used in UI pages and API endpoints must exist in auth_schema.roles
4. Remove any hallucinated or orphaned references
5. Ensure business logic triggers map to real API endpoints

Return a FINAL complete config as ONLY valid JSON, no markdown fences, no explanation.

Required schema:
{
  "app_config": {
    "meta": {
      "app_name": "string",
      "version": "1.0",
      "generated_at": "ISO timestamp"
    },
    "ui_schema": { ... },
    "api_schema": { ... },
    "db_schema": { ... },
    "auth_schema": { ... },
    "business_logic": [...],
    "consistency_report": {
      "issues_found": 0,
      "issues_fixed": 0,
      "warnings": []
    }
  }
}`;
}

// ─── REPAIR PROMPTS ───────────────────────────────────────────────────────────
export function buildJsonRepairPrompt(brokenOutput) {
  return `The following output from an AI pipeline stage is either invalid JSON or missing required fields.
Fix it and return ONLY valid, complete JSON. No explanation, no markdown fences.

Broken output:
${brokenOutput}`;
}

export function buildFieldRepairPrompt(parsedOutput, missingFields) {
  return `The following JSON output is missing these required fields: ${missingFields.join(", ")}

Add the missing fields with sensible values and return the complete fixed JSON.
No explanation, no markdown fences.

Current output:
${JSON.stringify(parsedOutput, null, 2)}`;
}
