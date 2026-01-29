
import { GITHUB_FILES } from './constants';
import { EventOverride, WeeklyProgram } from './types';

export const fetchEventOverride = async (): Promise<EventOverride | null> => {
  try {
    const response = await fetch(`${GITHUB_FILES.event}?t=${Date.now()}`);
    if (!response.ok) return null;
    const text = await response.text();
    const lines = text.trim().split('\n');
    const data: Record<string, string> = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        data[key.trim()] = valueParts.join(':').trim();
      }
    });

    if (data.aktiv?.toLowerCase() === 'ja') {
      return {
        active: true,
        image: data.bild || null,
        start: data.start || null,
        end: data.ende || null
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchWeeklyProgram = async (): Promise<WeeklyProgram[]> => {
  try {
    const response = await fetch(`${GITHUB_FILES.wochenprogramm}?t=${Date.now()}`);
    if (!response.ok) return [];
    const text = await response.text();
    const lines = text.trim().split('\n');
    return lines.map(line => {
      const [day, title, location, time] = line.split('|');
      return { day: day || '', title: title || '', location: location || '', time: time || '' };
    });
  } catch {
    return [];
  }
};

export const fetchQuote = async (): Promise<string> => {
  const fallback = "Willkommen im DRK Melm.";
  try {
    const response = await fetch(`${GITHUB_FILES.quotes}?t=${Date.now()}`);
    if (!response.ok) return fallback;
    const quotes = await response.json();
    
    // Falls das JSON kein Array ist, sondern ein Objekt oder String
    if (!Array.isArray(quotes)) {
       return typeof quotes === 'string' ? quotes : fallback;
    }

    if (quotes.length === 0) return fallback;

    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const rawQuote = quotes[dayOfYear % quotes.length];
    
    const finalQuote = typeof rawQuote === 'string' ? rawQuote : fallback;

    return finalQuote
      .replace(/Ã¤/g, 'ä')
      .replace(/Ã¶/g, 'ö')
      .replace(/Ã¼/g, 'ü')
      .replace(/ÃŸ/g, 'ß')
      .replace(/Ã"/g, 'Ä')
      .replace(/Ã–/g, 'Ö')
      .replace(/Ãœ/g, 'Ü');
  } catch (err) {
    console.error("Quote fetch error", err);
    return fallback;
  }
};
