
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Info, Bell } from 'lucide-react';
import { WeeklyActivity, EventConfig } from './types';
import { getGitHubConfig, fetchFileFromGitHub } from './githubService';

export default function App() {
  const [activities, setActivities] = useState<WeeklyActivity[]>([]);
  const [event, setEvent] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      let config = getGitHubConfig();
      if (!config) {
        config = {
          token: '',
          owner: 'l-sayginsoy',
          repo: 'drk-display',
          path: 'wochenprogramm.txt',
          branch: 'main'
        };
      }

      try {
        const prog = await fetchFileFromGitHub(config);
        if (prog && prog.content) {
          const todayStr = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'][new Date().getDay()];
          const lines = prog.content.split('\n');
          const todayActivities = lines
            .map(l => l.split('|').map(s => s.trim()))
            .filter(parts => parts.length >= 5 && parts[1] === todayStr)
            .map((parts, i) => ({
              id: `${parts[0]}-${i}`,
              day: parts[1],
              title: parts[2],
              location: parts[3],
              time: parts[4]
            }));
          setActivities(todayActivities);
        }

        const evRes = await fetchFileFromGitHub(config, 'event.json');
        if (evRes && evRes.content) {
          setEvent(JSON.parse(evRes.content));
        }
      } catch (e) {
        console.error("Display Load Error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Lade Display...</p>
        </div>
      </div>
    );
  }

  if (event?.active) {
    const now = new Date();
    const isRunning = (!event.start || new Date(event.start) <= now) && (!event.end || new Date(event.end) >= now);
    if (isRunning) {
      return (
        <div className="h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
          <img src={event.image} alt="Event" className="absolute inset-0 w-full h-full object-cover opacity-70" />
          <div className="relative z-10 text-center text-white p-16 bg-black/40 backdrop-blur-xl rounded-[4rem] border-4 border-white/20 shadow-2xl animate-in zoom-in duration-700 max-w-[80%]">
            <Bell size={120} className="mx-auto mb-10 text-yellow-400 animate-bounce" />
            <h1 className="text-8xl font-black uppercase tracking-tighter mb-6">Besonderes Event</h1>
            <p className="text-4xl font-bold opacity-90 uppercase tracking-widest">Bitte beachten Sie die aktuellen Aushänge!</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden">
      <header className="bg-red-600 text-white p-12 flex justify-between items-center shadow-2xl relative z-10">
        <div className="flex items-center gap-10">
          <div className="bg-white p-6 rounded-3xl shadow-xl">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white font-black text-2xl">DRK</div>
          </div>
          <div>
            <h1 className="text-7xl font-black tracking-tighter uppercase leading-none">Willkommen im Haus</h1>
            <p className="text-3xl font-bold opacity-90 mt-3 uppercase tracking-[0.2em]">Seniorenzentrum</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-9xl font-black tracking-tighter leading-none">
            {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-3xl font-bold opacity-90 uppercase mt-4">
            {time.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}
          </div>
        </div>
      </header>

      <main className="flex-1 p-20 grid grid-cols-1 gap-12 overflow-y-auto">
        <section>
          <div className="flex items-center gap-8 mb-16">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center shadow-sm">
              <Calendar size={48} />
            </div>
            <h2 className="text-6xl font-black text-slate-900 uppercase tracking-tighter">Heute im Programm</h2>
          </div>

          {activities.length === 0 ? (
            <div className="bg-white rounded-[4rem] p-32 text-center shadow-xl border-4 border-slate-100 animate-in fade-in duration-1000">
              <Info size={100} className="mx-auto text-slate-200 mb-8" />
              <p className="text-5xl font-bold text-slate-300 italic">Keine geplanten Aktivitäten für heute.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10">
              {activities.map((act) => (
                <div key={act.id} className="bg-white rounded-[4rem] p-12 shadow-xl flex items-center gap-16 border-l-[32px] border-red-600 animate-in slide-in-from-left duration-500">
                  <div className="text-7xl font-black text-slate-900 w-64 shrink-0 flex items-center gap-6">
                    <Clock size={64} className="text-red-600" />
                    {act.time}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-7xl font-black text-slate-900 tracking-tight mb-4">{act.title}</h3>
                    <div className="flex items-center gap-6 text-4xl font-bold text-slate-400 uppercase tracking-widest">
                      <MapPin size={40} className="text-red-400" />
                      {act.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-slate-900 text-white p-10 text-center text-2xl font-black uppercase tracking-[0.5em] opacity-50">
        Deutsches Rotes Kreuz • In Liebevoller Gemeinschaft
      </footer>
    </div>
  );
}
