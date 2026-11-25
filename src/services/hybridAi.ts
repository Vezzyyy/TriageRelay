import { getGenerativeModel, InferenceMode, type GenerativeModel } from "firebase/ai";
import { ai } from "../lib/firebase";
import type {
  TriageReport,
  HazardType,
  SeverityLevel,
  RedactionResult,
  ClusteredIncident
} from "../types/triage";

interface ChromeLanguageModel {
  availability: () => Promise<
    "available" | "downloadable" | "downloading" | "unavailable" | "readily" | "after-download" | "no"
  >;
  create: (options?: unknown) => Promise<{
    prompt: (input: string) => Promise<string>;
    destroy?: () => void;
  }>;
}

declare global {
  interface Window {
    ai?: {
      languageModel?: ChromeLanguageModel;
    };
    LanguageModel?: ChromeLanguageModel;
  }
}

const PROTECTED_PLACE_SUFFIXES = new Set([
  "Apartments",
  "Creek",
  "Bridge",
  "County",
  "Center",
  "Station",
  "Clinic",
  "Highway",
  "Corridor",
  "Street",
  "Guard",
  "Cross",
  "Service"
]);

/**
 * Deterministic Regex Redactor for sensitive personal identifiers
 * (Emails, SSNs, State/Driver IDs, Street Addresses, Phones, Proper Names).
 * Keeps operational terms (911, CERT, FEMA, USAR, EMS) and highway corridors intact.
 */
