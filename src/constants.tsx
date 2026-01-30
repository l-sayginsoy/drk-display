
import React from 'react';

export const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/l-sayginsoy/drk-display/main/';

export const GITHUB_FILES = {
  event: `${GITHUB_RAW_BASE}event.txt`,
  wochenprogramm: `${GITHUB_RAW_BASE}wochenprogramm.txt`,
  quotes: `${GITHUB_RAW_BASE}quotes.json`
};

export const MEAL_SCHEDULE = [
  { start: "00:00", end: "10:00", file: "Frühstück.jpg" },
  { start: "10:00", end: "14:00", file: "Mittagessen.jpg" },
  { start: "14:00", end: "16:30", file: "Nachmittagskaffee.jpg" },
  { start: "16:30", end: "23:59", file: "Abendessen.jpg" }
];

export const DEFAULT_MEAL_IMAGE = "Speiseplan.jpg";

// Eindeutige Sortierung nach deutschem Standard (MO-SO)
export const DAYS_ORDER = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];

// Define Icons used in StatsCard as React components
export const Icons = {
  Analytics: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  TrendUp: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  TrendDown: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
};

export const mapWeatherCode = (code: number): { condition: string; icon: string; theme: string } => {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return { condition: 'Sonnig', icon: '☀️', theme: 'sunny' };
  if (code <= 3) return { condition: 'Bewölkt', icon: '☁️', theme: 'cloudy' };
  if (code >= 45 && code <= 48) return { condition: 'Neblig', icon: '🌫️', theme: 'foggy' };
  if (code >= 51 && code <= 67 || code >= 80 && code <= 82) return { condition: 'Regen', icon: '🌧️', theme: 'rainy' };
  if (code >= 71 && code <= 77 || code === 85 || code === 86) return { condition: 'Schnee', icon: '❄️', theme: 'snowy' };
  if (code >= 95) return { condition: 'Gewitter', icon: '⛈️', theme: 'stormy' };
  return { condition: 'Heiter', icon: '⛅', theme: 'cloudy' };
};
