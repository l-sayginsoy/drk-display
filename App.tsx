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

  if (isLoading) return <div className=\"min-h-screen flex items-center justify-center bg-white\"><Loader2 className=\"animate-spin text-red-600\" size={64} /></div>;

  return (
    <div className=\"min-h-screen bg-white font-sans text-slate-900\">
      <header className=\"bg-red-600 text-white p-10 shadow-2xl flex justify-between items-center\">
        <div className=\"flex items-center gap-10\">
          <div className=\"bg-white text-red-600 font-black text-6xl p-6 rounded-3xl\">DRK</div>
          <h1 className=\"text-8xl font-black tracking-tighter uppercase leading-none\">Wochenprogramm</h1>
        </div>
      </header>

      <main className=\"p-10 space-y-6\">
        {DAYS_SHORT.map((day) => {
          const data = activities[`${weekInfo.weekKey}-${day}`];
          return (
            <div key={day} className=\"flex items-center bg-slate-50 p-10 rounded-[4rem] border-4 border-slate-100 shadow-xl\">
              <div className=\"w-48\">
                <span className=\"text-8xl font-black text-red-600\">{day}</span>
              </div>
              <div className=\"flex-1 px-12 border-l-8 border-slate-200\">
                <h2 className=\"text-7xl font-bold text-slate-800\">{data?.title || '---'}</h2>
                <p className=\"text-4xl font-bold text-slate-400 uppercase mt-2\">{data?.location || ''}</p>
              </div>
              <div className=\"bg-white px-14 py-10 rounded-[3rem] border-8 border-red-600 shadow-2xl flex items-center gap-6\">
                <Clock size={60} className=\"text-red-600\" />
                <span className=\"text-7xl font-black tracking-tighter\">{data?.time || '--:--'}</span>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}