import React, { useState, useEffect } from 'react';
import { Calendar, Save, Settings, LogOut, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const ADMIN_PASSWORD = "drk";
const DAYS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];
const LOCATIONS = ['Cafeteria', 'Kleiner Saal', 'Garten', 'Terrasse', 'Wohnbereich', 'Speisesaal'];

// GitHub Config
interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

interface WeeklyEntry {
  day: string;
  title: string;
  location: string;
  time: string;
}

interface EventConfig {
  active: boolean;
  image: string;
  start: string;
  end: string;
}

export default function AdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // GitHub Config
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>({
    token: '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',
    owner: 'l-sayginsoy',
    repo: 'drk-display'
  });
  
  // Data
  const [weeklyProgram, setWeeklyProgram] = useState<WeeklyEntry[]>(
    DAYS.map(day => ({ day, title: '', location: '', time: '' }))
  );
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    active: false,
    image: 'standard.jpg',
    start: '',
    end: ''
  });
  
  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Show status message
  const showStatus = (message: string, type: 'success' | 'error') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 4000);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError(false);
      loadData();
    } else {
      setLoginError(true);
    }
  };

  // Load data from GitHub
  const loadData = async () => {
    try {
      // Load weekly program
      const progRes = await fetch(`https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/wochenprogramm.txt`, {
        headers: { Authorization: `token ${githubConfig.token}` }
      });
      
      if (progRes.ok) {
        const progData = await progRes.json();
        const content = atob(progData.content).replace(/\r/g, '');
        const lines = content.split('\n').filter(line => line.includes('|') && !line.includes('2026-W'));
        
        const newProgram = DAYS.map(day => {
          const line = lines.find(l => l.startsWith(day + '|'));
          if (line) {
            const parts = line.split('|').map(s => s.trim());
            return { day, title: parts[1] || '', location: parts[2] || '', time: parts[3] || '' };
          }
          return { day, title: '', location: '', time: '' };
        });
        setWeeklyProgram(newProgram);
      }

      // Load event config
      const eventRes = await fetch(`https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/event.txt`, {
        headers: { Authorization: `token ${githubConfig.token}` }
      });
      
      if (eventRes.ok) {
        const eventData = await eventRes.json();
        const content = atob(eventData.content).replace(/\r/g, '');
        const lines = content.split('\n');
        const config: any = {};
        
        lines.forEach(line => {
          const [key, ...value] = line.split(':');
          if (key && value.length) {
            config[key.trim().toLowerCase()] = value.join(':').trim();
          }
        });

        setEventConfig({
          active: config.aktiv === 'ja',
          image: config.bild || 'standard.jpg',
          start: config.start || '',
          end: config.ende || ''
        });
      }
    } catch (error) {
      showStatus('Fehler beim Laden der Daten', 'error');
    }
  };

  // Save data to GitHub
  const saveData = async () => {
    setIsSaving(true);
    try {
      // Save weekly program
      const progContent = weeklyProgram
        .map(entry => `${entry.day}|${entry.title}|${entry.location}|${entry.time}`)
        .join('\n');

      const progRes = await fetch(`https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/wochenprogramm.txt`, {
        headers: { Authorization: `token ${githubConfig.token}` }
      });

      let progSha = '';
      if (progRes.ok) {
        const data = await progRes.json();
        progSha = data.sha;
      }

      await fetch(`https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/wochenprogramm.txt`, {
        method: 'PUT',
        headers: { 
          Authorization: `token ${githubConfig.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update wochenprogramm from admin',
          content: btoa(progContent),
          sha: progSha || undefined
        })
      });

      // Save event config
      const eventContent = [
        `aktiv: ${eventConfig.active ? 'ja' : 'nein'}`,
        `bild: ${eventConfig.image}`,
        `start: ${eventConfig.start}`,
        `ende: ${eventConfig.end}`
      ].join('\n');

      const eventRes = await fetch(`https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/event.txt`, {
        headers: { Authorization: `token ${githubConfig.token}` }
      });

      let eventSha = '';
      if (eventRes.ok) {
        const data = await eventRes.json();
        eventSha = data.sha;
      }

      await fetch(`https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/event.txt`, {
        method: 'PUT',
        headers: { 
          Authorization: `token ${githubConfig.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update event config from admin',
          content: btoa(eventContent),
          sha: eventSha || undefined
        })
      });

      showStatus('Erfolgreich gespeichert!', 'success');
    } catch (error) {
      showStatus('Fehler beim Speichern', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <span className="text-white font-black text-2xl">DRK</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Login</h1>
            <p className="text-slate-500 font-medium mt-2">DRK Melm Dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-center text-xl focus:border-red-600 outline-none transition-colors"
              placeholder="Passwort eingeben"
            />
            {loginError && (
              <p className="text-red-600 font-bold text-sm text-center">Falsches Passwort</p>
            )}
            <button 
              type="submit" 
              className="w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-colors uppercase tracking-wide"
            >
              Einloggen
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Admin Interface
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Status Message */}
      {status && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-bold ${
          status.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {status.message}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-black text-slate-900 mb-6">GitHub Einstellungen</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={githubConfig.owner}
                onChange={(e) => setGithubConfig(prev => ({ ...prev, owner: e.target.value }))}
                placeholder="GitHub Nutzername"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-medium focus:border-red-600 outline-none"
              />
              <input
                type="text"
                value={githubConfig.repo}
                onChange={(e) => setGithubConfig(prev => ({ ...prev, repo: e.target.value }))}
                placeholder="Repository Name"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-medium focus:border-red-600 outline-none"
              />
              <input
                type="password"
                value={githubConfig.token}
                onChange={(e) => setGithubConfig(prev => ({ ...prev, token: e.target.value }))}
                placeholder="GitHub Token"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-medium focus:border-red-600 outline-none"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => { setShowSettings(false); loadData(); }}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">DRK</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-500 font-medium text-sm">DRK Melm Verwaltung</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveData}
            disabled={isSaving}
            className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg"
          >
            {isSaving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? 'Speichert...' : 'Änderungen Speichern'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Program */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Calendar size={28} className="text-red-600" />
              Wochenprogramm
            </h2>
            
            <div className="space-y-4">
              {weeklyProgram.map((entry, index) => (
                <div key={entry.day} className="grid grid-cols-6 gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="font-black text-slate-900 text-lg flex items-center">
                    {entry.day}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={entry.title}
                      onChange={(e) => {
                        const newProgram = [...weeklyProgram];
                        newProgram[index].title = e.target.value;
                        setWeeklyProgram(newProgram);
                      }}
                      placeholder="Aktivität..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:border-red-600 outline-none"
                    />
                  </div>
                  <div>
                    <select
                      value={entry.location}
                      onChange={(e) => {
                        const newProgram = [...weeklyProgram];
                        newProgram[index].location = e.target.value;
                        setWeeklyProgram(newProgram);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:border-red-600 outline-none"
                    >
                      <option value="">Ort wählen</option>
                      {LOCATIONS.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="time"
                      value={entry.time}
                      onChange={(e) => {
                        const newProgram = [...weeklyProgram];
                        newProgram[index].time = e.target.value;
                        setWeeklyProgram(newProgram);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:border-red-600 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Config */}
          <div className="bg-slate-900 text-white rounded-3xl p-8">
            <h2 className="text-xl font-black mb-6">Event-Modus</h2>
            
            {/* Active Toggle */}
            <div className="mb-6">
              <label className="text-sm font-bold text-white/70 block mb-2">Status</label>
              <div className="grid grid-cols-2 gap-2 bg-white/10 p-1 rounded-xl">
                <button
                  onClick={() => setEventConfig(prev => ({ ...prev, active: true }))}
                  className={`py-2 px-4 rounded-lg font-bold text-sm transition-colors ${
                    eventConfig.active ? 'bg-green-600 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Aktiv
                </button>
                <button
                  onClick={() => setEventConfig(prev => ({ ...prev, active: false }))}
                  className={`py-2 px-4 rounded-lg font-bold text-sm transition-colors ${
                    !eventConfig.active ? 'bg-red-600 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Aus
                </button>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-white/70 block mb-2">Bilddatei</label>
                <input
                  type="text"
                  value={eventConfig.image}
                  onChange={(e) => setEventConfig(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="bild.jpg"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/40 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-white/70 block mb-2">Start</label>
                <input
                  type="datetime-local"
                  value={eventConfig.start}
                  onChange={(e) => setEventConfig(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-white/40 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-white/70 block mb-2">Ende</label>
                <input
                  type="datetime-local"
                  value={eventConfig.end}
                  onChange={(e) => setEventConfig(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-white/40 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
