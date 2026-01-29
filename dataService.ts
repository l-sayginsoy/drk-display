
import { GITHUB_FILES } from './constants';
import { EventOverride, WeeklyProgram } from './types';

export const fetchEventOverride = async (): Promise<EventOverride | null> => {
  try {
    const response = await fetch(`${GITHUB_FILES.event}?t=${Date.now()}`);
    if (!response.ok) return null;
    const text = await response.text();
    const lines = text.replace(/\r/g, '').trim().split('\n');
    const data: Record<string, string> = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        data[key.trim().toLowerCase()] = valueParts.join(':').trim();
      }
    });

    if (data.aktiv === 'ja') {
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
    const lines = text.replace(/\r/g, '').trim().split('\n').filter(line => line.includes('|'));
    
    return lines.map(line => {
      const parts = line.split('|').map(s => s.trim());
      return { 
        day: parts[0] || '', 
        title: parts[1] || '', 
        location: parts[2] || '', 
        time: parts[3] || '' 
      };
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
    const data = await response.json();
    
    let quotes = [];
    if (Array.isArray(data)) quotes = data;
    else if (data.quotes && Array.isArray(data.quotes)) quotes = data.quotes;
    else return fallback;

    if (quotes.length === 0) return fallback;

    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const item = quotes[dayOfYear % quotes.length];
    
    const text = typeof item === 'string' ? item : (item.quote || fallback);

    return text
      .replace(/Ã¤/g, 'ä').replace(/Ã¶/g, 'ö').replace(/Ã¼/g, 'ü')
      .replace(/ÃŸ/g, 'ß').replace(/Ã"/g, 'Ä').replace(/Ã–/g, 'Ö').replace(/Ãœ/g, 'Ü');
  } catch {
    return fallback;
  }
};
