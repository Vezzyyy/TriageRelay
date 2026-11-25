export interface DisasterScenario {
  id: string;
  short_label: string;
  title: string;
  hazard_type: "STRUCTURAL_COLLAPSE" | "FLASH_FLOOD" | "BLOCKED_ACCESS";
  location: string;
  raw_text: string;
  image_url: string;
  image_alt: string;
}

export const SAMPLE_DISASTER_SCENARIOS: DisasterScenario[] = [
  {
    id: "scenario-1-earthquake-collapse",
    short_label: "01 Collapse",
    title: "Residential Pancake Collapse",
    hazard_type: "STRUCTURAL_COLLAPSE",
    location: "Pasadena, CA — I-210 Corridor",
    raw_text: "Partial pancake collapse at Oakridge Apartments, 412 Elm St, Pasadena, CA. Resident Marcus Vance (626-555-0194, SSN 482-91-7304) and 2 children trapped on 2nd floor; gas smell reported.",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='270' viewBox='0 0 480 270'><rect width='480' height='270' fill='%23ECECE7'/><g stroke='%23D6D6CE' stroke-width='1'><line x1='0' y1='54' x2='480' y2='54'/><line x1='0' y1='108' x2='480' y2='108'/><line x1='0' y1='162' x2='480' y2='162'/><line x1='0' y1='216' x2='480' y2='216'/><line x1='96' y1='0' x2='96' y2='270'/><line x1='192' y1='0' x2='192' y2='270'/><line x1='288' y1='0' x2='288' y2='270'/><line x1='384' y1='0' x2='384' y2='270'/></g><path d='M55 216 L120 72 L215 96 L248 188 L350 112 L425 216 Z' fill='%23DFDFD7' stroke='%2354575F' stroke-width='1.5'/><path d='M135 216 L205 128 L295 216' fill='none' stroke='%23C9331B' stroke-width='2' stroke-dasharray='4 3'/><circle cx='205' cy='158' r='6' fill='%23C9331B'/><text x='24' y='32' fill='%2354575F' font-size='11' font-family='monospace'>PLATE 01 // STRUCTURAL ELEVATION</text><text x='24' y='248' fill='%23C9331B' font-size='11' font-family='monospace'>SEC-LA-04 %E2%80%A2 I-210 Corridor / Pasadena</text></svg>",
    image_alt: "Structural collapse elevation schematic for SEC-LA-04 Pasadena"
  },
  {
    id: "scenario-2-flash-flood",
    short_label: "02 Flash Flood",
    title: "Flash Flood & Stranded Vehicle",
    hazard_type: "FLASH_FLOOD",
    location: "Houston, TX — I-10 / Cypress Creek",
    raw_text: "Highway I-10 access bridge submerged near Cypress Creek, Houston, TX. 4 people stranded on SUV roof; Elena Gomez (713-555-0148) has deep laceration. 911 circuits busy.",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='270' viewBox='0 0 480 270'><rect width='480' height='270' fill='%23ECECE7'/><g stroke='%23D6D6CE' stroke-width='1'><line x1='0' y1='54' x2='480' y2='54'/><line x1='0' y1='108' x2='480' y2='108'/><line x1='0' y1='162' x2='480' y2='162'/><line x1='0' y1='216' x2='480' y2='216'/><line x1='96' y1='0' x2='96' y2='270'/><line x1='192' y1='0' x2='192' y2='270'/><line x1='288' y1='0' x2='288' y2='270'/><line x1='384' y1='0' x2='384' y2='270'/></g><rect x='64' y='136' width='352' height='14' fill='%23C9C9C0' stroke='%2354575F' stroke-width='1.5'/><path d='M0 148 Q80 132 160 148 T320 148 T480 148 L480 270 L0 270 Z' fill='%23254EDB' fill-opacity='0.14' stroke='%23254EDB' stroke-width='1.5'/><path d='M0 176 Q80 164 160 176 T320 176 T480 176' fill='none' stroke='%23254EDB' stroke-width='1' stroke-dasharray='5 4'/><rect x='215' y='124' width='32' height='14' rx='2' fill='%23141517'/><text x='24' y='32' fill='%2354575F' font-size='11' font-family='monospace'>PLATE 02 // HYDROLOGICAL PROFILE</text><text x='24' y='248' fill='%23254EDB' font-size='11' font-family='monospace'>SEC-HOU-09 %E2%80%A2 I-10 / Cypress Creek</text></svg>",
    image_alt: "Hydrological profile showing submerged bridge deck for SEC-HOU-09 Houston"
  },
  {
    id: "scenario-3-mountain-rockslide",
    short_label: "03 Route Block",
    title: "Downed Lines & Highway Mudslide",
    hazard_type: "BLOCKED_ACCESS",
    location: "Eureka, CA — US-101 MP-42",
    raw_text: "Downed high-voltage power lines and mudslide blocking US-101 Milepost 42 near Eureka, CA. Local clinic ambulance cut off; contact nurse David Miller at 707-555-0182.",
    image_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='270' viewBox='0 0 480 270'><rect width='480' height='270' fill='%23ECECE7'/><g stroke='%23D6D6CE' stroke-width='1'><line x1='0' y1='54' x2='480' y2='54'/><line x1='0' y1='108' x2='480' y2='108'/><line x1='0' y1='162' x2='480' y2='162'/><line x1='0' y1='216' x2='480' y2='216'/><line x1='96' y1='0' x2='96' y2='270'/><line x1='192' y1='0' x2='192' y2='270'/><line x1='288' y1='0' x2='288' y2='270'/><line x1='384' y1='0' x2='384' y2='270'/></g><path d='M30 216 L140 72 L250 182 L345 94 L450 216' fill='none' stroke='%2354575F' stroke-width='1.5'/><polygon points='165,216 218,148 278,162 308,216' fill='%23D4D4CB' stroke='%23B4690E' stroke-width='1.75'/><circle cx='236' cy='186' r='18' fill='none' stroke='%23B4690E' stroke-width='1.5' stroke-dasharray='3 3'/><text x='24' y='32' fill='%2354575F' font-size='11' font-family='monospace'>PLATE 03 // TOPOGRAPHIC CORRIDOR</text><text x='24' y='248' fill='%23B4690E' font-size='11' font-family='monospace'>SEC-HUM-02 %E2%80%A2 US-101 MP-42</text></svg>",
    image_alt: "Topographic corridor elevation showing blocked highway US-101 MP-42"
  }
];
