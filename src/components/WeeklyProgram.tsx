import React from 'react';
import { WeeklyProgram as IWeeklyProgram } from './types';
import { DAYS_ORDER } from './constants';

interface WeeklyProgramProps {
  programs: IWeeklyProgram[];
}

const WeeklyProgram: React.FC<WeeklyProgramProps> = ({ programs }) => {
  const getCurrentWeekPrograms = () => {
    const now = new Date();
    const currentWeekStr = `${now.getFullYear()}-W${String(getWeekNumber(now)).padStart(2, '0')}`;
    
    // Filter aktuelle Woche
    const currentWeek = programs.filter(p => p.day.startsWith(currentWeekStr));
    
    if (currentWeek.length > 0) {
      return currentWeek.map(p => ({
        day: p.day.split(' | ') || p.day,
        title: p.title,
        location: p.location,
        time: p.time
      }));
    }
    
    // Fallback auf Standard-Wochenprogramm
    return programs.filter(p => !p.day.includes('-W')).slice(0, 7);
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  };

  const sortedPrograms = getCurrentWeekPrograms().sort((a, b) => {
    const indexA = DAYS_ORDER.indexOf(a.day);
    const indexB = DAYS_ORDER.indexOf(b.day);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return (
    <div className="h-full bg-white/10 backdrop-blur-md rounded-[3vh] p-[3vh] border border-white/20 shadow-2xl">
      <h2 className="text-[2.8vh] font-black text-white uppercase tracking-tighter mb-[2vh] text-center">
        Wochenprogramm
      </h2>
      
      <div className="space-y-[1.5vh] h-[calc(100%-5vh)] overflow-y-auto">
        {sortedPrograms.map((program, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm rounded-[2vh] p-[2vh] border border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[1.4vh] font-black text-white/60 uppercase tracking-widest bg-white/10 px-2 py-1 rounded-full">
                    {program.day}
                  </span>
                  {program.time && program.time !== '-' && (
                    <span className="text-[1.2vh] font-bold text-white/70">
                      {program.time}
                    </span>
                  )}
                </div>
                
                {program.title && program.title !== '-' && (
                  <h3 className="text-[1.8vh] font-bold text-white leading-tight mb-1">
                    {program.title}
                  </h3>
                )}
                
                {program.location && program.location !== '-' && (
                  <p className="text-[1.4vh] text-white/70 leading-tight">
                    📍 {program.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {sortedPrograms.length === 0 && (
          <div className="text-center text-white/50 text-[1.8vh] font-medium">
            Kein Programm verfügbar
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyProgram;