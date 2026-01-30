
export interface WeeklyProgram {
  day: string;
  title: string;
  location: string;
  time: string;
}

export interface EventOverride {
  active: boolean;
  image: string | null;
  start: string | null;
  end: string | null;
}

export interface ForecastDay {
  day: string;
  icon: string;
  max: number;
  min: number;
}

export interface WeatherData {
  temp: number;
  code: number;
  isDay: boolean;
  condition: string;
  max: number;
  min: number;
  forecast: ForecastDay[];
}

export interface StatsItem {
  label: string;
  value: string;
  trend: number;
  icon: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'efficiency' | 'growth' | 'risk';
  timestamp: string;
}

export interface SearchResult {
  title: string;
  uri: string;
}