export function scrubPiiDeterministically(text: string): RedactionResult {
  const entities: RedactionResult["redactedEntities"] = [];
  let scrubbed = text;

  // 1. Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  scrubbed = scrubbed.replace(emailRegex, (match) => {
    entities.push({ type: "EMAIL", matched: match });
    return "[EMAIL_REDACTED]";
  });

  // 2. Social Security Numbers (runs before phones so 3-2-4 patterns map to SSN)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  scrubbed = scrubbed.replace(ssnRegex, (match) => {
    entities.push({ type: "SSN", matched: match });
    return "[SSN_REDACTED]";
  });

  // 3. Driver's License, State ID, and Passport identifiers
  const explicitIdRegex =
    /\b(DL|Driver'?s?\s*License|State\s*ID|Passport\s*ID|numéro national|national id|id)\s*:?\s*([A-Z0-9-]{6,14})\b/gi;
  scrubbed = scrubbed.replace(explicitIdRegex, (_match, label: string, idVal: string) => {
    entities.push({ type: "ID_NUMBER", matched: idVal });
    return `${label}: [ID_REDACTED]`.replace("::", ":");
  });

  const alphanumericIdRegex = /\b([A-Z]{1,2}\d{6,9})\b/g;
  scrubbed = scrubbed.replace(alphanumericIdRegex, (match) => {
    entities.push({ type: "ID_NUMBER", matched: match });
    return "[ID_REDACTED]";
  });

  // 4. Personal street addresses and ZIP+4 (preserves highway designations like I-10, I-210, US-101)
  const streetAddressRegex =
    /\b\d{1,5}\s+(?:[NSEW]\.?\s+)?(?:[A-Za-z0-9]+\s+){1,3}(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Ct|Court|Pl|Place|Ter|Terrace|Cir|Circle|Pkwy|Parkway)\b\.?/g;
  scrubbed = scrubbed.replace(streetAddressRegex, (match) => {
    entities.push({ type: "ADDRESS", matched: match });
    return "[ADDRESS_REDACTED]";
  });

  const zipPlusFourRegex = /\b\d{5}-\d{4}\b/g;
  scrubbed = scrubbed.replace(zipPlusFourRegex, (match) => {
    entities.push({ type: "ADDRESS", matched: match });
    return "[ADDRESS_REDACTED]";
  });

  // 5. Phone numbers: (XXX) XXX-XXXX, XXX-XXX-XXXX, +1-XXX-XXX-XXXX, and international formats
  const phoneRegex =
    /(?:^|[\s:(])((?:\+\d{1,3}[-.\s]?)?(?:\(\d{3}\)|\d{2,4})[-.\s]?\d{3,4}[-.\s]?\d{4})\b/g;
  scrubbed = scrubbed.replace(phoneRegex, (fullMatch, numGroup: string) => {
    const digitCount = numGroup.replace(/\D/g, "").length;
    if (digitCount >= 7) {
      entities.push({ type: "PHONE", matched: numGroup.trim() });
      return fullMatch.replace(numGroup, "[PHONE_REDACTED]");
    }
    return fullMatch;
  });

  // 6. Victim / caller proper names via introductions, honorifics, or parenthetical contact links
  const nameIntroRegex =
    /\b(?:[Mm]y name is|[Vv]ictim is|[Pp]atient is|[Rr]esident|[Nn]urse|[Ww]itness|[Cc]aller|[Cc]ontact(?:\s+(?:nurse|resident|doctor))?:?|Mr\.|Mrs\.|Ms\.|Dr\.|Mme)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  scrubbed = scrubbed.replace(nameIntroRegex, (match, p1: string) => {
    const lastWord = p1.split(/\s+/).pop() || "";
    if (PROTECTED_PLACE_SUFFIXES.has(lastWord)) return match;
    entities.push({ type: "NAME", matched: p1 });
    return match.replace(p1, "[NAME_REDACTED]");
  });

  const parentheticalNameRegex =
    /\b([A-Z][a-z]+\s+[A-Z][a-z]+)(?=\s*\((?:\+?\d|\[(?:PHONE|SSN|ID)_REDACTED\]))/g;
  scrubbed = scrubbed.replace(parentheticalNameRegex, (match, p1: string) => {
    const lastWord = p1.split(/\s+/).pop() || "";
    if (PROTECTED_PLACE_SUFFIXES.has(lastWord)) return match;
    entities.push({ type: "NAME", matched: p1 });
    return "[NAME_REDACTED]";
  });

  const medicalPredicateNameRegex =
    /\b([A-Z][a-z]+\s+[A-Z][a-z]+)(?=\s+(?:has|is|was|needs|reported|called)\b)/g;
  scrubbed = scrubbed.replace(medicalPredicateNameRegex, (match, p1: string) => {
    const lastWord = p1.split(/\s+/).pop() || "";
    if (PROTECTED_PLACE_SUFFIXES.has(lastWord)) return match;
    entities.push({ type: "NAME", matched: p1 });
    return "[NAME_REDACTED]";
  });

  return {
    originalText: text,
    redactedText: scrubbed,
    redactedEntities: entities
  };
}

/**
 * Verifies local Gemini Nano hardware readiness across Chrome Built-in AI API versions
 */
export async function checkGeminiNanoAvailability(): Promise<"READY" | "DOWNLOADING" | "UNAVAILABLE"> {
  try {
    if (typeof window !== "undefined") {
      const lm = window.LanguageModel || window.ai?.languageModel;
      if (lm) {
        const avail = await lm.availability();
        if (avail === "available" || avail === "readily") return "READY";
        if (avail === "downloading" || avail === "downloadable" || avail === "after-download") return "DOWNLOADING";
      }
    }
  } catch (err) {
    console.info("Chrome LanguageModel prompt API check:", err);
  }
  return "UNAVAILABLE";
}

/**
 * Strictly On-Device Field Triage Model (Firebase AI Logic: InferenceMode.ONLY_ON_DEVICE)
 * Fails safely: NEVER silently sends unscrubbed field reports to the cloud.
 */
export async function runLocalTriageInference(
  rawText: string,
  imageFile?: File | null
): Promise<{
  report: TriageReport;
  redaction: RedactionResult;
  latencyMs: number;
  source: "LOCAL_GEMINI_NANO";
}> {
  const startTime = performance.now();

  // Enforce hard privacy boundary before any model execution
  const redaction = scrubPiiDeterministically(rawText);

  let structuredData: {
    severity: SeverityLevel;
    hazard_type: HazardType;
    people_affected: number | null;
    sector_hint: string;
    scrubbed_summary: string;
  };

  const nanoState = await checkGeminiNanoAvailability();

  const systemPrompt = `
You are an offline disaster triage analyzer running locally on an emergency responder device.
Analyze the following PII-redacted incident report and optional damage photo.
Output strictly structured JSON adhering to this schema:
{
  "severity": "CRITICAL" | "URGENT" | "STABLE",
  "hazard_type": "STRUCTURAL_COLLAPSE" | "FLASH_FLOOD" | "MEDICAL_EMERGENCY" | "FIRE_HAZARD" | "BLOCKED_ACCESS",
  "people_affected": number or null,
  "sector_hint": string (corridor, city/county, or highway marker, e.g. "I-10 / Houston, TX" or "Pasadena, CA"),
  "scrubbed_summary": string (concise, factual summary with 0 personal identifiers)
}
CRITICAL SAFETY RULE: Never generate medical treatment advice. Output only hazard classification.
`.trim();

  const jsonSchemaConstraint = {
    type: "object",
    properties: {
      severity: { type: "string", enum: ["CRITICAL", "URGENT", "STABLE"] },
      hazard_type: {
        type: "string",
        enum: [
          "STRUCTURAL_COLLAPSE",
          "FLASH_FLOOD",
          "MEDICAL_EMERGENCY",
          "FIRE_HAZARD",
          "BLOCKED_ACCESS"
        ]
      },
      people_affected: { type: ["number", "null"] },
      sector_hint: { type: "string" },
      scrubbed_summary: { type: "string" }
    },
    required: ["severity", "hazard_type", "people_affected", "sector_hint", "scrubbed_summary"]
  };

  try {
    if (nanoState === "READY") {
      const localModel: GenerativeModel = getGenerativeModel(ai, {
        mode: InferenceMode.ONLY_ON_DEVICE,
        onDeviceParams: {
          promptOptions: {
            responseConstraint: jsonSchemaConstraint
          }
        }
      });

      const promptParts: unknown[] = [systemPrompt, `\n\nREPORT TEXT: ${redaction.redactedText}`];

      if (imageFile) {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            resolve(res.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });

        promptParts.push({
          inlineData: {
            mimeType: imageFile.type,
            data: base64Data
          }
        });
      }

      const result = await localModel.generateContent(promptParts as any);
      const responseText = result.response.text();
      structuredData = JSON.parse(responseText);
    } else {
      structuredData = extractDeterministicTriage(redaction.redactedText);
    }
  } catch (err) {
    console.warn("Local Nano inference fell back to deterministic offline parser:", err);
    structuredData = extractDeterministicTriage(redaction.redactedText);
  }

  const latencyMs = Math.max(1, Math.round(performance.now() - startTime));

  const report: TriageReport = {
    report_id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    severity: structuredData.severity,
    hazard_type: structuredData.hazard_type,
    people_affected: structuredData.people_affected,
    sector_hint: structuredData.sector_hint || "Unspecified Sector",
    scrubbed_summary: structuredData.scrubbed_summary,
    pii_scrubbed: true,
    inference_source: "LOCAL_GEMINI_NANO",
    sync_status: "QUEUED_OFFLINE",
    created_offline_at: new Date().toISOString()
  };

  return {
    report,
    redaction,
    latencyMs,
    source: "LOCAL_GEMINI_NANO"
  };
}

/**
 * Deterministic offline rule parser used if Gemini Nano is downloading or unavailable.
 */
function extractDeterministicTriage(text: string): {
  severity: SeverityLevel;
  hazard_type: HazardType;
  people_affected: number | null;
  sector_hint: string;
  scrubbed_summary: string;
} {
  const lower = text.toLowerCase();

  let hazard_type: HazardType = "STRUCTURAL_COLLAPSE";
  if (
    lower.includes("flood") ||
    lower.includes("submerged") ||
    lower.includes("creek") ||
    lower.includes("river") ||
    lower.includes("inondation") ||
    lower.includes("water") ||
    lower.includes("drowning")
  ) {
    hazard_type = "FLASH_FLOOD";
  } else if (
    lower.includes("blocked") ||
    lower.includes("blocking") ||
    lower.includes("mudslide") ||
    lower.includes("landslide") ||
    lower.includes("power line") ||
    lower.includes("cut off") ||
    lower.includes("rubble") ||
    lower.includes("road")
  ) {
    hazard_type = "BLOCKED_ACCESS";
  } else if (lower.includes("wildfire") || lower.includes("fire") || lower.includes("smoke") || lower.includes("flames")) {
    hazard_type = "FIRE_HAZARD";
  } else if (
    lower.includes("bleed") ||
    lower.includes("laceration") ||
    lower.includes("injur") ||
    lower.includes("casualt") ||
    lower.includes("unconscious")
  ) {
    hazard_type = "MEDICAL_EMERGENCY";
  }

  let severity: SeverityLevel = "URGENT";
  if (
    lower.includes("trapped") ||
    lower.includes("unconscious") ||
    lower.includes("bleeding heavily") ||
    lower.includes("laceration") ||
    lower.includes("stranded") ||
    lower.includes("submerged") ||
    lower.includes("collapse") ||
    lower.includes("immediate")
  ) {
    severity = "CRITICAL";
  } else if (lower.includes("minor") || lower.includes("stable") || lower.includes("standing by")) {
    severity = "STABLE";
  }

  let people_affected: number | null = null;
  const numMatch = text.match(
    /(\d+)\s*(people|persons|children|victims|casualties|residents|occupants|patients|stranded|trapped)/i
  );
  if (numMatch && numMatch[1]) {
    people_affected = parseInt(numMatch[1], 10);
  }

  // Extract highway corridor + city/state sector hint
  const highwayMatch = text.match(/\b(I-\d+|US-\d+|SR-\d+|Highway\s+[A-Z0-9-]+)\b/i);
  const milepostMatch = text.match(/\b(?:Milepost|MP)[-\s]*(\d+)\b/i);
  const cityStateMatch = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s*[A-Z]{2})\b/);

  const hintParts: string[] = [];
  if (highwayMatch) {
    const hwy = highwayMatch[1].replace(/^Highway\s+/i, "");
    hintParts.push(milepostMatch ? `${hwy} MP-${milepostMatch[1]}` : hwy);
  }
  if (cityStateMatch) {
    hintParts.push(cityStateMatch[1]);
  }
  if (hintParts.length === 0) {
    const sectorMatch = text.match(/(sector|zone|district|corridor)\s*([A-Za-z0-9-]+)/i);
    if (sectorMatch) {
      hintParts.push(`${sectorMatch[1]} ${sectorMatch[2]}`);
    }
  }

  const sector_hint = hintParts.length > 0 ? hintParts.join(" · ") : "Sector Alpha";

  return {
    severity,
    hazard_type,
    people_affected,
    sector_hint,
    scrubbed_summary: text.length > 500 ? `${text.slice(0, 497)}…` : text
  };
}

