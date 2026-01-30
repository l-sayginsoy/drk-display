import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { WeeklyActivity } from './types.ts';
import { fetchFileFromGitHub, getGitHubConfig, GitHubConfig } from './githubService.ts';

const DAYS_SHORT = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];

export default function App() {
  const [activities, setActivities] = useState<Record<string, WeeklyActivity>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const githubConfig: GitHubConfig = getGitHubConfig() || {
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
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
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 300000);
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={64} /></div>;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-red-600 text-white p-8 shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="bg-white text-red-600 font-black text-4xl p-4 rounded-2xl">DRK</div>
          <h1 className="text-6xl font-black uppercase">Wochenprogramm</h1>
        </div>
      </header>
      <main className="p-8 space-y-4">
        {DAYS_SHORT.map((day) => {
          const data = activities[`${weekInfo.weekKey}-${day}`];
          return (
            <div key={day} className="flex items-center bg-slate-50 p-8 rounded-[3rem] border-4 border-slate-100 shadow-lg">
              <span className="text-7xl font-black text-red-600 w-32">{day}</span>
              <div className="flex-1 px-10 border-l-4 border-slate-200">
                <h2 className="text-5xl font-bold text-slate-800">{data?.title || '---'}</h2>
                <p className="text-2xl font-bold text-slate-400 uppercase">{data?.location || ''}</p>
              </div>
              <div className="bg-white px-10 py-6 rounded-full border-4 border-red-600">
                <span className="text-5xl font-black">{data?.time || '--:--'}</span>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}