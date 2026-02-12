
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

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ weatherType, hour }) => {
  const timeOfDay = getTimeOfDay(hour);

  return (
    <div className={`weather-background ${weatherType} ${timeOfDay}`}></div>
  );
};

export default WeatherBackground;