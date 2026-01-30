// constants.tsx

export const BASE = import.meta.env.BASE_URL

// Dateien liegen in public
export const LOGO_URL = `${BASE}DRK-Logo_lang_RGB.png`
export const SPEISEPLAN_URL = `${BASE}Speiseplan.jpg`

// Speiseplan Bilder, ohne Umlaute im Dateinamen
export type MealSlot = {
  start: string;
  end: string;
  file: string;
};

export const MEAL_SCHEDULE: MealSlot[] = [
  { start: "07:30", end: "08:30", file: `${BASE}fruehstueck.jpg` },
  { start: "11:15", end: "12:30", file: `${BASE}mittagessen.jpg` },
  { start: "14:15", end: "15:30", file: `${BASE}nachmittagskaffee.jpg` },
  { start: "17:15", end: "18:30", file: `${BASE}abendessen.jpg` }
];

export const DEFAULT_MEAL_IMAGE = `${BASE}speiseplan.jpg`;

/*
  Optionaler Bereich
  Falls App.tsx bei dir mapWeatherCode aus constants importiert,
  bleibt die App sonst stehen.
  Wenn du es nicht nutzt, kannst du diesen Block löschen.
*/

export function mapWeatherCode(code: number): string {
  // Minimaler Fallback. Du kannst es später erweitern.
  if (code === 0) return "Klar";
  if (code === 1 || code === 2) return "Wolkig";
  if (code === 3) return "Bedeckt";
  if (code >= 45 && code <= 48) return "Nebel";
  if (code >= 51 && code <= 57) return "Niesel";
  if (code >= 61 && code <= 67) return "Regen";
  if (code >= 71 && code <= 77) return "Schnee";
  if (code >= 80 && code <= 82) return "Schauer";
  if (code >= 95) return "Gewitter";
  return "Unbekannt";
}