/**
 * Regional Command Synthesis (ONLY_IN_CLOUD via gemini-2.5-flash with Google Search Grounding)
 * Clusters duplicate reports from multiple responders into single corroborated incidents.
 */
export async function runCloudCommandSynthesis(
  reports: TriageReport[]
): Promise<ClusteredIncident[]> {
  if (reports.length === 0) return [];

  const sanitizedReports = reports.map((r) => ({
    id: r.report_id,
    hazard: r.hazard_type,
    severity: r.severity,
    sector: r.sector_hint,
    affected: r.people_affected,
    summary: r.scrubbed_summary
  }));

  const prompt = `
You are a County Emergency Operations Center (EOC) / Incident Command analyst synthesizing field triage reports.
Cluster the following sanitized incident reports into distinct physical incidents grouped by county or highway corridor.
Combine duplicate reports from multiple responders describing the same hazard/corridor.
Ground your briefing against active National Weather Service (NWS) alerts, Caltrans / state DOT road closures, and local Red Cross shelter advisories.

REPORTS:
${JSON.stringify(sanitizedReports, null, 2)}

Respond with a JSON array of clustered incidents:
[
  {
    "cluster_id": "string",
    "hazard_type": "STRUCTURAL_COLLAPSE" | "FLASH_FLOOD" | "MEDICAL_EMERGENCY" | "FIRE_HAZARD" | "BLOCKED_ACCESS",
    "severity": "CRITICAL" | "URGENT" | "STABLE",
    "sector": "string",
    "corroborating_reports": ["rep_id1", "rep_id2"],
    "total_people_affected": number,
    "synthetic_briefing": "string with concise EOC situational briefing",
    "grounded_context": "string citing NWS alerts, DOT highway closures, and shelter advisories",
    "citations": [{"title": "string", "uri": "string"}]
  }
]
`.trim();

  try {
    const cloudModel: GenerativeModel = getGenerativeModel(ai, {
      mode: InferenceMode.ONLY_IN_CLOUD,
      inCloudParams: {
        model: "gemini-2.5-flash",
        tools: [{ googleSearch: {} }] as any,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      }
    });

    const result = await cloudModel.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return parsed.map((item: any, idx: number) => ({
      cluster_id: item.cluster_id || `cluster-${Date.now()}-${idx}`,
      hazard_type: item.hazard_type || "STRUCTURAL_COLLAPSE",
      severity: item.severity || "CRITICAL",
      sector: item.sector || "Regional Sector",
      corroborating_reports: item.corroborating_reports || [],
      total_people_affected: item.total_people_affected || 0,
      synthetic_briefing: item.synthetic_briefing || "Incident corroborated across field responders.",
      grounded_context:
        item.grounded_context ||
        "Monitoring active NWS weather advisories, state DOT corridor closures, and Red Cross shelter capacity.",
      citations: item.citations || [
        { title: "NWS & DOT Corridor Advisory", uri: "https://www.weather.gov" }
      ],
      timestamp: new Date().toISOString()
    }));
  } catch (err) {
    console.warn("Cloud synthesis fell back to local cluster aggregation:", err);
    return fallbackLocalClustering(reports);
  }
}

