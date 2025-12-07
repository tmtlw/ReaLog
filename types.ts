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
  responses: Record<string, string>; // Used for 'structured' mode
  entryMode?: 'structured' | 'free'; // New: Toggle between questions and free text
  freeTextContent?: string; // New: Content for free text mode
  mood?: string;
  photo?: string;
  weather?: WeatherData;
  location?: string; // Visible address/city
  gps?: { lat: number; lon: number }; // Hidden GPS coordinates
  isPrivate?: boolean; // New: Hide entire post from public
  isLocationPrivate?: boolean; // New: Hide from map only
}

export type ThemeOption = 'dark' | 'light' | 'lavender' | 'system';

export interface CloudConfig {
    enabled: boolean;
    url: string; // The endpoint to PUT/GET json data
    apiKey?: string; // Optional Authorization header
    collectionName?: string; // Helper for specific services if needed, usually just URL is enough
}

export interface CategoryConfig {
    viewMode: 'grid' | 'timeline' | 'calendar' | 'atlas' | 'gallery';
    includeDaily?: boolean;
    includeWeekly?: boolean;
    includeMonthly?: boolean;
}

export interface PublicConfig {
    showAtlas: boolean;
    showGallery: boolean;
}

export interface AppSettings {
  userName?: string; // Custom display name
  adminPassword?: string; // Custom password
  openWeatherMapKey?: string;
  theme?: ThemeOption;
  moods?: string[]; // New: Custom emojis
  cloud?: CloudConfig;
  categoryConfigs?: Record<Category, CategoryConfig>; // New: View preferences per category
  publicConfig?: PublicConfig; // New: Global visibility settings
}

export interface AppData {
  questions: Question[];
  entries: Entry[];
  settings?: AppSettings;
}