export interface DisasterScenario {
  id: string;
  short_label: string;
  title: string;
  hazard_type: "STRUCTURAL_COLLAPSE" | "FLASH_FLOOD" | "BLOCKED_ACCESS";
  location: string;
  language: "English / Multilingual" | "French" | "Arabic / English";
  raw_text: string;
  image_url: string;
  image_alt: string;
  expected_severity: "CRITICAL" | "URGENT";
}

export const SAMPLE_DISASTER_SCENARIOS: DisasterScenario[] = [
  {
    id: "scenario-1-earthquake-collapse",
    short_label: "01 Collapse",
    title: "Residential Collapse with Entrapment",
    hazard_type: "STRUCTURAL_COLLAPSE",
    location: "Sector 4B — Downtown Residential Block",
    language: "English / Multilingual",
    raw_text: "URGENT: Three-story residential building partially collapsed at Sector 4B corner of Elm Street. At least 5 persons trapped under concrete beams on the 2nd floor, screaming for assistance. Strong odor of natural gas detected. Contact resident coordinator Dr. James Miller at +1-415-555-0199 or email jmiller@cityhealth.org. Passport ID: US83920194.",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='270' viewBox='0 0 480 270'><rect width='480' height='270' fill='%23ECECE7'/><g stroke='%23D6D6CE' stroke-width='1'><line x1='0' y1='54' x2='480' y2='54'/><line x1='0' y1='108' x2='480' y2='108'/><line x1='0' y1='162' x2='480' y2='162'/><line x1='0' y1='216' x2='480' y2='216'/><line x1='96' y1='0' x2='96' y2='270'/><line x1='192' y1='0' x2='192' y2='270'/><line x1='288' y1='0' x2='288' y2='270'/><line x1='384' y1='0' x2='384' y2='270'/></g><path d='M55 216 L120 72 L215 96 L248 188 L350 112 L425 216 Z' fill='%23DFDFD7' stroke='%2354575F' stroke-width='1.5'/><path d='M135 216 L205 128 L295 216' fill='none' stroke='%23C9331B' stroke-width='2' stroke-dasharray='4 3'/><circle cx='205' cy='158' r='6' fill='%23C9331B'/><text x='24' y='32' fill='%2354575F' font-size='11' font-family='monospace'>PLATE 01 // SECTOR 4B STRUCTURAL ELEVATION</text><text x='24' y='248' fill='%23C9331B' font-size='11' font-family='monospace'>SHEAR FRACTURE &amp; VOID POCKET DETECTED</text></svg>",
    image_alt: "Architectural damage schematic showing collapsed floor slabs in Sector 4B",
    expected_severity: "CRITICAL"
  },
  {
    id: "scenario-2-flash-flood",
    short_label: "02 Flash Flood",
    title: "Torrential Flash Flood & Bridge Cutoff",
    hazard_type: "FLASH_FLOOD",
    location: "North River Crossing — Pont du Nord",
    language: "French",
    raw_text: "Alerte inondation éclair ! Le pont principal du Nord est submergé par plus de 80 cm d'eau rapide. Deux véhicules bloqués au milieu avec 4 personnes dont 1 enfant blessé. Niveau d'eau monte à vue d'œil. Téléphone d'urgence du témoin : 06 44 21 89 02, contactez Mme Sophie Laurent (sophie.l@secours-france.fr), numéro national 29482019.",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='270' viewBox='0 0 480 270'><rect width='480' height='270' fill='%23ECECE7'/><g stroke='%23D6D6CE' stroke-width='1'><line x1='0' y1='54' x2='480' y2='54'/><line x1='0' y1='108' x2='480' y2='108'/><line x1='0' y1='162' x2='480' y2='162'/><line x1='0' y1='216' x2='480' y2='216'/><line x1='96' y1='0' x2='96' y2='270'/><line x1='192' y1='0' x2='192' y2='270'/><line x1='288' y1='0' x2='288' y2='270'/><line x1='384' y1='0' x2='384' y2='270'/></g><rect x='64' y='136' width='352' height='14' fill='%23C9C9C0' stroke='%2354575F' stroke-width='1.5'/><path d='M0 148 Q80 132 160 148 T320 148 T480 148 L480 270 L0 270 Z' fill='%23254EDB' fill-opacity='0.14' stroke='%23254EDB' stroke-width='1.5'/><path d='M0 176 Q80 164 160 176 T320 176 T480 176' fill='none' stroke='%23254EDB' stroke-width='1' stroke-dasharray='5 4'/><rect x='215' y='124' width='32' height='14' rx='2' fill='%23141517'/><text x='24' y='32' fill='%2354575F' font-size='11' font-family='monospace'>PLATE 02 // PONT DU NORD HYDROLOGY</text><text x='24' y='248' fill='%23254EDB' font-size='11' font-family='monospace'>DECK SUBMERSION +0.8M // SWIFT CURRENT</text></svg>",
    image_alt: "Hydrological profile showing submerged bridge deck and current flow",
    expected_severity: "CRITICAL"
  },
  {
    id: "scenario-3-mountain-rockslide",
    short_label: "03 Road Block",
    title: "Mountain Access Road Blockage & Landslide",
    hazard_type: "BLOCKED_ACCESS",
    location: "Sector Atlas-Highway K12 (Route de la Montagne)",
    language: "Arabic / English",
    raw_text: "Massive rockfall and landslide blocking both lanes at Highway K12 near Sector Atlas. Tariq maghluq bi-kamil (الطريق مغلق بالكامل). Multiple boulders over 3 meters wide. Ambulances cannot reach the eastern valley clinics. Witness contact: Omar Haddad, phone +212-612-984711, ID B109284.",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='270' viewBox='0 0 480 270'><rect width='480' height='270' fill='%23ECECE7'/><g stroke='%23D6D6CE' stroke-width='1'><line x1='0' y1='54' x2='480' y2='54'/><line x1='0' y1='108' x2='480' y2='108'/><line x1='0' y1='162' x2='480' y2='162'/><line x1='0' y1='216' x2='480' y2='216'/><line x1='96' y1='0' x2='96' y2='270'/><line x1='192' y1='0' x2='192' y2='270'/><line x1='288' y1='0' x2='288' y2='270'/><line x1='384' y1='0' x2='384' y2='270'/></g><path d='M30 216 L140 72 L250 182 L345 94 L450 216' fill='none' stroke='%2354575F' stroke-width='1.5'/><polygon points='165,216 218,148 278,162 308,216' fill='%23D4D4CB' stroke='%23B4690E' stroke-width='1.75'/><circle cx='236' cy='186' r='18' fill='none' stroke='%23B4690E' stroke-width='1.5' stroke-dasharray='3 3'/><text x='24' y='32' fill='%2354575F' font-size='11' font-family='monospace'>PLATE 03 // HIGHWAY K12 TOPOGRAPHIC</text><text x='24' y='248' fill='%23B4690E' font-size='11' font-family='monospace'>CORRIDOR SEVERED // 3M+ BOULDER DEBRIS</text></svg>",
    image_alt: "Topographic elevation showing rockslide blocking mountain highway K12",
    expected_severity: "URGENT"
  }
];
