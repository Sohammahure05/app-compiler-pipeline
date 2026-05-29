// ─── Validation checks for each pipeline stage ────────────────────────────────

export function validateStage1(obj) {
  const checks = [
    { label: "app_name present",       pass: typeof obj.app_name === "string" && obj.app_name.length > 0 },
    { label: "core_features array",    pass: Array.isArray(obj.core_features) && obj.core_features.length > 0 },
    { label: "user_roles array",       pass: Array.isArray(obj.user_roles) && obj.user_roles.length > 0 },
    { label: "auth_required boolean",  pass: typeof obj.auth_required === "boolean" },
    { label: "assumptions present",    pass: Array.isArray(obj.assumptions) },
  ];
  return { valid: checks.every((c) => c.pass), checks };
}

export function validateStage2(obj) {
  const checks = [
    { label: "entities array",         pass: Array.isArray(obj.entities) && obj.entities.length > 0 },
    { label: "pages array",            pass: Array.isArray(obj.pages) && obj.pages.length > 0 },
    { label: "auth_model present",     pass: !!obj.auth_model && Array.isArray(obj.auth_model.roles) },
    { label: "business_logic array",   pass: Array.isArray(obj.business_logic) },
    { label: "integrations array",     pass: Array.isArray(obj.integrations) },
  ];
  return { valid: checks.every((c) => c.pass), checks };
}

export function validateStage3(obj) {
  const hasUI  = obj.ui_schema  && Array.isArray(obj.ui_schema.pages)      && obj.ui_schema.pages.length > 0;
  const hasAPI = obj.api_schema && Array.isArray(obj.api_schema.endpoints) && obj.api_schema.endpoints.length > 0;
  const hasDB  = obj.db_schema  && Array.isArray(obj.db_schema.tables)     && obj.db_schema.tables.length > 0;
  const hasAuth = !!obj.auth_schema && Array.isArray(obj.auth_schema.roles);

  const checks = [
    { label: "ui_schema with pages",      pass: !!hasUI },
    { label: "api_schema with endpoints", pass: !!hasAPI },
    { label: "db_schema with tables",     pass: !!hasDB },
    { label: "auth_schema with roles",    pass: !!hasAuth },
  ];

  // Cross-layer check: API endpoints reference DB tables
  let crossLayerPass = true;
  if (hasAPI && hasDB) {
    const tableNames = obj.db_schema.tables.map((t) => t.name.toLowerCase());
    const orphaned = obj.api_schema.endpoints.filter(
      (ep) => ep.db_table && !tableNames.includes(ep.db_table.toLowerCase())
    );
    crossLayerPass = orphaned.length === 0;
    checks.push({ label: `API→DB cross-layer (${orphaned.length} orphans)`, pass: crossLayerPass });
  }

  return { valid: checks.every((c) => c.pass), checks };
}

export function validateStage4(obj) {
  const cfg = obj.app_config;
  const checks = [
    { label: "app_config root",        pass: !!cfg },
    { label: "meta block",             pass: !!cfg?.meta && !!cfg.meta.app_name },
    { label: "ui + api + db present",  pass: !!cfg?.ui_schema && !!cfg?.api_schema && !!cfg?.db_schema },
    { label: "auth_schema present",    pass: !!cfg?.auth_schema },
    { label: "consistency_report",     pass: !!cfg?.consistency_report },
  ];
  return { valid: checks.every((c) => c.pass), checks };
}

export const VALIDATORS = [validateStage1, validateStage2, validateStage3, validateStage4];

// ─── Parse JSON safely (strips markdown fences) ───────────────────────────────
export function safeParseJSON(text) {
  const clean = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // find first { or [ and last } or ]
  const start = clean.search(/[{[]/);
  const end   = Math.max(clean.lastIndexOf("}"), clean.lastIndexOf("]"));
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  return JSON.parse(clean.slice(start, end + 1));
}

// ─── Get missing field names from validation result ───────────────────────────
export function getMissingFields(validationResult) {
  return validationResult.checks.filter((c) => !c.pass).map((c) => c.label);
}
