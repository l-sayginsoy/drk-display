export const fetchWeeklyProgram = async (): Promise<WeeklyProgram[]> => {
  try {
    const response = await fetch(`${GITHUB_FILES.wochenprogramm}?t=${Date.now()}`);
    if (!response.ok) return [];
    const text = await response.text();
    
    // Berechne die aktuelle Kalenderwoche (ISO-Standard)
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const year = d.getFullYear();
    const week = Math.ceil((((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + 1) / 7);
    const currentWeekKey = `${year}-W${week.toString().padStart(2, '0')}`;

    const lines = text.replace(/\r/g, '').trim().split('\n');
    
    // Filtere nur die Zeilen, die zur aktuellen Woche gehören
    return lines
      .filter(line => line.startsWith(currentWeekKey))
      .map(line => {
        const parts = line.split('|').map(s => s.trim());
        // parts = ID, parts = Tag, parts = Titel, parts = Ort, parts = Zeit
        return { 
          day: parts || '', 
          title: parts || '', 
          location: parts || '', 
          time: parts || '' 
        };
      });
  } catch {
    return [];
  }
};