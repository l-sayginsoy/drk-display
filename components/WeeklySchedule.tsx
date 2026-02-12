
import React from 'react';
import { useTime } from '../hooks/useTime';
import { WeeklyScheduleData, Event } from '../types';

interface WeeklyScheduleProps {
  weeklySchedule: WeeklyScheduleData;
}

const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const dayAbbreviations = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];

// Component to display a single event in the new format
const EventDisplay: React.FC<{ event: Event }> = ({ event }) => (
    <>
      <div className="flex-1">
        <p className="font-semibold leading-tight truncate" style={{ fontSize: 'clamp(0.85rem, 2vmin, 1.3rem)' }}>
            {event.title}
        </p>
        <p className="text-sm opacity-70 leading-tight truncate mt-2" style={{ fontSize: 'clamp(0.75rem, 1.7vmin, 1.1rem)' }}>
            {event.location}
        </p>
      </div>
      <div className="font-bold text-right pl-2" style={{ fontSize: 'clamp(0.9rem, 2.1vmin, 1.4rem)' }}>
        {event.time}
      </div>
    </>
);

// Component for the placeholder when no events are scheduled
const NoEventDisplay: React.FC<{ isToday: boolean }> = ({ isToday }) => (
    <div className={`border-2 border-dashed rounded-lg px-3 py-1 ml-auto ${isToday ? 'border-white/50' : 'border-blue-300'}`}>
        <p className={`font-mono font-bold tracking-widest ${isToday ? 'text-white/70' : 'text-blue-500'}`} style={{ fontSize: 'clamp(0.8rem, 1.8vmin, 1.2rem)' }}>--:--</p>
    </div>
);

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ weeklySchedule }) => {
  const { calendarWeek, dayOfWeekIndex, getShortDate, now } = useTime();
  
  const currentWeekSchedule = weeklySchedule[calendarWeek] || [];

  const getDayDate = (index: number): string => {
    const today = now;
    const dayDiff = index - dayOfWeekIndex;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayDiff);
    return getShortDate(targetDate);
  }

  return (
    <div className="w-full h-full bg-white/95 backdrop-blur-sm text-gray-800 rounded-3xl p-[2.5vmin] flex flex-col shadow-lg">
      <div className="flex justify-between items-center mb-[2vmin]">
        <h2 className="font-bold tracking-wide" style={{ fontSize: 'clamp(1rem, 2.5vmin, 1.75rem)' }}>WOCHENPLAN</h2>
        <div className="bg-gray-200/70 text-gray-600 font-bold px-3 py-1 rounded-full" style={{ fontSize: 'clamp(0.9rem, 2vmin, 1.5rem)' }}>
          KW{calendarWeek}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between min-h-0">
        {dayAbbreviations.map((abbr, index) => {
          const isToday = index === dayOfWeekIndex;
          const dayData = currentWeekSchedule.find(d => d.day === dayNames[index]) || { day: dayNames[index], events: [] };
          const firstEvent = dayData.events[0];
          
          return (
            <div
              key={abbr}
              className={`flex items-center px-[1vmin] py-[1.5vmin] rounded-2xl transition-all duration-300 ${isToday ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100/80 text-gray-800'}`}
            >
              <div className="flex items-center w-[17%]">
                <div className="flex flex-col text-center w-full">
                  <p className={`font-extrabold leading-none`} style={{ fontSize: 'clamp(1.1rem, 2.6vmin, 1.8rem)' }}>{abbr}</p>
                  <p className={`font-semibold leading-tight opacity-80`} style={{ fontSize: 'clamp(0.8rem, 1.9vmin, 1.3rem)' }}>{getDayDate(index)}</p>
                </div>
              </div>

              <div className={`w-px h-10 mx-[1.8vmin] ${isToday ? 'bg-white/30' : 'bg-gray-200'}`}></div>

              <div className="flex-1 flex justify-between items-center overflow-hidden pr-[2vmin]">
                {firstEvent ? <EventDisplay event={firstEvent} /> : <NoEventDisplay isToday={isToday} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklySchedule;
