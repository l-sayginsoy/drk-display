
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Info, Bell } from 'lucide-react';
import { WeeklyActivity, EventConfig } from './types.ts';
import { getGitHubConfig, fetchFileFromGitHub } from './githubService.ts';

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
      // WICHTIG: Wenn kein LocalStorage da ist (z.B. auf dem Display-TV), 
      // nutzen wir deine Standard-Daten zum Lesen.
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
        if (prog.content) {
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
        if (evRes.content) setEvent(JSON.parse(evRes.content));
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
      <div className="h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Lade Programm...</p>
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
          <img src={event.image} alt="Event" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="relative z-10 text-center text-white p-10 bg-black/40 backdrop-blur-md rounded-[4rem] border-4 border-white/20 animate-in zoom-in duration-700">
            <Bell size={120} className="mx-auto mb-8 text-yellow-400 animate-bounce" />
            <h1 className="text-8xl font-black uppercase tracking-tighter mb-4">Besonderes Event</h1>
            <p className="text-3xl font-bold opacity-80 uppercase tracking-widest">Bitte beachten Sie die Aushänge</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden">
      <header className="bg-red-600 text-white p-12 flex justify-between items-center shadow-2xl relative z-10">
        <div className="flex items-center gap-10">
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white font-black text-2xl">DRK</div>
          </div>
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">Willkommen im Haus</h1>
            <p className="text-2xl font-bold opacity-80 mt-2 uppercase tracking-[0.2em]">Seniorenzentrum</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-8xl font-black tracking-tighter leading-none">
            {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-2xl font-bold opacity-80 uppercase mt-2">
            {time.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}
          </div>
        </div>
      </header>

      <main className="flex-1 p-16 grid grid-cols-1 gap-12 overflow-y-auto">
        <section>
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
              <Calendar size={40} />
            </div>
            <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Heute im Programm</h2>
          </div>

          {activities.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border-4 border-slate-100">
              <Info size={80} className="mx-auto text-slate-200 mb-6" />
              <p className="text-4xl font-bold text-slate-400 italic">Für heute sind keine Aktivitäten geplant.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {activities.map((act) => (
                <div key={act.id} className="bg-white rounded-[3.5rem] p-10 shadow-xl flex items-center gap-12 border-l-[24px] border-red-600 transform hover:scale-[1.01] transition-transform">
                  <div className="text-6xl font-black text-slate-900 w-48 shrink-0 flex items-center gap-4">
                    <Clock size={48} className="text-red-600" />
                    {act.time}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-6xl font-black text-slate-900 tracking-tight mb-2">{act.title}</h3>
                    <div className="flex items-center gap-4 text-3xl font-bold text-slate-400 uppercase tracking-widest">
                      <MapPin size={32} className="text-red-400" />
                      {act.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-slate-900 text-white p-8 text-center text-xl font-bold uppercase tracking-[0.5em] opacity-40">
        Deutsches Rotes Kreuz • Gemeinsam statt einsam
      </footer>
    </div>
  );
}
