import { useState, useEffect } from 'react';
import { WeatherData, ForecastDay, WeatherType } from '../types';
import { OPENWEATHER_API_KEY } from '../config';

// FIX: Explicitly typing API_KEY as a string prevents TypeScript from inferring a narrow literal type,
// which caused a type error on line 31 when comparing it to a placeholder string.
const API_KEY: string = OPENWEATHER_API_KEY; 
const LAT = 49.4773; // Ludwigshafen am Rhein
const LON = 8.4452;  // Ludwigshafen am Rhein

const mapApiWeatherToWeatherType = (main: string): WeatherType => {
  const lowerMain = main.toLowerCase();
  if (lowerMain.includes('clear')) return 'sunny';
  if (lowerMain.includes('thunderstorm')) return 'stormy';
  if (lowerMain.includes('rain') || lowerMain.includes('drizzle')) return 'rainy';
  if (lowerMain.includes('clouds') || lowerMain.includes('fog') || lowerMain.includes('mist')) return 'cloudy';
  return 'cloudy';
};


export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData>({ 
    type: 'cloudy', 
    temperature: 3,
    forecast: [
      { day: 'MI', type: 'cloudy', maxTemp: 5 },
      { day: 'DO', type: 'rainy', maxTemp: 4 },
      { day: 'FR', type: 'cloudy', maxTemp: 6 },
    ]
  });

  useEffect(() => {
    if (!API_KEY || API_KEY === 'DEIN_API_SCHLÜSSEL_HIER_EINFÜGEN') {
      console.warn("OpenWeather API key not found or is a placeholder. Using mock data. Please add your key to config.ts");
      return;
    }

    const fetchWeather = async () => {
      try {
        // Fetch current weather
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=de`);
        if (!currentRes.ok) throw new Error(`Failed to fetch current weather (status: ${currentRes.status})`);
        const currentData = await currentRes.json();
        
        const currentTemperature = Math.round(currentData.main.temp);
        const currentWeatherType = mapApiWeatherToWeatherType(currentData.weather[0].main);

        // Fetch forecast
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=de`);
        if (!forecastRes.ok) throw new Error(`Failed to fetch forecast (status: ${forecastRes.status})`);
        const forecastData = await forecastRes.json();
        
        const dailyForecasts: { [key: string]: { temps: number[], types: string[] } } = {};
        const today = new Date().toISOString().split('T')[0];

        forecastData.list.forEach((item: any) => {
          const date = item.dt_txt.split(' ')[0];
          if (date === today) return;

          if (!dailyForecasts[date]) {
            dailyForecasts[date] = { temps: [], types: [] };
          }
          dailyForecasts[date].temps.push(item.main.temp_max);
          if (item.dt_txt.includes("12:00:00")) {
             dailyForecasts[date].types.unshift(item.weather[0].main);
          } else {
             dailyForecasts[date].types.push(item.weather[0].main);
          }
        });

        const forecast: ForecastDay[] = Object.keys(dailyForecasts).slice(0, 3).map(dateStr => {
          const dayData = dailyForecasts[dateStr];
          const date = new Date(dateStr);
          const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' }).slice(0, 2).toUpperCase();
          const maxTemp = Math.round(Math.max(...dayData.temps));
          const representativeType = dayData.types[0] || 'Clouds';

          return {
            day: dayName,
            type: mapApiWeatherToWeatherType(representativeType),
            maxTemp: maxTemp,
          };
        });

        setWeather({ type: currentWeatherType, temperature: currentTemperature, forecast });

      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);

  }, []);

  return weather;
};