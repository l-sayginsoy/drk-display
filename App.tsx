import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { WeeklyActivity, EventConfig } from './types.ts';
import { fetchFileFromGitHub, GitHubConfig } from './githubService.ts';

const DAYS_FULL = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activities, setActivities] = useState<WeeklyActivity[]>([]);
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    active: false, image: "standard.jpg", start: "", end: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  // GitHub-Config - NUR LESEN, kein Token nötig
  const githubConfig: GitHubConfig = {
    token: '', 
    owner: 'l-sayginsoy',
    repo: 'drk-display',
    path: 'wochenprogramm.txt',
    branch: 'main'
  };

  // Zeit aktualisieren
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Daten laden
  useEffect(() => {
    loadDisplayData();
    const interval = setInterval(loadDisplayData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDisplayData = async () => {
    try {
      setIsLoading(true);
      
      const progRes = await fetchFileFromGitHub(githubConfig);
      if (progRes.content) {
        const currentWeekKey = getCurrentWeekKey();
        const lines = progRes.content.split('\n');
        const weekActivities: WeeklyActivity[] = [];
        
        lines.forEach(line => {
          const parts = line.split('|').map(s => s.trim());
          if (parts.length >= 5 && parts === currentWeekKey) {
            weekActivities.push({
              id: `${parts}-${parts}`,
              day: parts,
              title: parts === '-' ? '' : parts,
              location: parts === '-' ? '' : parts,
              time: parts === '-' ? '' : parts
            });
          }
        });
        setActivities(weekActivities);
      }

      try {
        const eventRes = await fetchFileFromGitHub(githubConfig, 'event.json');
        if (eventRes.content) {
          setEventConfig(JSON.parse(eventRes.content));
        }
      } catch (e) {
        console.log("Kein Event aktiv");
      }

    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentWeekKey = () => {
    const now = new Date();
    const target = new Date(now.valueOf());
    const dayNr = (now.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    const year = new Date(firstThursday).getFullYear();
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  const isEventActive = () => {
    if (!eventConfig.active || !eventConfig.start || !eventConfig.end) return false;
    const now = new Date();
    const start = new Date(eventConfig.start);
    const end = new Date(eventConfig.end);
    return now >= start && now <= end;
  };

  const todaysActivities = activities.filter(act => {
    const today = DAYS_FULL[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    const dayMap: Record<string, string> = {
      'MO': 'Montag', 'DI': 'Dienstag', 'MI': 'Mittwoch',
      'DO': 'Donnerstag', 'FR': 'Freitag', 'SA': 'Samstag', 'SO': 'Sonntag'
    };
    return dayMap[act.day] === today && act.title;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-white font-bold text-lg">DRK</span>
          </div>
          <p className="text-slate-600 text-xl font-medium">Programm wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      {isEventActive() && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-8">
          <div className="text-center text-white max-w-4xl">
            <div className="w-32 h-32 bg-red-600 rounded-full mx-auto mb-12 flex items-center justify-center shadow-2xl">
              <ImageIcon size={64} />
            </div>
            <h1 className="text-8xl font-black uppercase tracking-tight mb-8">Veranstaltung</h1>
            <p className="text-3xl text-slate-300 mb-8">
              {new Date(eventConfig.start).toLocaleString('de-DE')} - {new Date(eventConfig.end).toLocaleString('de-DE')}
            </p>
            <div className="text-xl text-slate-400">Bild: {eventConfig.image}</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-8 max-w-6xl">
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-black text-2xl">DRK</span>
            </div>
            <div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tight">Wochenprogramm</h1>
              <p className="text-xl text-slate-600 mt-2">Pflegeheim In der Melm</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg border">
            <div className="text-5xl font-black text-slate-900 mb-4">
              {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-2xl text-slate-600">
              {currentTime.toLocaleDateString('de-DE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        <section className="mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-8 flex items-center gap-4">
            <Calendar size={48} className="text-red-600" />
            Heute
          </h2>
          
          {todaysActivities.length > 0 ? (
            <div className="grid gap-6">
              {todaysActivities.map((activity) => (
                <div key={activity.id} className="bg-white/90 backdrop-blur rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-slate-900 mb-2">{activity.title}</h3>
                      <div className="flex items-center gap-6 text-xl text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock size={24} />
                          {activity.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={24} />
                          {activity.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/60 rounded-2xl p-12 text-center">
              <p className="text-3xl text-slate-500">Heute keine Aktivitäten geplant</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-4xl font-black text-slate-900 mb-8">Diese Woche</h2>
          <div className="grid gap-4">
            {DAYS_FULL.map((dayName, index) => {
              const dayMap: Record<string, string> = {
                'Montag': 'MO', 'Dienstag': 'DI', 'Mittwoch': 'MI',
                'Donnerstag': 'DO', 'Freitag': 'FR', 'Samstag': 'SA', 'Sonntag': 'SO'
              };
              const dayCode = dayMap[dayName];
              const dayActivities = activities.filter(act => act.day === dayCode && act.title);
              
              const isToday = dayName === DAYS_FULL[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
              
              return (
                <div key={dayName} className={`bg-white/70 backdrop-blur rounded-xl p-6 border transition-all ${isToday ? 'border-red-500 shadow-lg' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-2xl font-bold ${isToday ? 'text-red-600' : 'text-slate-900'}`}>
                      {dayName}
                    </h3>
                    {isToday && <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
                  </div>
                  
                  {dayActivities.length > 0 ? (
                    <div className="space-y-3">
                      {dayActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between text-lg">
                          <span className="font-medium text-slate-900">{activity.title}</span>
                          <div className="flex items-center gap-4 text-slate-600">
                            <span>{activity.time}</span>
                            <span className="text-slate-400">•</span>
                            <span>{activity.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-lg">Keine Aktivitäten</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}