export interface UrgentMessage {
  active: boolean;
  title: string;
  text: string;
  imageUrl: string;
  activeUntil: string; // Format "HH:mm"
}

export interface Meal {
  name: string;
  startTime: { hour: number; minute: number };
  endTime: { hour: number; minute: number };
  imageUrl: string;
}

export interface SlideshowImage {
  id: string;
  url: string;
  caption: string;
}

export interface SlideshowData {
  active: boolean;
  activeUntil: string; // Format "HH:mm"
  images: SlideshowImage[];
}

export interface Event {
  id: string;
  time: string;
  title: string;
  location: string;
}

export interface DaySchedule {
  day: string;
  events: Event[];
}

export interface WeeklyScheduleData {
  [kw: string]: DaySchedule[];
}

export interface AppData {
  urgentMessage: UrgentMessage;
  meals: Meal[];
  slideshow: SlideshowData;
  weeklySchedule: WeeklyScheduleData;
  quotes: string[];
  locations: string[];
}

export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'stormy';

export interface ForecastDay {
  day: string;
  type: WeatherType;
  maxTemp: number;
}

export interface WeatherData {
  type: WeatherType;
  temperature: number;
  forecast: ForecastDay[];
}