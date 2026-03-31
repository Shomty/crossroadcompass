/**
 * Recover JSON objects from Gemini output when fences / prose wrap the payload
 * or the model emits slightly invalid JSON.
 */

/** Strip ```json fences and leading/trailing noise. */
export function stripJsonFences(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^\uFEFF/, "");
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  return s;
}

function normalizeJsonishText(s: string): string {
  return s
    .replace(/^\uFEFF/, "")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

/**
 * Find the first top-level `{ ... }` using brace depth, respecting JSON strings
 * so inner `{` / `}` and quotes do not confuse the scan.
 */
export function extractFirstJsonObjectSlice(s: string): string | null {
  const start = s.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === "\\") {
        escape = true;
        continue;
      }
      if (c === '"') {
        inString = false;
        continue;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function unwrapJsonRoot(data: unknown): unknown {
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (first !== null && typeof first === "object" && !Array.isArray(first)) {
      return first;
    }
  }
  return data;
}

export function parseModelJsonObject(raw: string): unknown | null {
  const clean = normalizeJsonishText(stripJsonFences(raw));

  let parsed = tryParseJson(clean);
  if (parsed !== null) {
    return unwrapJsonRoot(parsed);
  }

  const slice = extractFirstJsonObjectSlice(clean);
  if (slice) {
    parsed = tryParseJson(slice);
    if (parsed !== null) {
      return unwrapJsonRoot(parsed);
    }
  }

  return null;
}

export interface ExtractJsonStringFieldOptions {
  /** If the closing `"` is missing (truncated output), return text read so far when non-empty. */
  unterminated?: boolean;
}

/**
 * Read a double-quoted JSON string value for `field` even when the overall
 * document is not valid JSON (e.g. broken later fields).
 */
export function extractJsonStringField(
  raw: string,
  field: string,
  options?: ExtractJsonStringFieldOptions
): string | null {
  const key = `"${field}"`;
  let searchFrom = 0;

  while (searchFrom < raw.length) {
    const i = raw.indexOf(key, searchFrom);
    if (i < 0) return null;

    let pos = i + key.length;
    while (pos < raw.length && /\s/.test(raw[pos])) pos++;
    if (raw[pos] !== ":") {
      searchFrom = i + 1;
      continue;
    }
    pos++;
    while (pos < raw.length && /\s/.test(raw[pos])) pos++;
    if (raw[pos] !== '"') {
      searchFrom = i + 1;
      continue;
    }
    pos++;

    let out = "";
    while (pos < raw.length) {
      const c = raw[pos];
      if (c === "\\") {
        if (pos + 1 >= raw.length) {
          if (options?.unterminated && out.length > 0) return out;
          return null;
        }
        const esc = raw[pos + 1];
        if (esc === "n") out += "\n";
        else if (esc === "r") out += "\r";
        else if (esc === "t") out += "\t";
        else if (esc === "u" && pos + 5 < raw.length) {
          const hex = raw.slice(pos + 2, pos + 6);
          const code = parseInt(hex, 16);
          if (!Number.isFinite(code)) return null;
          out += String.fromCharCode(code);
          pos += 6;
          continue;
        } else out += esc;
        pos += 2;
        continue;
      }
      if (c === '"') return out;
      out += c;
      pos++;
    }
    if (options?.unterminated && out.length > 0) return out;
    return null;
  }
  return null;
}

/** Best-effort `toneTags` array when full JSON.parse fails. */
export function extractToneTagsLoose(raw: string): string[] {
  const key = `"toneTags"`;
  const i = raw.indexOf(key);
  if (i < 0) return [];

  let pos = i + key.length;
  while (pos < raw.length && /\s/.test(raw[pos])) pos++;
  if (raw[pos] !== ":") return [];
  pos++;
  while (pos < raw.length && /\s/.test(raw[pos])) pos++;
  if (raw[pos] !== "[") return [];
  pos++;

  const tags: string[] = [];
  while (pos < raw.length) {
    while (pos < raw.length && /[\s,\n\r]/.test(raw[pos])) pos++;
    if (pos >= raw.length || raw[pos] === "]") break;
    if (raw[pos] !== '"') {
      pos++;
      continue;
    }
    pos++;
    let s = "";
    while (pos < raw.length) {
      const c = raw[pos];
      if (c === "\\") {
        if (pos + 1 >= raw.length) break;
        const esc = raw[pos + 1];
        if (esc === "n") s += "\n";
        else if (esc === "r") s += "\r";
        else if (esc === "t") s += "\t";
        else s += esc;
        pos += 2;
        continue;
      }
      if (c === '"') {
        if (s.trim()) tags.push(s);
        pos++;
        break;
      }
      s += c;
      pos++;
    }
  }
  return tags;
}

export interface TodayMoonLooseFields {
  headline: string;
  body: string;
  daytimeFocus: string;
  caution: string;
  toneTags: string[];
}

export function extractTodayMoonLooseFields(raw: string): TodayMoonLooseFields | null {
  const normalized = normalizeJsonishText(stripJsonFences(raw));
  const headline = extractJsonStringField(normalized, "headline")?.trim() ?? "";
  if (!headline) return null;

  let body =
    extractJsonStringField(normalized, "body")?.trim() ??
    extractJsonStringField(normalized, "body", { unterminated: true })?.trim() ??
    "";
  if (!body) return null;

  const daytimeFocus = extractJsonStringField(normalized, "daytimeFocus")?.trim() ?? "";
  const caution = extractJsonStringField(normalized, "caution")?.trim() ?? "";
  const toneTags = extractToneTagsLoose(normalized);

  return { headline, body, daytimeFocus, caution, toneTags };
}

/** Best-effort `concreteSteps` array when full JSON.parse fails. */
export function extractConcreteStepsLoose(raw: string): string[] {
  const key = `"concreteSteps"`;
  const i = raw.indexOf(key);
  if (i < 0) return [];

  let pos = i + key.length;
  while (pos < raw.length && /\s/.test(raw[pos])) pos++;
  if (raw[pos] !== ":") return [];
  pos++;
  while (pos < raw.length && /\s/.test(raw[pos])) pos++;
  if (raw[pos] !== "[") return [];
  pos++;

  const steps: string[] = [];
  while (pos < raw.length) {
    while (pos < raw.length && /[\s,\n\r]/.test(raw[pos])) pos++;
    if (pos >= raw.length || raw[pos] === "]") break;
    if (raw[pos] !== '"') {
      pos++;
      continue;
    }
    pos++;
    let s = "";
    while (pos < raw.length) {
      const c = raw[pos];
      if (c === "\\") {
        if (pos + 1 >= raw.length) break;
        const esc = raw[pos + 1];
        if (esc === "n") s += "\n";
        else if (esc === "r") s += "\r";
        else if (esc === "t") s += "\t";
        else s += esc;
        pos += 2;
        continue;
      }
      if (c === '"') {
        if (s.trim()) steps.push(s.trim());
        pos++;
        break;
      }
      s += c;
      pos++;
    }
  }
  return steps;
}

export interface OracleLooseFields {
  cosmicContext: string;
  psychologicalPattern: string;
  whyNow: string;
  concreteSteps: string[];
}

export function extractOracleLooseFields(raw: string): OracleLooseFields | null {
  const normalized = normalizeJsonishText(stripJsonFences(raw));
  const cosmicContext =
    extractJsonStringField(normalized, "cosmicContext")?.trim() ??
    extractJsonStringField(normalized, "cosmicContext", { unterminated: true })?.trim() ??
    "";
  const psychologicalPattern =
    extractJsonStringField(normalized, "psychologicalPattern")?.trim() ??
    extractJsonStringField(normalized, "psychologicalPattern", { unterminated: true })?.trim() ??
    "";
  const whyNow =
    extractJsonStringField(normalized, "whyNow")?.trim() ??
    extractJsonStringField(normalized, "whyNow", { unterminated: true })?.trim() ??
    "";
  if (!cosmicContext || !psychologicalPattern || !whyNow) return null;

  const concreteSteps = extractConcreteStepsLoose(normalized);
  if (concreteSteps.length < 3) return null;

  return {
    cosmicContext,
    psychologicalPattern,
    whyNow,
    concreteSteps: concreteSteps.slice(0, 3),
  };
}
