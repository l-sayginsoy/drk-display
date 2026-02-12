import React from 'react';
import { useNavigate } from 'react-router-dom';
import FocusView from './FocusView';
import WeeklySchedule from './WeeklySchedule';
import BottomBar from './BottomBar';
import WeatherBackground from './WeatherBackground';
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
    <div className="w-screen h-screen bg-black text-white overflow-hidden flex flex-col">
      <WeatherBackground weatherType={weather.type} hour={hour} />
      
      <div className="relative flex-1 flex flex-col min-h-0 p-[2.5vmin]">
        {/* Top Row: Clock */}
        <div className="w-[66%] flex-shrink-0">
          <Clock timeString={timeString} dateString={dateString} />
        </div>

        {/* Middle Row: Content */}
        <div className="flex-1 flex space-x-[2.5vmin] min-h-0 pt-[1.5vmin]">
            {/* Left column */}
            <div className="w-[66%] h-full">
              <FocusView 
                urgentMessage={appData.urgentMessage}
                meals={appData.meals}
                slideshow={appData.slideshow}
              />
            </div>
            {/* Right column */}
            <div className="w-[34%] h-full">
                <WeeklySchedule weeklySchedule={appData.weeklySchedule} />
            </div>
        </div>
      </div>

      {/* Bottom row: Footer */}
      <div className="flex-shrink-0">
          {/* FIX: Correctly reference appData from props instead of an undefined 'app' variable. */}
          <BottomBar weather={weather} quote={appData.quotes[new Date().getDate() % appData.quotes.length]} />
      </div>
    </div>
  );
};

export default Dashboard;