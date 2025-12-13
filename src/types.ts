
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
  subCategory?: string; // New: Specific topic category
  isActive: boolean;
}

export interface Habit {
    id: string;
    title: string;
    type: 'boolean' | 'value'; // checkbox or counter
    target?: number; // e.g. 5 (glasses of water)
    unit?: string; // e.g. 'dl', 'km', 'pages'
    category: Category;
    isActive: boolean;
}

export interface Template {
    id: string;
    name: string;
    questions: string[]; // List of question texts
    category: Category;
    isDefault?: boolean; // New: Default template for category
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
  habitValues?: Record<string, number | boolean>; // New: Store habit data { habitId: value }
  entryMode?: 'structured' | 'free'; // New: Toggle between questions and free text
  freeTextContent?: string; // New: Content for free text mode
  mood?: string;
  photo?: string; // Legacy: Single photo (kept for compatibility)
  photos?: string[]; // New: Multiple photos
  weather?: WeatherData;
  location?: string; // Visible address/city
  gps?: { lat: number; lon: number }; // Hidden GPS coordinates
  isPrivate?: boolean; // New: Hide entire post from public
  isLocationPrivate?: boolean; // New: Hide from map only
  tags?: string[]; // New: Array of extracted hashtags
  isDraft?: boolean; // New: Draft status for auto-save
  isTrashed?: boolean; // New: Soft delete status
}

// Updated ThemeOption to include custom
export type ThemeOption = 'dark' | 'light' | 'lavender' | 'system' | 'custom' | 'holiday';
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
    accent: string; // key of ACCENT_COLORS
}

export interface TypographyConfig {
    fontFamily: string; // Google Font name or 'Custom'
    fontSize: number; // Base pixel size (e.g. 14, 16)
    customFontName?: string;
    customFontData?: string; // Base64 or Path
}

export interface SavedLocation {
    id: string;
    name: string;
    lat: number;
    lon: number;
    timestamp?: number; // New for sorting
}

export interface CloudConfig {
    enabled: boolean;
    url?: string;
    apiKey?: string;
    collectionName?: string;
}

export interface AppSettings {
  userName?: string; // Custom display name
  adminPassword?: string; // Custom password
  profileImage?: string; // For book export
  bookCoverImage?: string; // For book export
  openWeatherMapKey?: string;
  theme?: ThemeOption;
  activeHoliday?: string; // New: ID of the forced holiday theme
  customTheme?: CustomThemeConfig; // Configuration for the 'custom' theme
  typography?: TypographyConfig; // New: Font settings
  weatherIconPack?: WeatherIconPack; // New: Selected weather icon set
  emojiStyle?: EmojiStyle; // New: Selected emoji rendering style
  offlineFonts?: boolean; // New: Use local fonts for emojis/system
  savedLocations?: SavedLocation[]; // New: User saved places
  language?: string; 
  moods?: string[]; // New: Custom emojis
  cloud?: CloudConfig;
  gridLayout?: 'standard' | 'masonry'; // New: Layout preference for Grid View
  statsLayout?: string[]; // New: Order of stats widgets
  categoryConfigs?: Record<Category, CategoryConfig>; // New: View preferences per category
  publicConfig?: PublicConfig; // New: Global visibility settings
  enableStats?: boolean; // Toggle Statistics view
  enableHabits?: boolean; // New: Toggle Habit Tracker
  enableGamification?: boolean; // Toggle Streak/Gamification features
  minWordCount?: number; // New: Minimum expected word count
  showWordCount?: boolean; // New: Toggle visibility of word count
  dev?: boolean; // New: Enable Developer/Secret features
}

export interface AppData {
  questions: Question[];
  habits?: Habit[]; // New: Habit definitions
  entries: Entry[];
  settings?: AppSettings;
  templates?: Template[]; // New: Custom Templates
}

export interface QuoteData {
    text: string;
    author: string;
    date: string;
    language: string;
}
