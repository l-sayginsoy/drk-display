import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, ChevronLeft, ChevronRight, Calendar, 
  ImageIcon, Clock, CheckCircle2, AlertCircle, 
  Sparkles, Loader2, Settings, Github, X, Cloud
} from 'lucide-react';
import { WeeklyActivity, EventConfig } from './types.ts';
import { suggestActivity } from './geminiService.ts';
import { getGitHubConfig, saveGitHubConfig, fetchFileFromGitHub, updateFileOnGitHub, GitHubConfig } from './githubService.ts';

const ADMIN_PASSWORD = "drk";
const LOCATIONS = ['Cafeteria', 'Kleiner Saal', 'Garten', 'Terrasse', 'Wohnbereich', 'Speisesaal', 'Andere...'];
const DAYS_SHORT = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];

// PRÜFUNG: Ist das die Hauptseite oder der Admin-Bereich?
const IS_DISPLAY_MODE = import.meta.env.VITE_APP_MODE === 'display';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(IS_DISPLAY_MODE); // Wenn Display-Mode, dann quasi "immer eingeloggt"
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [githubStatus, setGithubStatus] = useState<'connected' | 'error' | 'idle'>('idle');
  
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => {
    const saved = getGitHubConfig();
    return saved || {
      token: import.meta.env.VITE_GITHUB_TOKEN || '',
      owner: 'l-sayginsoy', 
      repo: 'drk-display', 
      path: 'wochenprogramm.txt', 
      branch: 'main'
    };
  });

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [activities, setActivities] = useState<Record<string, WeeklyActivity>>({});
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    active: false, image: "standard.jpg", start: "", end: ""
  });
  
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  // Daten immer laden, egal ob Admin oder Display
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsSyncing(true);
      const progRes = await fetchFileFromGitHub(githubConfig);
      if (progRes.content) {
        const lines = progRes.content.split('\n');
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
      try {
        const eventRes = await fetchFileFromGitHub(githubConfig, 'event.json');
        if (eventRes.content) setEventConfig(JSON.parse(eventRes.content));
      } catch (e) {}
      setGithubStatus('connected');
    } catch (err: any) {
      setGithubStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const weekInfo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (currentWeekOffset * 7));
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    const year = new Date(firstThursday).getFullYear();
    const startOfWeek = new Date(d);
    const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
    startOfWeek.setDate(d.getDate() + diff);
    return { year, weekNumber, weekKey: `${year}-W${weekNumber.toString().padStart(2, '0')}`, label: `${d.toLocaleString('de-DE', { month: 'long' })} ${year}`, startDate: startOfWeek };
  }, [currentWeekOffset]);

  const saveAllToGitHub = async () => {
    try {
      setIsSyncing(true);
      let existingContent = "";
      let progSha = null;
      try {
        const res = await fetchFileFromGitHub(githubConfig);
        existingContent = res.content || "";
        progSha = res.sha;
      } catch(e) {}
      const otherLines = existingContent.split('\n').filter(line => line.trim() && !line.trim().startsWith(weekInfo.weekKey));
      const currentWeekLines = DAYS_SHORT.map(day => {
        const id = `${weekInfo.weekKey}-${day}`;
        const act = activities[id] || { title: '', location: '', time: '' };
        return `${weekInfo.weekKey} | ${day} | ${act.title || '-'} | ${act.location || '-'} | ${act.time || '-'}`;
      });
      const finalProgContent = [...otherLines, ...currentWeekLines].join('\n');
      await updateFileOnGitHub(githubConfig, finalProgContent, progSha);
      showStatus("ERFOLGREICH VERÖFFENTLICHT!", "success");
    } catch (err: any) {
      showStatus(`FEHLER: ${err.message}`, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const updateActivity = (dayIndex: number, field: keyof WeeklyActivity, value: string) => {
    const id = `${weekInfo.weekKey}-${DAYS_SHORT[dayIndex]}`;
    setActivities(prev => ({ ...prev, [id]: { ...(prev[id] || { id, day: DAYS_SHORT[dayIndex], title: "", location: "", time: "" }), [field]: value } }));
  };

  const handleAISuggestion = async (dayIndex: number) => {
    const id = `${weekInfo.weekKey}-${DAYS_SHORT[dayIndex]}`;
    setLoadingSuggestion(id);
    const suggestion = await suggestActivity(DAYS_SHORT[dayIndex], activities[id]?.location || 'Cafeteria');
    updateActivity(dayIndex, 'title', suggestion);
    setLoadingSuggestion(null);
  };

  // LOGIN MASK (Nur wenn NICHT Display Mode und NICHT eingeloggt)
  if (!isLoggedIn && !IS_DISPLAY_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-12 text-center animate-in zoom-in duration-500">
          <div className="mb-10 flex justify-center">
            <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-red-600/40 transform -rotate-6">
              <Lock size={48} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">DRK ADMIN</h1>
          <form onSubmit={(e) => { e.preventDefault(); password === ADMIN_PASSWORD ? setIsLoggedIn(true) : setLoginError(true); }} className="space-y-6">
            <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-8 py-6 bg-slate-100 border-4 border-transparent rounded-3xl outline-none focus:border-red-600 text-center font-black text-2xl transition-all" placeholder="PASSWORT" />
            <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-95">Einloggen</button>
          </form>
        </div>
      </div>
    );
  }

  // HAUPT-LAYOUT (Wird angezeigt, wenn Display Mode ODER eingeloggt)
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Header und Dashboard Content bleiben wie sie sind, nur im Display-Modus blenden wir die "Editier-Buttons" aus */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-24 flex items-center px-10 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-red-600/30">DRK</div>
          <h1 className="font-black text-slate-900 tracking-tighter text-2xl uppercase">
            {IS_DISPLAY_MODE ? 'Wochenprogramm' : 'Admin Dashboard'}
          </h1>
        </div>
        {!IS_DISPLAY_MODE && (
           <div className="flex items-center gap-4">
              <button onClick={() => setShowSettings(true)} className="p-4 text-slate-400 hover:text-slate-900 rounded-2xl"><Settings size={28}/></button>
              <button onClick={() => setIsLoggedIn(false)} className="px-6 py-3 bg-slate-900 text-white font-black text-[10px] rounded-xl">Abmelden</button>
           </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center"><Calendar size={40}/></div>
               <div>
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{weekInfo.weekKey}</h2>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-3">{weekInfo.label}</p>
               </div>
            </div>
          </div>
          {!IS_DISPLAY_MODE && (
            <button onClick={saveAllToGitHub} className="rounded-[3.5rem] bg-red-600 font-black text-white shadow-2xl flex flex-col items-center justify-center gap-3 active:scale-95">
              <Cloud size={40}/>
              <span className="text-xs uppercase">Speichern</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {DAYS_SHORT.map((day, idx) => {
            const id = `${weekInfo.weekKey}-${day}`;
            const data = activities[id] || { title: "", location: "", time: "" };
            return (
              <div key={day} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex items-center gap-8 border border-slate-100">
                <span className="text-4xl font-black text-slate-900 w-20">{day}</span>
                {IS_DISPLAY_MODE ? (
                  // Anzeige für die Bewohner
                  <div className="flex-1 grid grid-cols-3 items-center">
                    <span className="text-2xl font-bold text-slate-800">{data.title || 'Keine Aktivität'}</span>
                    <span className="text-xl text-slate-500 font-medium text-center">{data.location}</span>
                    <span className="text-2xl font-black text-red-600 text-right">{data.time} Uhr</span>
                  </div>
                ) : (
                  // Editor für Admin
                  <>
                    <input type="text" value={data.title} onChange={e => updateActivity(idx, 'title', e.target.value)} className="flex-1 bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 font-bold outline-none" placeholder="Aktivität..." />
                    <input type="text" value={data.location} onChange={e => updateActivity(idx, 'location', e.target.value)} className="w-48 bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 font-bold outline-none" placeholder="Ort..." />
                    <input type="time" value={data.time} onChange={e => updateActivity(idx, 'time', e.target.value)} className="w-32 bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 font-black outline-none" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}