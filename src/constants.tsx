export const BASE = import.meta.env.BASE_URL;

export const LOGO_URL = `${BASE}DRK-Logo_lang_RGB.png`;
export const SPEISEPLAN_URL = `${BASE}Speiseplan.jpg`;

export const DAYS_ORDER = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"] as const;

export const GITHUB_FILES = {
  event: "event.json",
  wochenprogramm: "wochenprogramm.txt",
  quotes: "quotes.json",
  metadata: "metadata.json"
} as const;

export function mapWeatherCode(code: number): { icon: string; condition: string } {
  const mappings: Record<number, { icon: string; condition: string }> = {
    0: { icon: "☀️", condition: "Klar" },
    1: { icon: "🌤️", condition: "Überwiegend klar" },
    2: { icon: "⛅", condition: "Teilweise bewölkt" },
    3: { icon: "☁️", condition: "Bewölkt" },
    45: { icon: "🌫️", condition: "Nebel" },
    48: { icon: "🌫️", condition: "Nebel" },
    51: { icon: "🌦️", condition: "Nieselregen" },
    53: { icon: "🌦️", condition: "Nieselregen" },
    55: { icon: "🌦️", condition: "Nieselregen" },
    61: { icon: "🌧️", condition: "Regen" },
    63: { icon: "🌧️", condition: "Regen" },
    65: { icon: "🌧️", condition: "Starker Regen" },
    71: { icon: "🌨️", condition: "Schnee" },
    73: { icon: "🌨️", condition: "Schnee" },
    75: { icon: "🌨️", condition: "Starker Schnee" },
    80: { icon: "🌦️", condition: "Schauer" },
    81: { icon: "🌦️", condition: "Schauer" },
    82: { icon: "⛈️", condition: "Starke Schauer" },
    95: { icon: "⛈️", condition: "Gewitter" },
    96: { icon: "⛈️", condition: "Gewitter" },
    99: { icon: "⛈️", condition: "Gewitter" }
  };

  return mappings[code] || { icon: "❓", condition: "Unbekannt" };
}
