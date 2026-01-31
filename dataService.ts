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
    console.log('🔄 Loading weekly program from GitHub...');
    const response = await fetch(`${GITHUB_FILES.wochenprogramm}?t=${Date.now()}`);
    if (!response.ok) return [];
    const text = await response.text();
    console.log('📄 Raw GitHub content:', text);
    
    const lines = text.replace(/\r/g, '').trim().split('\n').filter(line => line.includes('|'));
    console.log('📋 Filtered lines:', lines);
    
    // Get current week info for filtering
    const now = new Date();
    const currentYear = now.getFullYear();
    const getWeekNumber = (d: Date) => {
      const target = new Date(d.valueOf());
      const dayNr = (d.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
      }
      return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    };
    const currentWeek = getWeekNumber(now);
    const currentWeekKey = `${currentYear}-W${String(currentWeek).padStart(2, '0')}`;
    
    console.log('📅 Current week:', currentWeekKey);
    
    const programs: WeeklyProgram[] = [];
    const weekSpecificPrograms: Record<string, WeeklyProgram> = {};
    
    lines.forEach(line => {
      const parts = line.split('|').map(s => s.trim());
      console.log('🔍 Processing line parts:', parts);
      
      if (parts.length >= 4) {
        // Check if it's a week-specific entry (format: 2026-W05|MO|Title|Location|Time)
        if (parts.match(/\d{4}-W\d{2}/)) {
          const [weekKey, day, title, location, time] = parts;
          console.log('📆 Found week-specific entry:', { weekKey, day, title, location, time });
          
          // Only use current week's data
          if (weekKey === currentWeekKey) {
            weekSpecificPrograms[day] = { 
              day, 
              title: title === '-' ? '' : title, 
              location: location === '-' ? '' : location, 
              time: time === '-' ? '' : time 
            };
            console.log('✅ Added current week entry:', weekSpecificPrograms[day]);
          }
        } else {
          // Standard entry (format: MO|Title|Location|Time)
          const [day, title, location, time] = parts;
          console.log('📋 Found standard entry:', { day, title, location, time });
          programs.push({ 
            day, 
            title: title || '', 
            location: location || '', 
            time: time || '' 
          });
        }
      }
    });
    
    // Prioritize week-specific entries over standard entries
    const finalPrograms: WeeklyProgram[] = [];
    const DAYS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];
    
    DAYS.forEach(day => {
      if (weekSpecificPrograms[day]) {
        // Use week-specific entry
        finalPrograms.push(weekSpecificPrograms[day]);
        console.log(`📌 Using week-specific entry for ${day}:`, weekSpecificPrograms[day]);
      } else {
        // Fall back to standard entry for this day
        const standardEntry = programs.find(p => p.day === day);
        if (standardEntry) {
          finalPrograms.push(standardEntry);
          console.log(`📌 Using standard entry for ${day}:`, standardEntry);
        }
      }
    });
    
    console.log('🎯 Final programs for display:', finalPrograms);
    return finalPrograms;
  } catch (error) {
    console.error('❌ Error loading weekly program:', error);
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
      .replace(/ÃƒÂ¤/g, 'ä').replace(/ÃƒÂ¶/g, 'ö').replace(/ÃƒÂ¼/g, 'ü')
      .replace(/ÃƒÅ¸/g, 'ß').replace(/Ãƒ"/g, 'Ä').replace(/Ãƒâ€"/g, 'Ö').replace(/ÃƒÅ"/g, 'Ü');
  } catch {
    return fallback;
  }
};