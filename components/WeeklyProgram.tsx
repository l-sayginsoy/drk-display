
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

  const monday = new Date(now);
  monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  
  const todayIndex = now.getDay(); 
  const todayMapped = todayIndex === 0 ? 6 : todayIndex - 1;
  const todayStr = DAYS_ORDER[todayMapped];
  const kw = getWeekNumber(now);

  const groupedPrograms = (programs || []).reduce((acc, p) => {
    if (!p.day) return acc;
    const d = p.day.toUpperCase().trim();
    
    let key = '';
    if (d.startsWith('MO')) key = 'MO';
    else if (d.startsWith('DI')) key = 'DI';
    else if (d.startsWith('MI')) key = 'MI';
    else if (d.startsWith('DO')) key = 'DO';
    else if (d.startsWith('FR')) key = 'FR';
    else if (d.startsWith('SA')) key = 'SA';
    else if (d.startsWith('SO')) key = 'SO';

    if (key) {
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
    }
    return acc;
  }, {} as Record<string, IWeeklyProgram[]>);

  return (
    <div className="bg-white rounded-[3vh] border border-white h-full p-[2.5vh] flex flex-col shadow-2xl overflow-hidden">
      <div className="flex justify-between items-center mb-[2vh] px-2 shrink-0">
        <h2 className="text-[2.4vh] font-[900] text-slate-900 uppercase tracking-tight">Wochenplan</h2>
        <div className="bg-slate-100 px-4 py-1.5 rounded-xl border border-slate-200">
          <span className="text-[1.6vh] font-black text-slate-500 tracking-tighter uppercase">KW {kw}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-[1vh] min-h-0">
        {DAYS_ORDER.map((day, index) => {
          const isToday = day === todayStr;
          const dayPrograms = groupedPrograms[day] || [];
          const dateOfRow = new Date(monday);
          dateOfRow.setDate(monday.getDate() + index);

          return (
            <div 
              key={day} 
              className={`flex-1 flex items-center rounded-[1.8vh] px-5 transition-all border ${
                isToday ? 'bg-blue-600 border-blue-500 shadow-lg scale-[1.02] z-10' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="w-[5vw] flex flex-col items-center justify-center shrink-0">
                <span className={`text-[2.2vh] font-[900] leading-none ${isToday ? 'text-white' : 'text-slate-900'}`}>{day}</span>
                <span className={`text-[1.4vh] font-bold mt-0.5 ${isToday ? 'text-blue-100' : 'text-slate-400'}`}>
                  {dateOfRow.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
              <div className={`h-[50%] w-px mx-5 ${isToday ? 'bg-white/20' : 'bg-slate-200'}`}></div>
              <div className="flex-1 min-w-0">
                {dayPrograms.length > 0 ? (
                  <div className="flex justify-between items-center">
                    <div className="min-w-0 pr-4">
                      <h3 className={`text-[2vh] font-bold truncate leading-tight ${isToday ? 'text-white' : 'text-slate-900'}`}>{dayPrograms[0].title}</h3>
                      <p className={`text-[1.4vh] font-semibold truncate ${isToday ? 'text-blue-50' : 'text-slate-500'}`}>{dayPrograms[0].location}</p>
                    </div>
                    <div className={`shrink-0 px-3 py-1 rounded-lg border-2 ${isToday ? 'bg-white border-white' : 'bg-white border-blue-600'}`}>
                      <span className="text-[1.8vh] font-black tabular-nums text-blue-600">{dayPrograms[0].time || '--:--'}</span>
                    </div>
                  </div>
                ) : (
                  <span className={`text-[1.4vh] font-bold italic ${isToday ? 'text-blue-200' : 'text-slate-300'}`}>Keine Veranstaltungen</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyProgram;
