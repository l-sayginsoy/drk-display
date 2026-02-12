import React, { useState, useEffect } from 'react';
import { AppData } from '../types';
import WeatherWidget from './WeatherWidget'; // Falls vorhanden, sonst auskommentieren

interface DashboardProps {
  appData: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ appData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Uhrzeit jede Sekunde aktualisieren
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();

  // 1. Logik für die Mahlzeiten-Anzeige (Zeitfenster)
  const getActiveMeal = () => {
    if (hours >= 6 && hours < 10) return appData.meals.find(m => m.type === 'breakfast');
    if (hours >= 11 && hours < 14) return appData.meals.find(m => m.type === 'lunch');
    if (hours >= 17 && hours < 21) return appData.meals.find(m => m.type === 'dinner');
    return null;
  };

  const activeMeal = getActiveMeal();
  const isUrgent = appData.urgentMessage?.active;

  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden flex flex-col">
      
      {/* HEADER: Hier ist dein Logo! */}
      <div className="flex justify-between items-center p-6 bg-gray-900 border-b border-gray-800">
        <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
        <div className="text-right">
          <p className="text-4xl font-bold">{currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-xl">{currentTime.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative">
        
        {/* FALL 1: EILMELDUNG (Höchste Priorität) */}
        {isUrgent ? (
          <div className="absolute inset-0 z-50 bg-red-700 flex flex-col items-center justify-center p-10 text-center animate-pulse">
            <h1 className="text-6xl font-black mb-6">EILMELDUNG</h1>
            <p className="text-4xl font-semibold">{appData.urgentMessage.content}</p>
          </div>
        ) : null}

        {/* FALL 2: SPEISEPLAN (Zweite Priorität) */}
        {!isUrgent && activeMeal ? (
          <div className="absolute inset-0 z-40 bg-gray-800 flex flex-col items-center justify-center p-8">
            <h2 className="text-5xl font-bold mb-4 text-orange-400">
              {activeMeal.type === 'breakfast' ? 'Frühstück' : activeMeal.type === 'lunch' ? 'Mittagessen' : 'Abendessen'}
            </h2>
            <img 
              src={activeMeal.image || '/default-meal.jpg'} 
              className="w-2/3 h-2/3 object-cover rounded-3xl shadow-2xl mb-6" 
              alt="Speiseplan"
            />
            <p className="text-4xl italic">"{appData.quotes[Math.floor(Math.random() * appData.quotes.length)]?.text}"</p>
          </div>
        ) : null}

        {/* FALL 3: SLIDESHOW (Standard, wenn nichts anderes aktiv ist) */}
        {!isUrgent && !activeMeal && (
          <div className="absolute inset-0 z-10">
             {/* Hier kommt deine Slideshow-Komponente rein */}
             <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <p className="text-2xl">Slideshow läuft...</p>
                {/* <YourSlideshowComponent images={appData.slideshow.images} /> */}
             </div>
          </div>
        )}

        {/* WETTER API (Immer sichtbar im Eck, außer bei Eilmeldung) */}
        {!isUrgent && (
          <div className="absolute bottom-10 right-10 z-50 bg-black/50 p-4 rounded-2xl backdrop-blur-md">
            {/* Hier die Wetter-Daten einbinden */}
            <p className="text-2xl font-bold text-blue-400">Wetter-API aktiv</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;