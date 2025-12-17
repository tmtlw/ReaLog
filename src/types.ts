
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
  subCategory?: string;
  isActive: boolean;
}

export interface Habit {
    id: string;
    title: string;
    type: 'boolean' | 'value';
    target?: number;
    unit?: string;
    icon?: string;
    category: Category;
    isActive: boolean;
}

export interface Notebook {
    id: string;
    name: string;
    icon?: string;
}

export interface Template {
    id: string;
    name: string;
    questions: string[];
    category: Category;
    isDefault?: boolean;
}

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  icon?: string;
}

export interface Entry {
  id: string;
  notebookId?: string;
  timestamp: number;
  dateLabel: string;
  title?: string;
  category: Category;
  responses: Record<string, string>;
  habitValues?: Record<string, number | boolean>;
  entryMode?: 'structured' | 'free';
  freeTextContent?: string;
  mood?: string;
  photo?: string;
  photos?: string[];
  weather?: WeatherData;
  location?: string;
  gps?: { lat: number; lon: number };
  isPrivate?: boolean;
  isLocationPrivate?: boolean;
  tags?: string[];
  isDraft?: boolean;
  isTrashed?: boolean;
  isFavorite?: boolean;
}

export type ThemeOption = 'dark' | 'light' | 'lavender' | 'nord' | 'forest' | 'ocean' | 'sunset' | 'coffee' | 'rose' | 'cyberpunk' | 'system' | 'custom' | 'holiday';
export type WeatherIconPack = 'outline' | 'filled' | 'color' | 'emoji' | 'ascii' | 'thin' | 'bold' | 'cartoon' | 'mono-duotone' | 'neon';
export type EmojiStyle = 'noto' | 'noto-mono' | 'openmoji' | 'emojidex' | 'native' | 'grayscale' | 'sepia' | 'neon' | 'pop' | 'soft' | 'retro' | 'glitch';

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

export interface CustomThemeConfig {
    base: 'light' | 'dark';
    accent: string;
    customBg?: string;
}

export interface TypographyConfig {
    fontFamily: string;
    fontSize: number;
    customFontName?: string;
    customFontData?: string;
}

export interface SavedLocation {
    id: string;
    name: string;
    lat: number;
    lon: number;
    timestamp?: number;
}

export interface CloudConfig {
    enabled: boolean;
    url?: string;
    apiKey?: string;
    collectionName?: string;
}

export interface AppSettings {
  userName?: string;
  adminPassword?: string;
  profileImage?: string;
  bookCoverImage?: string;
  theme?: ThemeOption;
  activeHoliday?: string;
  customTheme?: CustomThemeConfig;
  typography?: TypographyConfig;
  weatherIconPack?: WeatherIconPack;
  emojiStyle?: EmojiStyle;
  offlineFonts?: boolean;
  savedLocations?: SavedLocation[];
  language?: string; 
  moods?: string[];
  cloud?: CloudConfig;
  gridLayout?: 'standard' | 'masonry';
  statsLayout?: string[];
  entryModalLayout?: string[];
  entryMapSize?: 'small' | 'medium' | 'large';
  categoryConfigs?: Record<Category, CategoryConfig>;
  publicConfig?: PublicConfig;
  enableStats?: boolean;
  enableHabits?: boolean;
  enableGamification?: boolean;
  minWordCount?: number;
  showWordCount?: boolean;
  dev?: boolean;
}

export interface AppData {
  questions: Question[];
  habits?: Habit[];
  entries: Entry[];
  settings?: AppSettings;
  templates?: Template[];
}

export interface QuoteData {
    text: string;
    author: string;
    date: string;
    language: string;
}
