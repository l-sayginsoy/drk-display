import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { WeeklyActivity } from './types.ts';
import { fetchFileFromGitHub, getGitHubConfig, GitHubConfig } from './githubService.ts';

const DAYS_SHORT = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];

export default function App() {
  const [activities, setActivities] = useState<Record<string, WeeklyActivity>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Nutzt die gleiche Konfiguration wie dein Admin-Panel
  const githubConfig: GitHubConfig = getGitHubConfig() || {
    token: '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',
    owner: 'l-sayginsoy', 
    repo: 'drk-display', 
    path: 'wochenprogramm.txt', 
    branch: 'main'
  };

  const loadData = async () => {
    try {
      const res = await fetchFileFromGitHub(githubConfig);
      if (res.content) {
        const lines = res.content.split('\n');
        const newActivities: Record<string, WeeklyActivity> = {};
        lines.forEach(line => {
          const parts = line.split('|').map(s => s.trim());
          if (parts.length >= 5) {
            const id = `${parts}-${parts}`;
            newActivities[id] = { id, day: parts, title: parts, location: parts, time: parts };
          }
        });
        setActivities(newActivities);
      }
    } catch (e) { console.error("Ladefehler Display"); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 300000); // Alle 5 Min aktualisieren
    return () => clearInterval(interval);
  }, []);

  const weekInfo = useMemo(() => {
    const d = new Date();
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    const year = new Date(firstThursday).getFullYear();
    const weekNumber = 1 + Math.ceil((firstThursday - new Date(year, 0, 4).valueOf()) / 604800000);
    return { weekKey: `${year}-W${weekNumber.toString().padStart(2, '0')}` };
  }, []);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-600" size={80} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-hidden">
      <header className="bg-red-600 text-white p-12 shadow-2xl flex justify-between items-center">
        <div className="flex items-center gap-10">
          <div className="bg-white text-red-600 font-black text-6xl p-6 rounded-[2rem] shadow-lg">DRK</div>
          <h1 className="text-9xl font-black tracking-tighter uppercase leading-none">Programm</h1>
        </div>
        <div className="text-4xl font-black opacity-40 italic">{weekInfo.weekKey}</div>
      </header>

      <main className="p-10 space-y-8">
        {DAYS_SHORT.map((day) => {
          const data = activities[`${weekInfo.weekKey}-${day}`];
          return (
            <div key={day} className="flex items-center bg-slate-50 p-12 rounded-[5rem] border-4 border-slate-100 shadow-xl transition-all">
              <div className="w-56 text-9xl font-black text-red-600">{day}</div>
              <div className="flex-1 px-16 border-l-8 border-slate-200">
                <h2 className="text-8xl font-bold text-slate-800 leading-tight">
                  {data?.title && data.title !== '-' ? data.title : 'Kein Programm'}
                </h2>
                <p className="text-5xl font-bold text-slate-400 uppercase mt-4">
                  {data?.location && data.location !== '-' ? data.location : ''}
                </p>
              </div>
              <div className="bg-white px-16 py-12 rounded-[4rem] border-8 border-red-600 shadow-2xl flex items-center gap-8">
                <Clock size={80} className="text-red-600" />
                <span className="text-8xl font-black tracking-tighter">
                  {data?.time && data.time !== '-' ? data.time : '--:--'}
                </span>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}