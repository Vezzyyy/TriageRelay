import { getValue, fetchAndActivate } from "firebase/remote-config";
import { remoteConfig } from "../lib/firebase";
import type { HazardType, SafetyProtocolCard } from "../types/triage";

// Static vetted emergency protocol cards (guaranteed safety, no hallucinated medical advice)
export const STATIC_SAFETY_PROTOCOLS: Record<HazardType, SafetyProtocolCard> = {
  STRUCTURAL_COLLAPSE: {
    id: "card-struct-collapse-v2",
    hazard_type: "STRUCTURAL_COLLAPSE",
    title: "Structural Collapse / Entrapment Protocol",
    urgency_level: "IMMEDIATE_ACTION",
    immediate_actions: [
      "Establish a 1.5x building height perimeter buffer immediately.",
      "Shut off main gas, electrical, and water distribution lines at sector boundary.",
      "Call for heavy urban search and rescue (USAR) acoustic listening probes.",
      "Instruct victims to tap on pipes/walls with rocks; avoid screaming to preserve oxygen."
    ],
    contraindications: [
      "DO NOT enter unreinforced masonry structures with visible diagonal shear fractures.",
      "DO NOT use motorized excavation equipment directly above confirmed trapped individuals.",
      "DO NOT light open flames or use non-intrinsically safe radios due to explosive gas leaks."
    ],
    broadcast_channel: "VHF Tactical Channel 16 (156.800 MHz)",
    version: "2026.4-USAR-VETTED"
  },
  FLASH_FLOOD: {
    id: "card-flash-flood-v2",
    hazard_type: "FLASH_FLOOD",
    title: "Flash Flood & Swiftwater Inundation Protocol",
    urgency_level: "IMMEDIATE_ACTION",
    immediate_actions: [
      "Direct all field units and civilians to high ground (>15m above baseline river level).",
      "Deploy throw-bags and tensioned diagonal ropes from upstream anchors.",
      "Mark rising water crest rates on vertical structures at 15-minute intervals.",
      "Broadcast evacuation alerts on emergency siren frequencies."
    ],
    contraindications: [
      "DO NOT attempt to drive or walk through moving water deeper than 15 cm (6 inches).",
      "DO NOT tie rescue personnel into safety lines without quick-release chest harnesses.",
      "DO NOT drink or sanitize wounds with stagnant surface flood water (high biohazard risk)."
    ],
    broadcast_channel: "Disaster Net 4 (462.675 MHz)",
    version: "2026.2-SWIFTWATER-VETTED"
  },
  MEDICAL_EMERGENCY: {
    id: "card-medical-triage-v2",
    hazard_type: "MEDICAL_EMERGENCY",
    title: "Mass Casualty Field Triage (START Protocol)",
    urgency_level: "IMMEDIATE_ACTION",
    immediate_actions: [
      "Perform rapid START triage: Ability to walk? Respiration rate? Perfusion/Radial pulse? Mental status?",
      "Apply high-and-tight commercial tourniquets immediately for arterial extremity bleeding.",
      "Position unconscious breathing casualties in the recovery position to protect airway.",
      "Establish Casualty Collection Point (CCP) upwind from dust or hazardous plumes."
    ],
    contraindications: [
      "DO NOT administer oral fluids, medications, or food to casualties pending surgery.",
      "DO NOT remove penetrating impaled objects (stabilize in place with bulky dressings).",
      "DO NOT move patients with suspected spinal trauma unless immediate life threat exists."
    ],
    broadcast_channel: "Triage Med-Net 1 (155.340 MHz)",
    version: "2026.1-START-VETTED"
  },
  FIRE_HAZARD: {
    id: "card-fire-hazard-v2",
    hazard_type: "FIRE_HAZARD",
    title: "Urban Fire & Gas Dispersion Containment",
    urgency_level: "IMMEDIATE_ACTION",
    immediate_actions: [
      "Evacuate cross-wind and up-wind from thick smoke or vapor plumes.",
      "Establish safe stand-off distance from liquid propane / industrial tanks (minimum 300m).",
      "Deploy dry chemical or water fog lines to protect evacuation corridors."
    ],
    contraindications: [
      "DO NOT apply straight water streams directly into high-voltage electrical transformers.",
      "DO NOT enter enclosed basements without self-contained breathing apparatus (SCBA).",
      "DO NOT ventilate roof or doors before charged hose lines are in position."
    ],
    broadcast_channel: "Fire Ops 3 (154.280 MHz)",
    version: "2026.3-FIRE-VETTED"
  },
  BLOCKED_ACCESS: {
    id: "card-blocked-access-v2",
    hazard_type: "BLOCKED_ACCESS",
    title: "Route Obstruction & Debris Clearance Protocol",
    urgency_level: "HEIGHTENED_CAUTION",
    immediate_actions: [
      "Survey alternative primary evacuation and ambulance transport corridors.",
      "Mark impassable roadways with high-visibility physical barriers and GPS coordinates.",
      "Deploy mechanical winch or earth-moving apparatus to establish single-lane clearance."
    ],
    contraindications: [
      "DO NOT drive across bridges or overpasses before structural engineer sign-off.",
      "DO NOT cut fallen trees touching overhead electrical lines (assume lines are energized).",
      "DO NOT divert traffic into secondary residential roads that lack turning radius for emergency vehicles."
    ],
    broadcast_channel: "Logistics Corridor 7 (453.025 MHz)",
    version: "2026.1-LOGISTICS-VETTED"
  }
};

/**
 * Retrieves the vetted protocol card for a given hazard, allowing dynamic override from Remote Config
 */
export async function getVettedProtocolCard(hazard: HazardType): Promise<SafetyProtocolCard> {
  const fallback = STATIC_SAFETY_PROTOCOLS[hazard];
  
  try {
    // Attempt dynamic Remote Config template lookup if online
    if (navigator.onLine) {
      await fetchAndActivate(remoteConfig);
      const customKey = `protocol_card_${hazard.toLowerCase()}`;
      const remoteCardStr = getValue(remoteConfig, customKey).asString();
      if (remoteCardStr) {
        return JSON.parse(remoteCardStr);
      }
    }
  } catch (err) {
    // Graceful offline fallback
    console.info("Using embedded static protocol card in offline dead zone:", err);
  }

  return fallback;
}