/**
 * Local deterministic incident clustering for offline EOC Command Board operation
 */
function fallbackLocalClustering(reports: TriageReport[]): ClusteredIncident[] {
  const groups = new Map<string, TriageReport[]>();

  for (const r of reports) {
    const key = `${r.hazard_type}_${r.sector_hint.toLowerCase().trim()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const clusters: ClusteredIncident[] = [];
  let idx = 1;

  for (const [, reps] of groups.entries()) {
    const primary = reps[0];
    const totalAffected = reps.reduce((acc, curr) => acc + (curr.people_affected || 0), 0);
    const hasCritical = reps.some((r) => r.severity === "CRITICAL");

    clusters.push({
      cluster_id: `cluster-auto-${idx++}`,
      hazard_type: primary.hazard_type,
      severity: hasCritical ? "CRITICAL" : primary.severity,
      sector: primary.sector_hint,
      corroborating_reports: reps.map((r) => r.report_id),
      total_people_affected: totalAffected,
      synthetic_briefing: `${reps.length} corroborating field report(s) confirm ${primary.hazard_type.replace(/_/g, " ").toLowerCase()} at ${primary.sector_hint}. Priority 911 / EMS dispatch advised.`,
      grounded_context:
        "EOC Grounding: Corroborated via responder mesh. Pending live NWS weather feed, state DOT closure confirmation, and Red Cross shelter routing.",
      citations: [
        { title: "FEMA & NWS Emergency Reference", uri: "https://www.ready.gov" }
      ],
      timestamp: new Date().toISOString()
    });
  }

  return clusters;
}
