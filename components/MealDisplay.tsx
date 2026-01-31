
import React from 'react';
import { EventOverride } from '../types';
import { MEAL_SCHEDULE, DEFAULT_MEAL_IMAGE, GITHUB_RAW_BASE } from '../constants';

const MealDisplay: React.FC<{ override: EventOverride | null }> = ({ override }) => {
  const getCurrentMealImage = () => {
    if (override?.active && override.image) return override.image;

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const schedule = MEAL_SCHEDULE.find(s => timeStr >= s.start && timeStr <= s.end);
    return schedule ? schedule.file : DEFAULT_MEAL_IMAGE;
  };

  const imageFile = getCurrentMealImage();
  const imageUrl = imageFile.startsWith('http') ? imageFile : `${GITHUB_RAW_BASE}${imageFile}`;
  const fallbackUrl = `${GITHUB_RAW_BASE}${DEFAULT_MEAL_IMAGE}`;

  return (
    <div className="h-full w-full rounded-[3vh] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.2)] bg-slate-900 border border-white/10 relative">
      <img 
        src={imageUrl} 
        alt="Aktueller Plan" 
        className="h-full w-full object-cover transition-opacity duration-1000"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          if (img.src !== fallbackUrl) {
            img.src = fallbackUrl;
          } else {
            img.src = "https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1000&auto=format&fit=crop";
          }
        }}
      />
      
      {override?.active && (
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          <span className="text-[1.2vh] font-black text-white uppercase tracking-[0.2em]">Sonderplan Aktiv</span>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
    </div>
  );
};

export default MealDisplay;
