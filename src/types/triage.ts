export type SeverityLevel = "CRITICAL" | "URGENT" | "STABLE";

export type HazardType = 
  | "STRUCTURAL_COLLAPSE"
  | "FLASH_FLOOD"
  | "MEDICAL_EMERGENCY"
  | "FIRE_HAZARD"
  | "BLOCKED_ACCESS";

export type InferenceSource = "LOCAL_GEMINI_NANO" | "CLOUD_GEMINI_FLASH";

export type SyncStatus = "QUEUED_OFFLINE" | "SYNCED";

export interface TriageReport {
  report_id: string;
  severity: SeverityLevel;
  hazard_type: HazardType;
  people_affected: number | null;
  sector_hint: string;
  scrubbed_summary: string;
  pii_scrubbed: true;
  inference_source: InferenceSource;
  sync_status: SyncStatus;
  created_offline_at: string;
  verified_by_coordinator?: boolean;
  coordinator_notes?: string;
  corroborated_count?: number;
}

export interface RedactionResult {
  originalText: string;
  redactedText: string;
  redactedEntities: Array<{
    type: "PHONE" | "EMAIL" | "NAME" | "ID_NUMBER" | "LOCATION_DETAIL";
    matched: string;
  }>;
}

export interface SafetyProtocolCard {
  id: string;
  hazard_type: HazardType;
  title: string;
  urgency_level: "IMMEDIATE_ACTION" | "HEIGHTENED_CAUTION" | "CONTAINMENT";
  immediate_actions: string[];
  contraindications: string[]; // What NEVER to do
  broadcast_channel: string;
  version: string;
}

export interface ClusteredIncident {
  cluster_id: string;
  hazard_type: HazardType;
  severity: SeverityLevel;
  sector: string;
  corroborating_reports: string[]; // report_ids
  total_people_affected: number;
  synthetic_briefing: string;
  grounded_context: string;
  citations: Array<{ title: string; uri: string }>;
  timestamp: string;
}

export interface TelemetryState {
  isOnline: boolean;
  nanoState: "READY" | "DOWNLOADING" | "UNAVAILABLE" | "SIMULATED";
  activeProtocol: "EARTHQUAKE" | "FLASH_FLOOD" | "GENERAL_DISASTER";
  reportsTriagedLocally: number;
  cloudCallsCount: number;
  rawImagesUploaded: number;
  localComputeCostUsd: number;
}
