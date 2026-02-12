import React from 'react';
import { WeatherType } from '../types';
import './WeatherBackground.css';

interface WeatherBackgroundProps {
  weatherType: WeatherType;
  hour: number;
}

const getTimeOfDay = (hour: number): 'day' | 'dusk' | 'night' => {
  if (hour >= 7 && hour < 19) return 'day';
  if (hour === 6 || hour === 19) return 'dusk';
  return 'night';
};

const RainDrop: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="raindrop" style={style}></div>
);

const StarrySky: React.FC = () => (
  <>
    <div id="stars1"></div>
    <div id="stars2"></div>
    <div id="stars3"></div>
  </>
);

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ weatherType, hour }) => {
  const timeOfDay = getTimeOfDay(hour);

  const renderRain = (isStormy: boolean) => {
    const amount = isStormy ? 150 : 80;
    const baseDuration = isStormy ? 0.5 : 0.8;
    return Array.from({ length: amount }).map((_, i) => {
      const style: React.CSSProperties = {
        left: `${Math.random() * 105 - 2.5}%`,
        animationDuration: `${baseDuration + Math.random() * 0.4}s`,
        animationDelay: `${Math.random() * 5}s`,
        transform: `rotate(${isStormy ? -15 : -8}deg)`
      };
      return <RainDrop key={i} style={style} />;
    });
  };

  const showRain = weatherType === 'rainy' || weatherType === 'stormy';
  const showStars = weatherType === 'sunny' && timeOfDay === 'night';
  
  return (
    <div className={`weather-background ${weatherType} ${timeOfDay}`}>
      {showStars && <StarrySky />}
      {weatherType === 'sunny' && timeOfDay !== 'night' && <div className="sun-glow"></div>}
      {showRain && <div className="rain-container">{renderRain(weatherType === 'stormy')}</div>}
      {weatherType === 'stormy' && <div className="storm-flash"></div>}
    </div>
  );
};

export default WeatherBackground;