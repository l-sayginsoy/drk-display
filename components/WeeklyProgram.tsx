
import React from 'react';
import { WeeklyProgram as IWeeklyProgram } from '../types';
import { DAYS_ORDER } from '../constants';

const WeeklyProgram: React.FC<{ programs: IWeeklyProgram[] }> = ({ programs }) => {
  const now = new Date();
  
  const getWeekNumber = (d: Date) => {
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  };

  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const result = new Date(d);
    result.setDate(diff);
    return result;
  };

  const monday = getMonday(new Date(now));
  const todayIndex = now.getDay(); 
  const todayMapped = todayIndex === 0 ? 6 : todayIndex - 1;
  const todayStr = DAYS_ORDER[todayMapped];
  const kw = getWeekNumber(now);

  const groupedPrograms = (programs || []).reduce((acc, p) => {
    if (!p.day) return acc;
    const dayClean = p.day.trim().toUpperCase();
    let dayKey = '';
    
    if (dayClean.startsWith('MO')) dayKey = 'MO';
    else if (dayClean.startsWith('DI')) dayKey = 'DI';
    else if (dayClean.startsWith('MI')) dayKey = 'MI';
    else if (dayClean.startsWith('DO')) dayKey = 'DO';
    else if (dayClean.startsWith('FR')) dayKey = 'FR';
    else if (dayClean.startsWith('SA')) dayKey = 'SA';
    else if (dayClean.startsWith('SO')) dayKey = 'SO';

    if (dayKey) {
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(p);
    }
    return acc;
  }, {} as Record<string, IWeeklyProgram[]>);

  return (
    <div className="bg-white rounded-[3vh] border border-white h-full p-[2.5vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden relative">
      <div className="flex justify-between items-center mb-[2.5vh] px-2 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-[2.4vh] font-[900] text-slate-900 uppercase tracking-tight leading-none">Wochenplan</h2>
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200">
          <span className="text-[1.6vh] font-black text-slate-800 tracking-tighter">KW {kw}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-[1.2vh] min-h-0 relative z-10">
        {DAYS_ORDER.map((day, index) => {
          const isToday = day === todayStr;
          const dayPrograms = groupedPrograms[day] || [];
          const hasProgram = dayPrograms.length > 0;
          
          const dateOfRow = new Date(monday);
          dateOfRow.setDate(monday.getDate() + index);
          const dateStr = dateOfRow.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

          return (
            <div 
              key={day} 
              className={`relative flex flex-col flex-1 min-h-0 rounded-[1.5vh] transition-all duration-300 border shadow-sm ${
                isToday 
                ? 'bg-blue-600 border-blue-600 z-20 shadow-xl' 
                : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center h-full">
                {/* Tag & Datum Block */}
                <div className="w-[5.5vw] shrink-0 flex flex-col items-center justify-center h-full">
                  <span className={`text-[2.1vh] font-[800] leading-none ${isToday ? 'text-white' : 'text-black'}`}>
                    {day}
                  </span>
                  <span className={`text-[1.5vh] font-bold mt-1 tabular-nums ${isToday ? 'text-blue-100' : 'text-slate-500'}`}>
                    {dateStr}
                  </span>
                </div>

                {/* Trennlinie */}
                <div className={`h-[50%] w-[1px] shrink-0 ${isToday ? 'bg-white/30' : 'bg-slate-300'}`}></div>

                {/* Termine */}
                <div className="flex-1 flex flex-col justify-center px-6 overflow-hidden">
                  {hasProgram ? (
                    <div className="space-y-1">
                      {dayPrograms.map((prog, pIdx) => (
                        <div key={pIdx} className="flex items-center justify-between gap-4">
                          <div className="flex flex-col min-w-0">
                            <h3 className={`text-[2.1vh] font-bold truncate leading-tight ${isToday ? 'text-white' : 'text-black'}`}>
                              {prog.title}
                            </h3>
                            {prog.location && (
                              <span className={`text-[1.5vh] font-semibold truncate ${isToday ? 'text-blue-50' : 'text-slate-500'}`}>
                                {prog.location}
                              </span>
                            )}
                          </div>
                          
                          {/* Zeitrahmen */}
                          <div className={`shrink-0 px-4 py-1.5 rounded-full border-[2.5px] ${
                            isToday ? 'bg-white border-white shadow-sm' : 'bg-white border-blue-600'
                          }`}>
                            <span className="text-[1.8vh] font-bold tabular-nums leading-none text-blue-600">
                              {prog.time || '--:--'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-[1.4vh] font-bold italic ${isToday ? 'text-blue-100' : 'text-slate-400'}`}>
                      Keine Veranstaltungen
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyProgram;
