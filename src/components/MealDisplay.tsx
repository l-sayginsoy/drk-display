import React from 'react';
import { EventOverride } from '../types';
import { MEAL_SCHEDULE, DEFAULT_MEAL_IMAGE, GITHUB_RAW_BASE } from '../constants';

const MealDisplay: React.FC<{ override: EventOverride | null }> = ({ override }) => {
  
  // Hilfsfunktion für absolute Pfade aus dem public-Ordner (erkennt Umlaute)
  const getAssetUrl = (file: string) => {
    try {
      // Nutzt die Browser-URL API, um den Pfad absolut zu bauen
      const baseUrl = window.location.origin;
      const cleanPath = file.startsWith('/') ? file : `/${file}`;
      // encodeURI sorgt dafür, dass 'ü' zu '%C3%BC' wird, was Server verstehen
      return new URL(encodeURI(cleanPath), baseUrl).href;
    } catch (e) {
      return `/${file}`;
    }
  };

  const getCurrentMealImage = () => {
    // 1. Priorität: Manueller Sonderplan (Event)
    if (override?.active && override.image) return override.image;

    // 2. Priorität: Zeitbasierter Speiseplan
    const now = new Date();
    const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    const schedule = MEAL_SCHEDULE.find(s => timeStr >= s.start && timeStr <= s.end);
    return schedule ? schedule.file : DEFAULT_MEAL_IMAGE;
  };

  const imageFile = getCurrentMealImage();
  
  // Bestimmung der finalen URL
  let imageUrl: string;

  if (imageFile.startsWith('http')) {
    // Externe Links direkt nutzen
    imageUrl = imageFile;
  } else if (override?.active && override.image === imageFile) {
    // Event-Bilder von GitHub laden
    imageUrl = `${GITHUB_RAW_BASE}${imageFile}`;
  } else {
    // Standard-Bilder aus dem lokalen 'public' Ordner laden
    imageUrl = getAssetUrl(imageFile);
  }

  const fallbackUrl = getAssetUrl(DEFAULT_MEAL_IMAGE);

  return (
    <div className="h-full w-full rounded-[3vh] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] bg-slate-900 border border-white/10 relative">
      <img 
        key={imageUrl} // Verhindert Flackern und erzwingt sauberes Neuladen
        src={imageUrl} 
        alt="Aktueller Speiseplan" 
        className="h-full w-full object-cover transition-opacity duration-1000"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          console.error("Bildfehler bei:", img.src);
          // Falls das Bild (z.B. Frühstück.jpg) fehlt, zeige den allgemeinen Speiseplan
          if (!img.src.includes(encodeURI(DEFAULT_MEAL_IMAGE))) {
            img.src = fallbackUrl;
          }
        }}
      />
      
      {/* Overlay für Sonderpläne */}
      {override?.active && (
        <div className="absolute top-8 left-8 flex items-center gap-4 bg-black/70 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 z-20 shadow-2xl">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
          <span className="text-[1.4vh] font-black text-white uppercase tracking-[0.3em]">Sonderplan Aktiv</span>
        </div>
      )}

      {/* Sanfter Schattenverlauf unten für bessere Tiefenwirkung */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
    </div>
  );
};

export default MealDisplay;