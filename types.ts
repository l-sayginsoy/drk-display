
export interface WeeklyActivity {
  id: string; // Format: YYYY-Www-DAY
  day: string;
  title: string;
  location: string;
  time: string;
}

export interface EventConfig {
  active: boolean;
  image: string;
  start: string;
  end: string;
}

export interface WeekInfo {
  year: number;
  weekNumber: number;
  label: string;
  startDate: Date;
}
