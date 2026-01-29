
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import WeatherBackground from './components/WeatherBackground';
import WeeklyProgram from './components/WeeklyProgram';
import MealDisplay from './components/MealDisplay';
import { fetchEventOverride, fetchWeeklyProgram, fetchQuote } from './dataService';
import { WeeklyProgram as IWeeklyProgram, EventOverride, WeatherData } from './types';
import { mapWeatherCode, GITHUB_RAW_BASE } from './constants';

const App: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [programs, setPrograms] = useState<IWeeklyProgram[]>([]);
  const [override, setOverride] = useState<EventOverride | null>(null);
  const [quote, setQuote] = useState("Willkommen im DRK Melm.");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Memoized Tag/Nacht Check
  const currentIsDay = useMemo(() => {
    const hours = time.getHours();
    const isDaylightTime = hours >= 7 && hours < 19;
    
    if (weather) {
      // Wenn die API 'Nacht' sagt, vertrauen wir ihr (berücksichtigt Sonnenuntergang genau)
      return weather.isDay;
    }
    return isDaylightTime;
  }, [time.getHours(), weather?.isDay]);

  const updateAllData = useCallback(async () => {
    try {
      const [p, o, q] = await Promise.all([
        fetchWeeklyProgram(),
        fetchEventOverride(),
        fetchQuote()
      ]);
      setPrograms(p || []);
      setOverride(o);
      if (q && q.trim().length > 0) setQuote(q);
    } catch (err) {
      console.error("Fehler beim Laden der Daten:", err);
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=49.49&longitude=8.38&current=temperature_2m,is_day,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe/Berlin&forecast_days=4');
      if (!res.ok) throw new Error("API Fehler");
      
      const data = await res.json();
      
      if (data.current && data.daily) {
        const { condition } = mapWeatherCode(data.current.weather_code);
        const dayNames = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
        const forecast = [];
        
        const wCodes = data.daily.weather_code || [];
        const tMax = data.daily.temperature_2m_max || [];
        const tMin = data.daily.temperature_2m_min || [];

        for (let i = 1; i <= 3; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i);
          
          forecast.push({
            day: dayNames[d.getDay()],
            icon: mapWeatherCode(wCodes[i] ?? 0).icon,
            max: Math.round(tMax[i] ?? 0),
            min: Math.round(tMin[i] ?? 0)
          });
        }

        setWeather({
          temp: Math.round(data.current.temperature_2m ?? 0),
          code: data.current.weather_code ?? 0,
          isDay: data.current.is_day === 1,
          condition,
          max: Math.round(tMax[0] ?? 0),
          min: Math.round(tMin[0] ?? 0),
          forecast
        });
      }
    } catch (e) {
      console.error('Wetter-Update fehlgeschlagen:', e);
    }
  }, []);

  useEffect(() => {
    updateAllData();
    fetchWeather();
    const tInterval = setInterval(() => setTime(new Date()), 1000);
    const dInterval = setInterval(updateAllData, 300000);
    const wInterval = setInterval(fetchWeather, 900000);
    return () => { 
      clearInterval(tInterval); 
      clearInterval(dInterval); 
      clearInterval(wInterval); 
    };
  }, [updateAllData, fetchWeather]);

  return (
    <div className="relative h-screen w-screen overflow-hidden text-white font-['Inter'] bg-slate-950">
      {/* Wetterhintergrund mit professional Environmental Engine */}
      <WeatherBackground code={weather?.code} isDay={currentIsDay} />

      <header className="relative h-[12vh] flex items-end px-[4vw] pb-[2vh] z-10">
        <div className="flex items-center gap-[2.5vw]">
          <div className="text-[8.5vh] font-[900] tracking-tighter leading-none filter drop-shadow-2xl">
            {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="h-[5.5vh] w-[2px] bg-white/20 mx-2"></div>
          <div className="flex flex-col">
            <div className="text-[3.2vh] font-black uppercase tracking-tighter leading-none">
              {time.toLocaleDateString('de-DE', { weekday: 'long' })}
            </div>
            <div className="text-[1.8vh] font-semibold text-white/70 tracking-widest uppercase">
              {time.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}
            </div>
          </div>
        </div>
      </header>

      <main className="relative h-[79vh] flex px-[4vw] pt-[2vh] pb-[4vh] gap-[3vw] z-10">
        <div className="flex-[1.6] h-full overflow-hidden">
           <MealDisplay override={override} />
        </div>
        <div className="flex-[0.9] h-full overflow-hidden">
          <WeeklyProgram programs={programs} />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-[9vh] bg-white text-slate-900 flex items-center justify-between px-[3vw] z-[50] shadow-[0_-10px_50px_rgba(0,0,0,0.4)] border-t border-slate-200">
        <div className="w-[35%] flex items-center shrink-0">
          {weather ? (
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="text-[6vh] leading-none">{mapWeatherCode(weather.code).icon}</span>
                <div className="flex flex-col">
                  <span className="text-[4.2vh] font-black tracking-tighter leading-none text-slate-900">{weather.temp}°</span>
                  <span className="text-[1.1vh] font-bold text-slate-400 uppercase tracking-widest mt-1">Ludwigshafen</span>
                </div>
              </div>
              <div className="h-[4.5vh] w-px bg-slate-200"></div>
              <div className="flex gap-6">
                {weather.forecast.map((f, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[1vh] font-bold text-slate-400 uppercase leading-none mb-1">{f.day}</span>
                    <span className="text-[2.8vh] leading-none mb-1">{f.icon}</span>
                    <span className="text-[1.8vh] font-black text-slate-900 leading-none">{f.max}°</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 animate-pulse text-slate-300">
               <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
               <span className="text-[1.5vh] font-bold">Wetter lädt...</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-center px-8">
          <p className="text-[2.2vh] font-bold italic text-slate-600 leading-tight text-center line-clamp-2">
            "{quote}"
          </p>
        </div>

        <div className="w-[30%] flex justify-end items-center">
          {!logoError ? (
            <img 
              src={`${GITHUB_RAW_BASE}DRK-Logo_lang_RGB.png`} 
              alt="DRK Logo" 
              className="h-[3.5vh] w-auto object-contain block"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-[2.5vh] font-black text-red-600 tracking-tighter uppercase">DRK Melm</span>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
