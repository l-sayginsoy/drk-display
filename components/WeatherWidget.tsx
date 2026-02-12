
import React from 'react';
import { Sun, Cloud, CloudRain, CloudFog, Zap } from 'lucide-react';
import { WeatherData, WeatherType } from '../types';

interface WeatherForecastWidgetProps {
  weather: WeatherData;
}

const getWeatherIcon = (type: WeatherType, sizeClass: string) => {
  const commonProps = { className: sizeClass, strokeWidth: 2 };
  switch (type) {
    case 'sunny':
      return <Sun {...commonProps} color="#FFD700" />;
    case 'rainy':
      return <CloudRain {...commonProps} color="#60A5FA" />;
    case 'cloudy':
      return <Cloud {...commonProps} color="#9CA3AF" />;
    case 'stormy':
       return <Zap {...commonProps} color="#FBBF24" />;
    default:
      return <CloudFog {...commonProps} color="#9CA3AF" />;
  }
};

const WeatherForecastWidget: React.FC<WeatherForecastWidgetProps> = ({ weather }) => {
  return (
    <div className="flex items-center space-x-[1.8vmin]">
      {/* Current Weather */}
      <div className="flex items-center space-x-[1.2vmin]">
        {getWeatherIcon(weather.type, 'w-[clamp(32px,5.5vmin,50px)] h-[clamp(32px,5.5vmin,50px)]')}
        <div className="flex flex-col leading-none">
            <span className="font-black text-black" style={{ fontSize: 'clamp(2rem, 5.5vmin, 4rem)' }}>{weather.temperature}°</span>
            <span className="font-bold text-gray-500" style={{ fontSize: 'clamp(0.7rem, 1.6vmin, 1.1rem)' }}>LUDWIGSHAFEN</span>
        </div>
      </div>
      
      {/* Forecast */}
      <div className="flex items-center space-x-[1.5vmin]">
        {weather.forecast.map((day) => (
          <div key={day.day} className="flex flex-col items-center">
            <span className="font-bold text-gray-500" style={{ fontSize: 'clamp(0.7rem, 1.6vmin, 1rem)' }}>{day.day}</span>
            {getWeatherIcon(day.type, 'w-[clamp(20px,3vmin,28px)] h-[clamp(20px,3vmin,28px)]')}
            <span className="font-bold text-black" style={{ fontSize: 'clamp(0.8rem, 2vmin, 1.25rem)' }}>{day.maxTemp}°</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherForecastWidget;
