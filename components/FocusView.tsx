import React, { useState, useEffect } from 'react';
import { AppData, Meal } from '../types';

interface FocusViewProps {
  appData: AppData;
}

const FocusView: React.FC<FocusViewProps> = ({ appData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();

  // Mahlzeiten-Logik repariert
  const getCurrentMeal = (): Meal | undefined => {
    if (hours >= 6 && hours < 10) return appData.meals.find(m => m.type === 'breakfast');
    if (hours >= 11 && hours < 14) return appData.meals.find(m => m.type === 'lunch');
    if (hours >= 17 && hours < 21) return appData.meals.find(m => m.type === 'dinner');
    return undefined;
  };

  const activeMeal = getCurrentMeal();

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
      
      {/* 1. DAS LOGO (Immer sichtbar, oben fixiert) */}
      <div className="absolute top-8 left-8 z-[60] bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
        <img src="/logo.png" alt="Logo" className="h-20 w-auto object-contain" />
      </div>

      {/* 2. EILMELDUNG (Höchste Priorität) */}
      {appData.urgentMessage.active ? (
        <div className="absolute inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center p-10 text-center animate-pulse">
          <h1 className="text-8xl font-black text-white mb-8 tracking-tighter">EILMELDUNG</h1>
          <div className="h-2 w-1/2 bg-white mb-8"></div>
          <p className="text-6xl font-bold text-white leading-tight">
            {appData.urgentMessage.content}
          </p>
        </div>
      ) : null}

      {/* 3. SPEISEPLAN (Zweite Priorität) */}
      {!appData.urgentMessage.active && activeMeal ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-black">
          <h2 className="text-5xl font-bold text-orange-500 mb-6 uppercase tracking-widest">
            {activeMeal.type === 'breakfast' ? 'Frühstück' : activeMeal.type === 'lunch' ? 'Mittagessen' : 'Abendessen'}
          </h2>
          <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,165,0,0.2)] border-4 border-orange-500/30">
            <img 
              src={activeMeal.image} 
              alt="Speiseplan" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : null}

      {/* 4. SLIDESHOW (Erscheint nur, wenn keine Eilmeldung und keine Mahlzeit-Zeit ist) */}
      {!appData.urgentMessage.active && !activeMeal && (
        <div className="absolute inset-0 z-0">
          {/* Hier wird deine Slideshow-Komponente gerendert */}
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
             <p className="text-3xl text-gray-500">Slideshow aktiv...</p>
             {/* <Slideshow images={appData.slideshow.images} /> */}
          </div>
        </div>
      )}

      {/* 5. UHRZEIT UNTEN RECHTS */}
      <div className="absolute bottom-8 right-8 z-[60] text-right">
        <p className="text-6xl font-mono font-bold text-white drop-shadow-lg">
          {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default FocusView;