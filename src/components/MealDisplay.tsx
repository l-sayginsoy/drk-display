import React from 'react';
import { EventOverride } from '../types';
import { MEAL_SCHEDULE, DEFAULT_MEAL_IMAGE, GITHUB_RAW_BASE } from '../constants';

const MealDisplay: React.FC<{ override: EventOverride | null }> = ({ override }) => {
  const getCurrentMealImage = () => {
    if (override?.active && override.image) return override.image;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    const schedule = MEAL_SCHEDULE.find(s => timeStr >= s.start && timeStr <= s.end);
    return schedule ? schedule.file : DEFAULT_MEAL_IMAGE;
  };

  const imageFile = getCurrentMealImage();
  
  let imageUrl: string;
  if (imageFile.startsWith('http')) {
    imageUrl = imageFile;
  } else if (override?.active && override.image === imageFile) {
    imageUrl = `${GITHUB_RAW_BASE}${imageFile}`;
  } else {
    // encodeURI sorgt dafür, dass Umlaute wie 'ü' korrekt in URLs umgewandelt werden
    imageUrl = `/${encodeURI(imageFile)}`;
  }

  const fallbackUrl = `/${encodeURI(DEFAULT_MEAL_IMAGE)}`;

  return (
    <div className="h-full w-full rounded-[3vh] overflow-hidden shadow-2xl bg-slate-900 border border-white/10 relative">
      <img 
        key={imageUrl}
        src={imageUrl} 
        alt="Speiseplan" 
        className="h-full w-full object-cover transition-opacity duration-1000"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          if (!img.src.includes(encodeURI(DEFAULT_MEAL_IMAGE))) {
            img.src = fallbackUrl;
          }
        }}
      />
      {override?.active && (
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          <span className="text-[1.2vh] font-black text-white uppercase tracking-widest">Sonderplan Aktiv</span>
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
    </div>
  );
};

export default MealDisplay;