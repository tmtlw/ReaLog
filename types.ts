export enum Category {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface Question {
  id: string;
  text: string;
  category: Category;
  isActive: boolean;
}

export interface WeatherData {
  temp: number;
  condition: string; // e.g., 'Clouds', 'Clear'
  location: string;
  icon?: string;
}

export interface Entry {
  id: string;
  timestamp: number;
  dateLabel: string;
  title?: string;
  category: Category;
  responses: Record<string, string>;
  aiAnalysis?: string;
  mood?: string;
  photo?: string;
  weather?: WeatherData;
  location?: string; // New: Visible address/city
  gps?: { lat: number; lon: number }; // New: Hidden GPS coordinates
}

export type ThemeOption = 'dark' | 'light' | 'lavender' | 'system';

export interface AppSettings {
  openWeatherMapKey?: string;
  theme?: ThemeOption;
}

export interface AppData {
  questions: Question[];
  entries: Entry[];
  settings?: AppSettings;
}