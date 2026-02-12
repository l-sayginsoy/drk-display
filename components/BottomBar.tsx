
import React from 'react';
import WeatherForecastWidget from './WeatherWidget';
import { WeatherData } from '../types';

interface BottomBarProps {
  weather: WeatherData;
  quote: string;
}

const BottomBar: React.FC<BottomBarProps> = ({ weather, quote }) => {
  return (
    <div className="relative w-full flex items-center justify-between px-[3.5vmin] bg-white text-black h-[10vmin] min-h-[60px] max-h-[100px]">
      <div className="flex-shrink-0">
        <WeatherForecastWidget weather={weather} />
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4">
        <p className="font-semibold text-gray-700 text-center truncate" style={{ fontSize: 'clamp(0.8rem, 2.2vmin, 1.5rem)', lineHeight: '1.2' }}>"{quote}"</p>
      </div>
      <div className="flex-shrink-0">
        <img src="assets/drk-logo.png" alt="Deutsches Rotes Kreuz Logo" className="h-[4.5vmin] min-h-[30px] max-h-[50px]" />
      </div>
    </div>
  );
};

export default BottomBar;