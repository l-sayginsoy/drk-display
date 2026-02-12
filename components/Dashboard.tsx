import React from 'react';
import { useNavigate } from 'react-router-dom';
import FocusView from './FocusView';
import WeeklySchedule from './WeeklySchedule';
import BottomBar from './BottomBar';
import WeatherBackground from './WeatherBackground';
import WeatherEffect from './WeatherEffect';
import Clock from './Clock';
import { useWeather } from '../hooks/useWeather';
import { useTime } from '../hooks/useTime';
import { AppData } from '../types';

interface DashboardProps {
  appData: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ appData }) => {
  const weather = useWeather();
  const { hour, timeString, dateString } = useTime();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      {/* Layer 1: Background & Effects (always in the back) */}
      <WeatherBackground weatherType={weather.type} hour={hour} />
      <WeatherEffect weatherType={weather.type} />
      
      {/* Layer 2: UI Content (always on top) */}
      <div className="relative z-10 flex h-full w-full flex-col">
        <div className="relative flex min-h-0 flex-1 flex-col p-[2.5vmin]">
          {/* Top Row: Clock */}
          <div className="w-[66%] flex-shrink-0">
            <Clock timeString={timeString} dateString={dateString} />
          </div>

          {/* Middle Row: Content */}
          <div className="flex min-h-0 flex-1 space-x-[2.5vmin] pt-[1.5vmin]">
              {/* Left column */}
              <div className="h-full w-[66%]">
                <FocusView 
                  urgentMessage={appData.urgentMessage}
                  meals={appData.meals}
                  slideshow={appData.slideshow}
                />
              </div>
              {/* Right column */}
              <div className="h-full w-[34%]">
                  <WeeklySchedule weeklySchedule={appData.weeklySchedule} />
              </div>
          </div>
        </div>

        {/* Bottom row: Footer */}
        <div className="flex-shrink-0">
            <BottomBar weather={weather} quote={appData.quotes[new Date().getDate() % appData.quotes.length]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;