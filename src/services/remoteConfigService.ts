import { getValue, fetchAndActivate } from "firebase/remote-config";
import { remoteConfig } from "../lib/firebase";
import type { HazardType, SafetyProtocolCard } from "../types/triage";

// Static vetted emergency protocol cards aligned with FEMA CERT, USAR, NWS, Red Cross, and OSHA standards
export const STATIC_SAFETY_PROTOCOLS: Record<HazardType, SafetyProtocolCard> = {
  STRUCTURAL_COLLAPSE: {
    id: "card-struct-collapse-v3",
    hazard_type: "STRUCTURAL_COLLAPSE",
    title: "FEMA USAR Structural Collapse Protocol",
    urgency_level: "IMMEDIATE_ACTION",
    immediate_actions: [
      "Call or text 911 when cell service permits; if voice circuits are congested, send SMS or relay via CERT net.",
      "Mark building exterior with FEMA X-code triage notation and await 911 / USAR heavy extraction.",
      "Shut off main gas valve at the meter only if natural gas odor or hiss is detected; establish perimeter."
    ],
    contraindications: [
      "DO NOT enter unstable or pancake-collapsed structures with diagonal shear cracks.",
      "DO NOT ignite open flames, operate sparks, or key non-intrinsically safe radios near gas leaks."
    ],
    broadcast_channel: "911 / CERT Tactical Ch. 4 (462.675 MHz)",
    version: "FEMA-USAR-2026.4"
  },
  FLASH_FLOOD: {
    id: "card-flash-flood-v3",
    hazard_type: "FLASH_FLOOD",
    title: "NWS Swiftwater & Flash Flood Protocol",
    urgency_level: "IMMEDIATE_ACTION",
    immediate_actions: [
      "Call or text 911 / Coast Guard immediately; if circuits are busy, relay coordinates over CERT radio net.",
      "Move stranded individuals to highest structural floor or roof access with visible high-contrast signaling.",
      "Monitor rising creek or drainage crest levels at 15-minute intervals from high ground."
    ],
    contraindications: [
      "Turn Around, Don't Drown: NEVER walk or drive through moving floodwater deeper than 6 inches.",
      "DO NOT enter swiftwater currents without Coast Guard / swiftwater PFD and quick-release tethers."
    ],
    broadcast_channel: "911 / Swiftwater Ops Ch. 9 (156.450 MHz)",
    version: "NWS-CERT-2026.2"
  },
  MEDICAL_EMERGENCY: {
    id: "card-medical-triage-v3",
    hazard_type: "MEDICAL_EMERGENCY",
    title: "Red Cross / Stop the Bleed Triage Protocol",
    urgency_level: "IMMEDIATE_ACTION",
    immediate_actions: [
      "Call 911 immediately; use SMS text-to-911 or CERT net relay if cellular voice circuits are busy.",
      "Apply direct firm pressure with clean cloth; apply tourniquet 2–3 inches above severe limb bleed.",
      "Perform rapid START triage (Respirations, Perfusion, Mental Status) and stage at upwind Collection Point."
    ],
    contraindications: [
      "DO NOT move victims with suspected spinal or neck trauma unless immediate life threat exists.",
      "DO NOT remove impaled objects or give oral fluids to casualties pending emergency transport."
    ],
    broadcast_channel: "EMS Dispatch Net 1 (155.340 MHz)",
    version: "CERT-START-2026.1"
  },
  FIRE_HAZARD: {
    id: "card-fire-hazard-v3",
    hazard_type: "FIRE_HAZARD",
    title: "Fire & Hazmat Stand-Off Containment",
    urgency_level: "IMMEDIATE_ACTION",
    immediate_actions: [
      "Call or text 911 immediately; relay wind direction and smoke plume vector to County EOC dispatch.",
      "Evacuate civilians cross-wind and upwind at least 1,000 feet from pressurized fuel or propane tanks.",
      "Keep access corridors clear for arriving Fire and Hazmat apparatus."
    ],
    contraindications: [
      "DO NOT drive through dense wildfire smoke or attempt to cross active fire lines.",
      "DO NOT apply water streams to energized electrical equipment or unknown chemical plumes."
    ],
    broadcast_channel: "Fire Tactical Ch. 3 (154.280 MHz)",
    version: "OSHA-FIRE-2026.3"
  },
  BLOCKED_ACCESS: {
    id: "card-blocked-access-v3",
    hazard_type: "BLOCKED_ACCESS",
    title: "OSHA / FEMA Downed Lines & Route Protocol",
    urgency_level: "HEIGHTENED_CAUTION",
    immediate_actions: [
      "Call 911 and local utility dispatch immediately; relay milepost and blocked ambulance routes via CERT net.",
      "Establish high-visibility perimeter at least 35 feet from downed power lines and mudslide debris.",
      "Reroute EMS and ambulance transport via cleared alternate state DOT / county arterial corridors."
    ],
    contraindications: [
      "DO NOT approach within 35 feet of downed power lines—assume all overhead and ground lines are energized.",
      "DO NOT attempt to clear mudslide boulders or trees entangled with utility lines without utility lockout."
    ],
    broadcast_channel: "DOT / Utility Ops Ch. 7 (453.025 MHz)",
    version: "OSHA-FEMA-2026.2"
  }
};

/**
 * Retrieves the vetted protocol card for a given hazard, allowing dynamic override from Remote Config
 */
export async function getVettedProtocolCard(hazard: HazardType): Promise<SafetyProtocolCard> {
  const fallback = STATIC_SAFETY_PROTOCOLS[hazard];

  try {
    if (navigator.onLine) {
      await fetchAndActivate(remoteConfig);
      const customKey = `protocol_card_${hazard.toLowerCase()}`;
      const remoteCardStr = getValue(remoteConfig, customKey).asString();
      if (remoteCardStr) {
        return JSON.parse(remoteCardStr);
      }
    }
  } catch (err) {
    console.info("Using embedded static protocol card in offline dead zone:", err);
  }

  return fallback;
}
