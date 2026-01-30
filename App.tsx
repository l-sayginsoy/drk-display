import React, { useState, useEffect } from 'react';
import { WeeklyActivity, EventConfig } from './types.ts';
import { fetchFileFromGitHub, getGitHubConfig } from './githubService.ts';

export default function App() {
  const [activities, setActivities] = useState<WeeklyActivity[]>([]);
  const [eventConfig, setEventConfig] = useState<EventConfig>({ active: false, image: '', start: '', end: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = getGitHubConfig();
        const { content } = await fetchFileFromGitHub(config);
        if (content) {
          const data = JSON.parse(content);
          setActivities(data.activities || []);
          setEventConfig(data.eventConfig || { active: false, image: '', start: '', end: '' });
        }
      } catch (e) {
        console.error("Fehler beim Laden:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, 60000); // Jede Minute aktualisieren
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Lade Display...</div>;

  return (
    <div className="min-h-screen bg-[#a8b0ba] p-8">
      {/* Hier bleibt dein komplettes bisheriges Display-Layout (Farben, Raster, etc.) erhalten */}
      <h1 className="text-4xl font-black text-center mb-12 uppercase tracking-tighter text-slate-900">
        Wochenprogramm & Veranstaltungen
      </h1>
      
      {/* Dein Grid und Event-Display Logik hier einfügen... */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((act) => (
          <div key={act.id} className="bg-white rounded-3xl p-6 shadow-xl">
             <div className="text-red-600 font-black text-xs mb-2">{act.day}</div>
             <div className="text-xl font-bold text-slate-800">{act.title}</div>
             <div className="text-slate-500 text-sm mt-1">{act.time} | {act.location}</div>
          </div>
        ))}
      </div>
    </div>
  );
}