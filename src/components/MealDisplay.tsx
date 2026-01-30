import React from 'react';
import { EventOverride } from '../types';
import { MEAL_SCHEDULE, DEFAULT_MEAL_IMAGE, GITHUB_RAW_BASE } from '../constants';

const MealDisplay: React.FC<{ override: EventOverride | null }> = ({ override }) => {
  const getCurrentMealImage = () => {
    if (override?.active && override.image) return override.image;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes; // z.B. 11:15 -> 1115

    const schedule = MEAL_SCHEDULE.find(s => {
      const [startH, startM] = s.start.split(':').map(Number);
      const [endH, endM] = s.end.split(':').map(Number);
      const startTime = startH * 100 + startM;
      const endTime = endH * 100 + endM;
      return currentTime >= startTime && currentTime <= endTime;
    });

    return schedule ? schedule.file : DEFAULT_MEAL_IMAGE;
  };

  const imageFile = getCurrentMealImage();
  const imageUrl = imageFile.startsWith('http') ? imageFile : `/${imageFile}`;
  const fallbackUrl = `/${DEFAULT_MEAL_IMAGE}`;

  return (
    <div className="h-full w-full rounded-[3vh] overflow-hidden shadow-2xl bg-slate-900 border border-white/10 relative">
      <img 
        key={imageUrl}
        src={imageUrl} 
        alt="Speiseplan" 
        className="h-full w-full object-cover transition-opacity duration-500"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          if (!img.src.includes(fallbackUrl)) {
            img.src = fallbackUrl;
          }
        }}
      />
      {override?.active && (
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[1.2vh] font-black text-white uppercase tracking-widest">Sonderplan Aktiv</span>
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
    </div>
  );
};

export default MealDisplay;