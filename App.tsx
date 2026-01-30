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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [githubStatus, setGithubStatus] = useState<'connected' | 'error' | 'idle'>('idle');
  
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => {
    const saved = getGitHubConfig();
    return saved || {
      // Hier wurde die Änderung für die Sicherheit vorgenommen:
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

  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
    }
  }, [isLoggedIn]);

  const loadAllData = async () => {
    try {
      setIsSyncing(true);
      setGithubStatus('idle');
      
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
      } catch (e) {
        console.log("Event-Datei fehlt noch");
      }

      setGithubStatus('connected');
    } catch (err: any) {
      setGithubStatus('error');
      if (err.message.includes('404')) {
         setGithubStatus('connected');
      } else {
         showStatus("KEINE VERBINDUNG ZU GITHUB!", "error");
      }
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
    return { 
      year, 
      weekNumber, 
      weekKey: `${year}-W${weekNumber.toString().padStart(2, '0')}`,
      label: `${d.toLocaleString('de-DE', { month: 'long' })} ${year}`, 
      startDate: startOfWeek 
    };
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
      
      const otherLines = existingContent.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith(weekInfo.weekKey);
      });

      const currentWeekLines = DAYS_SHORT.map(day => {
        const id = `${weekInfo.weekKey}-${day}`;
        const act = activities[id] || { title: '', location: '', time: '' };
        return `${weekInfo.weekKey} | ${day} | ${act.title || '-'} | ${act.location || '-'} | ${act.time || '-'}`;
      });

      const finalProgContent = [...otherLines, ...currentWeekLines].join('\n');
      await updateFileOnGitHub(githubConfig, finalProgContent, progSha);

      let eventSha = null;
      try {
        const eventRes = await fetchFileFromGitHub(githubConfig, 'event.json');
        eventSha = eventRes.sha;
      } catch(e) {}
      await updateFileOnGitHub(githubConfig, JSON.stringify(eventConfig, null, 2), eventSha, 'event.json');

      showStatus("ERFOLGREICH VERÖFFENTLICHT!", "success");
    } catch (err: any) {
      showStatus(`FEHLER: ${err.message}`, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const updateActivity = (dayIndex: number, field: keyof WeeklyActivity, value: string) => {
    const id = `${weekInfo.weekKey}-${DAYS_SHORT[dayIndex]}`;
    setActivities(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { id, day: DAYS_SHORT[dayIndex], title: "", location: "", time: "" }),
        [field]: value
      }
    }));
  };

  const handleAISuggestion = async (dayIndex: number) => {
    const id = `${weekInfo.weekKey}-${DAYS_SHORT[dayIndex]}`;
    setLoadingSuggestion(id);
    const suggestion = await suggestActivity(DAYS_SHORT[dayIndex], activities[id]?.location || 'Cafeteria');
    updateActivity(dayIndex, 'title', suggestion);
    setLoadingSuggestion(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-12 text-center animate-in zoom-in duration-500">
          <div className="mb-10 flex justify-center">
            <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-red-600/40 transform -rotate-6">
              <Lock size={48} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">DRK ADMIN</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mb-10">ZUGANG NUR FÜR PERSONAL</p>
          <form onSubmit={(e) => { e.preventDefault(); password === ADMIN_PASSWORD ? setIsLoggedIn(true) : setLoginError(true); }} className="space-y-6">
            <input 
              type="password" autoFocus
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-8 py-6 bg-slate-100 border-4 border-transparent rounded-3xl outline-none focus:border-red-600 text-center font-black text-2xl transition-all"
              placeholder="PASSWORT"
            />
            {loginError && <p className="text-red-600 font-black text-[10px] uppercase animate-pulse">Zugriff verweigert</p>}
            <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-95">Einloggen</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="font-black text-slate-900 uppercase tracking-tighter text-2xl flex items-center gap-4">
                <Github size={32} /> Verbindung
              </h2>
              <button onClick={() => setShowSettings(false)} className="p-4 hover:bg-slate-200 rounded-full transition-colors"><X size={28}/></button>
            </div>
            <div className="p-12 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GitHub Owner</label>
                  <input type="text" value={githubConfig.owner} onChange={e => setGithubConfig(p => ({...p, owner: e.target.value}))} className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black focus:border-red-600 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Repository</label>
                  <input type="text" value={githubConfig.repo} onChange={e => setGithubConfig(p => ({...p, repo: e.target.value}))} className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black focus:border-red-600 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GitHub Token</label>
                  <input type="password" value={githubConfig.token} onChange={e => setGithubConfig(p => ({...p, token: e.target.value}))} className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black focus:border-red-600 outline-none" />
                </div>
              </div>
              <button 
                onClick={() => { saveGitHubConfig(githubConfig); setShowSettings(false); loadAllData(); }} 
                className="w-full bg-red-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest"
              >
                Konfiguration speichern
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-24 flex items-center px-10 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-red-600/30">DRK</div>
          <div>
            <h1 className="font-black text-slate-900 tracking-tighter text-2xl uppercase">ADMIN DASHBOARD</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${githubStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {githubStatus === 'connected' ? `Verbunden: ${githubConfig.owner}/${githubConfig.repo}` : 'GITHUB FEHLER'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowSettings(true)} className="p-4 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"><Settings size={28}/></button>
          <button onClick={() => setIsLoggedIn(false)} className="px-6 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black transition-all">Abmelden</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10 space-y-12">
        {statusMsg && (
          <div className={`fixed top-28 left-1/2 -translate-x-1/2 z-[110] px-12 py-6 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-top border-4 ${statusMsg.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
             {statusMsg.type === 'success' ? <CheckCircle2 size={32}/> : <AlertCircle size={32}/>}
             <span className="font-black uppercase tracking-widest text-sm">{statusMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-inner"><Calendar size={40}/></div>
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{weekInfo.weekKey}</h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-3">{weekInfo.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentWeekOffset(p => p - 1)} className="p-5 bg-slate-50 rounded-2xl hover:text-red-600 transition-all active:scale-90 border border-slate-100"><ChevronLeft size={32}/></button>
              <button onClick={() => setCurrentWeekOffset(p => p + 1)} className="p-5 bg-slate-50 rounded-2xl hover:text-red-600 transition-all active:scale-90 border border-slate-100"><ChevronRight size={32}/></button>
            </div>
          </div>
          
          <button 
            onClick={saveAllToGitHub} 
            disabled={isSyncing}
            className={`rounded-[3.5rem] font-black uppercase tracking-widest text-white shadow-2xl transition-all flex flex-col items-center justify-center gap-3 ${isSyncing ? 'bg-slate-400' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20 active:scale-95'}`}
          >
            {isSyncing ? <Loader2 className="animate-spin" size={40}/> : <Cloud size={40}/>}
            <span className="text-xs">Speichern</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          <div className="xl:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] px-6">Editor</h3>
            <div className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 p-6 space-y-4">
              {DAYS_SHORT.map((day, idx) => {
                const id = `${weekInfo.weekKey}-${day}`;
                const data = activities[id] || { title: "", location: "", time: "" };
                return (
                  <div key={day} className="group p-6 rounded-[2rem] hover:bg-slate-50 transition-all flex items-center gap-6">
                    <div className="w-16 shrink-0 text-center">
                      <span className="text-3xl font-black text-slate-900 group-hover:text-red-600 transition-colors">{day}</span>
                    </div>
                    
                    <div className="flex-1 relative">
                      <input 
                        type="text" value={data.title} onChange={e => updateActivity(idx, 'title', e.target.value)}
                        placeholder="Aktivität..." 
                        className="w-full bg-white border-2 border-slate-100 rounded-[1.5rem] px-8 py-5 font-bold outline-none focus:border-red-600 pr-16 shadow-sm"
                      />
                      <button onClick={() => handleAISuggestion(idx)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-600 transition-colors">
                        {loadingSuggestion === id ? <Loader2 className="animate-spin" size={24}/> : <Sparkles size={24}/>}
                      </button>
                    </div>

                    <div className="w-48 shrink-0">
                      <select value={data.location} onChange={e => updateActivity(idx, 'location', e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-[1.5rem] px-6 py-5 font-bold outline-none focus:border-red-600 appearance-none shadow-sm cursor-pointer">
                        <option value="">Ort...</option>
                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>

                    <div className="w-36 shrink-0 bg-white px-6 py-5 rounded-[1.5rem] border-2 border-slate-100 shadow-sm flex items-center gap-3">
                      <Clock size={20} className="text-slate-300" />
                      <input type="time" value={data.time} onChange={e => updateActivity(idx, 'time', e.target.value)} className="bg-transparent border-none outline-none font-black text-lg w-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-6">Event Steuerung</h3>
            <section className="bg-slate-900 text-white rounded-[3.5rem] p-10 shadow-2xl space-y-8">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${eventConfig.active ? 'bg-emerald-500 shadow-xl shadow-emerald-500/30' : 'bg-white/10'}`}>
                    <ImageIcon size={28}/>
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-tighter text-xl leading-none">Event-Modus</h4>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest mt-2">Status: {eventConfig.active ? 'AKTIV' : 'AUS'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl">
                  <button onClick={() => setEventConfig(p => ({...p, active: true}))} className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${eventConfig.active ? 'bg-white text-slate-900' : 'text-white/30'}`}>Ein</button>
                  <button onClick={() => setEventConfig(p => ({...p, active: false}))} className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!eventConfig.active ? 'bg-red-600 text-white' : 'text-white/30'}`}>Aus</button>
                </div>

                <div className="space-y-4">
                  <input type="text" value={eventConfig.image} onChange={e => setEventConfig(p => ({...p, image: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none font-bold text-sm" placeholder="Bild-Dateiname..." />
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-white/30 uppercase ml-1">Beginn</label>
                      <input type="datetime-local" value={eventConfig.start} onChange={e => setEventConfig(p => ({...p, start: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-white/30 uppercase ml-1">Ende</label>
                      <input type="datetime-local" value={eventConfig.end} onChange={e => setEventConfig(p => ({...p, end: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black outline-none" />
                    </div>
                  </div>
                </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}