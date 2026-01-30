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

  const currentIsDay = useMemo(() => {
    if (weather) return weather.isDay;
    const hours = time.getHours();
    return hours >= 7 && hours < 19;
  }, [time, weather]);

  const updateAllData = useCallback(async () => {
    try {
      const [p, o, q] = await Promise.all([
        fetchWeeklyProgram(),
        fetchEventOverride(),
        fetchQuote()
      ]);
      setPrograms(p || []);
      setOverride(o);
      if (q) setQuote(q);
    } catch (err) {
      console.error("Daten-Update Fehler:", err);
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=49.49&longitude=8.38&current=temperature_2m,is_day,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe/Berlin&forecast_days=4');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.current && data.daily) {
        const { condition } = mapWeatherCode(data.current.weather_code);
        const forecast = [];
        const days = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
        for (let i = 1; i <= 3; i++) {
          const d = new Date(); d.setDate(d.getDate() + i);
          forecast.push({
            day: days[d.getDay()],
            icon: mapWeatherCode(data.daily.weather_code).icon,
            max: Math.round(data.daily.temperature_2m_max),
            min: Math.round(data.daily.temperature_2m_min)
          });
        }
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          isDay: data.current.is_day === 1,
          condition,
          max: Math.round(data.daily.temperature_2m_max),
          min: Math.round(data.daily.temperature_2m_min),
          forecast
        });
      }
    } catch (e) {
      console.error("Wetter-Fehler:", e);
    }
  }, []);

  useEffect(() => {
    updateAllData();
    fetchWeather();
    const tInterval = setInterval(() => setTime(new Date()), 1000);
    const dInterval = setInterval(updateAllData, 300000);
    const wInterval = setInterval(fetchWeather, 900000);
    return () => { clearInterval(tInterval); clearInterval(dInterval); clearInterval(wInterval); };
  }, [updateAllData, fetchWeather]);

  return (
    <div className="relative h-screen w-screen overflow-hidden text-white font-['Inter'] flex flex-col bg-slate-950">
      <WeatherBackground code={weather?.code} isDay={currentIsDay} />

      <header className="h-[15vh] flex items-end px-[4vw] pb-[3vh] shrink-0 z-20">
        <div className="flex items-center gap-6 drop-shadow-2xl">
          <span className="text-[8vh] font-[900] tracking-tighter tabular-nums leading-none">
            {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="h-[5vh] w-0.5 bg-white/30"></div>
          <div className="flex flex-col">
            <span className="text-[3.2vh] font-black uppercase tracking-tighter leading-none">
              {time.toLocaleDateString('de-DE', { weekday: 'long' })}
            </span>
            <span className="text-[1.8vh] font-bold text-white/70 uppercase tracking-widest mt-1">
              {time.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex px-[4vw] py-[2vh] gap-[3vw] min-h-0 z-10">
        <div className="flex-[2.2] h-full overflow-hidden">
          <MealDisplay override={override} />
        </div>
        <div className="flex-[1] h-full overflow-hidden">
          <WeeklyProgram programs={programs} />
        </div>
      </main>

      <footer className="h-[10vh] bg-white text-slate-900 flex items-center justify-between px-[4vw] shrink-0 z-[100] shadow-[0_-15px_40px_rgba(0,0,0,0.3)] border-t border-slate-100">
        <div className="w-[30%] flex items-center shrink-0">
          {weather ? (
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="text-[5.5vh] leading-none drop-shadow-sm">{mapWeatherCode(weather.code).icon}</span>
                <div className="flex flex-col">
                  <span className="text-[4.2vh] font-black leading-none tabular-nums text-slate-900">{weather.temp}°</span>
                  <span className="text-[1.1vh] font-bold text-slate-400 uppercase tracking-widest mt-1">Ludwigshafen</span>
                </div>
              </div>
              <div className="h-[4.5vh] w-px bg-slate-200"></div>
              <div className="flex gap-5">
                {weather.forecast.map((f, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[1vh] font-black text-slate-400 uppercase leading-none mb-1">{f.day}</span>
                    <span className="text-[2.2vh] leading-none mb-1">{f.icon}</span>
                    <span className="text-[1.8vh] font-black text-slate-900 leading-none tabular-nums">{f.max}°</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-100"></div>
              <span className="text-[1.5vh] font-bold uppercase">Wetter lädt...</span>
            </div>
          )}
        </div>

        <div className="flex-1 px-10 text-center flex items-center justify-center">
          <p className="text-[2.2vh] font-bold italic text-slate-500 leading-tight line-clamp-2 max-w-[45vw]">
            "{quote}"
          </p>
        </div>

        <div className="w-[25%] flex justify-end items-center shrink-0">
          {!logoError ? (
            <img 
              src="/DRK-Logo_lang_RGB.png" 
              alt="DRK Logo" 
              className="h-[3.8vh] w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex flex-col items-end">
               <span className="text-[2.8vh] font-black text-red-600 uppercase tracking-tighter">DRK MELM</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;