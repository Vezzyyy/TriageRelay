export interface DisasterScenario {
  id: string;
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
    title: "Scenario 1: Residential Collapse with Entrapment",
    hazard_type: "STRUCTURAL_COLLAPSE",
    location: "Sector 4B — Downtown Residential Block",
    language: "English / Multilingual",
    raw_text: "URGENT: Three-story residential building partially collapsed at Sector 4B corner of Elm Street. At least 5 persons trapped under concrete beams on the 2nd floor, screaming for assistance. Strong odor of natural gas detected. Contact resident coordinator Dr. James Miller at +1-415-555-0199 or email jmiller@cityhealth.org. Passport ID: US83920194.",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'><rect width='400' height='260' fill='%231e293b'/><path d='M40 220 L160 80 L240 180 L360 40 L380 220 Z' fill='%23475569'/><path d='M100 220 L180 120 L260 220 Z' fill='%23ef4444' opacity='0.7'/><text x='200' y='240' fill='%23f87171' font-size='14' text-anchor='middle' font-family='monospace'>CRITICAL DAMAGE: STRUCTURAL FAILURE SECTOR 4B</text></svg>",
    image_alt: "Collapsed concrete floor slabs with visible reinforcement rebars in Sector 4B",
    expected_severity: "CRITICAL"
  },
  {
    id: "scenario-2-flash-flood",
    title: "Scenario 2: Torrential Flash Flood & Bridge Cutoff",
    hazard_type: "FLASH_FLOOD",
    location: "North River Crossing — Pont du Nord",
    language: "French",
    raw_text: "Alerte inondation éclair ! Le pont principal du Nord est submergé par plus de 80 cm d'eau rapide. Deux véhicules bloqués au milieu avec 4 personnes dont 1 enfant blessé. Niveau d'eau monte à vue d'œil. Téléphone d'urgence du témoin : 06 44 21 89 02, contactez Mme Sophie Laurent (sophie.l@secours-france.fr), numéro national 29482019.",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'><rect width='400' height='260' fill='%230f172a'/><path d='M0 160 Q100 120 200 170 T400 150 L400 260 L0 260 Z' fill='%230284c7'/><path d='M60 140 L340 140 L340 160 L60 160 Z' fill='%2364748b'/><text x='200' y='230' fill='%2338bdf8' font-size='14' text-anchor='middle' font-family='monospace'>RAPID SWIFTWATER INUNDATION: RIVER CREST +2.4M</text></svg>",
    image_alt: "Submerged bridge deck with fast-moving muddy torrent",
    expected_severity: "CRITICAL"
  },
  {
    id: "scenario-3-mountain-rockslide",
    title: "Scenario 3: Mountain Access Road Blockage & Landslide",
    hazard_type: "BLOCKED_ACCESS",
    location: "Sector Atlas-Highway K12 (Route de la Montagne)",
    language: "Arabic / English",
    raw_text: "Massive rockfall and landslide blocking both lanes at Highway K12 near Sector Atlas. Tariq maghluq bi-kamil (الطريق مغلق بالكامل). Multiple boulders over 3 meters wide. Ambulances cannot reach the eastern valley clinics. Witness contact: Omar Haddad, phone +212-612-984711, ID B109284.",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'><rect width='400' height='260' fill='%231c1917'/><polygon points='20,240 120,60 220,240' fill='%2378716c'/><polygon points='180,240 280,100 380,240' fill='%2357534e'/><circle cx='180' cy='190' r='35' fill='%23eab308'/><text x='200' y='245' fill='%23facc15' font-size='14' text-anchor='middle' font-family='monospace'>ROAD SEVERED: SECTOR ATLAS HIGHWAY K12</text></svg>",
    image_alt: "Boulders and debris cutting off two-lane mountain highway",
    expected_severity: "URGENT"
  }
];
