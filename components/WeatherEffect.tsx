import React from 'react';
import { WeatherType } from '../types';
import './WeatherEffect.css';

interface WeatherEffectProps {
  weatherType: WeatherType;
}

const WeatherEffect: React.FC<WeatherEffectProps> = ({ weatherType }) => {
  const renderEffect = () => {
    switch (weatherType) {
      case 'rainy':
        return (
          <div className="rain">
            {Array.from({ length: 50 }).map((_, i) => (
              <i key={i} className="drop"></i>
            ))}
          </div>
        );
      case 'snow':
         return (
          <div className="snow">
            {Array.from({ length: 50 }).map((_, i) => (
              <i key={i} className="flake"></i>
            ))}
          </div>
        );
      case 'stormy':
        // Storm effects can be distracting, so we keep it subtle.
        // A gentle darkness is applied via WeatherBackground.css
        return null;
      case 'sunny':
      case 'cloudy':
      default:
        return null;
    }
  };

  return <div className="weather-effect-container">{renderEffect()}</div>;
};

export default WeatherEffect;