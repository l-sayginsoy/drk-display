import React, { useState, useEffect } from 'react';
import { WeeklyProgram } from '../src/types';
import { fetchWeeklyProgram } from '../src/dataService';

const AdminApp: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [programs, setPrograms] = useState<WeeklyProgram[]>([]);
  const [status, setStatus] = useState('');

  // 1. Passwort prüfen
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'drk') {
      setIsLoggedIn(true);
      loadData();
    } else {
      alert('Falsches Passwort!');
    }
  };

  // 2. Daten laden (nur wenn eingeloggt)
  const loadData = async () => {
    const data = await fetchWeeklyProgram();
    setPrograms(data);
  };

  const handleChange = (index: number, field: keyof WeeklyProgram, value: string) => {
    const newPrograms = [...programs];
    newPrograms[index] = { ...newPrograms[index], [field]: value };
    setPrograms(newPrograms);
  };

  const saveToClipboard = () => {
    const textContent = programs
      .map(p => `${p.day} | ${p.title} | ${p.location} | ${p.time}`)
      .join('\n');
    
    navigator.clipboard.writeText(textContent);
    setStatus('In die Zwischenablage kopiert! Jetzt in GitHub (wochenprogramm.txt) einfügen.');
    setTimeout(() => setStatus(''), 4000);
  };

  // Login-Maske anzeigen, wenn nicht eingeloggt
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-800 w-full max-w-md">
          <img src="/DRK-Logo_lang_RGB.png" alt="DRK Logo" className="h-12 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-center mb-6 text-white">Admin Login</h2>
          <input 
            type="password" 
            placeholder="Passwort eingeben" 
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-white mb-4 focus:border-red-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors">
            Anmelden
          </button>
        </form>
      </div>
    );
  }

  // Die eigentliche Admin-Oberfläche
  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-red-500">DRK Admin: Wochenprogramm</h1>
          <button onClick={() => setIsLoggedIn(false)} className="text-sm text-slate-400 hover:underline">Abmelden</button>
        </div>
        
        {status && <div className="bg-green-600/20 border border-green-600 text-green-400 p-4 mb-6 rounded-lg animate-pulse text-center font-bold">{status}</div>}

        <div className="grid gap-3 mb-8">
          {programs.map((p, index) => (
            <div key={index} className="flex gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800 items-center">
              <input className="bg-slate-800 p-2 rounded w-16 text-center border border-slate-700" value={p.day} onChange={e => handleChange(index, 'day', e.target.value)} placeholder="Tag" />
              <input className="bg-slate-800 p-2 rounded flex-[2] border border-slate-700" value={p.title} onChange={e => handleChange(index, 'title', e.target.value)} placeholder="Aktivität" />
              <input className="bg-slate-800 p-2 rounded flex-1 border border-slate-700" value={p.location} onChange={e => handleChange(index, 'location', e.target.value)} placeholder="Ort" />
              <input className="bg-slate-800 p-2 rounded w-28 border border-slate-700" value={p.time} onChange={e => handleChange(index, 'time', e.target.value)} placeholder="Zeit" />
              <button onClick={() => setPrograms(programs.filter((_, i) => i !== index))} className="text-red-500 px-2 font-bold hover:bg-red-500/10 rounded">X</button>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setPrograms([...programs, { day: 'MO', title: '', location: '', time: '' }])}
            className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-lg font-bold border border-slate-600 flex-1"
          >
            + Termin hinzufügen
          </button>
          <button 
            onClick={saveToClipboard}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold flex-[2] shadow-lg shadow-red-900/20"
          >
            Daten für GitHub kopieren
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminApp;