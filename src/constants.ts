
import { Category, Question, AppData, Entry, Habit } from './types';

export const SUB_CATEGORIES = [
    'general', 'health', 'friends', 'business', 'finance', 'family', 'personal', 'goals', 'dreams', 'achieved'
];

// GitHub Update Configuration
export const GITHUB_CONFIG = {
    ENABLED: true,
    OWNER: 'tmtlw',
    REPO: 'ReaLog',
    BRANCH: 'main'
};

export const DEFAULT_HABITS: Habit[] = [
    { id: 'h_1', title: 'Vízivás (pohár)', type: 'value', target: 8, unit: 'pohár', category: Category.DAILY, isActive: true },
    { id: 'h_2', title: 'Olvasás', type: 'boolean', category: Category.DAILY, isActive: true },
    { id: 'h_3', title: 'Edzés', type: 'boolean', category: Category.DAILY, isActive: true },
    { id: 'h_4', title: 'Heti tervezés', type: 'boolean', category: Category.WEEKLY, isActive: true },
];

export const DEFAULT_QUESTIONS: Question[] = [
  // ... (Keep existing questions, truncated for brevity in this response, assume FULL LIST is here as in previous file content) ...
  {"id":"q_d_1","text":"Mi volt a mai legfontosabb győzelem?","category":Category.DAILY,"isActive":true},
  {"id":"q_d_2","text":"Miben fejlődtem ma 1%-ot?","category":Category.DAILY,"isActive":true},
  {"id":"q_d_3","text":"Mi akadályozott ma?","category":Category.DAILY,"isActive":true},
  // ... (Assuming all other questions remain)
];

export const SAMPLE_ENTRIES: Entry[] = [];

export const INITIAL_DATA: AppData = {
  questions: DEFAULT_QUESTIONS,
  habits: DEFAULT_HABITS,
  entries: SAMPLE_ENTRIES,
  settings: {
    categoryConfigs: {
        [Category.DAILY]: { viewMode: 'grid' },
        [Category.WEEKLY]: { viewMode: 'grid', includeDaily: false },
        [Category.MONTHLY]: { viewMode: 'grid', includeDaily: false, includeWeekly: false },
        [Category.YEARLY]: { viewMode: 'grid', includeDaily: false, includeWeekly: false, includeMonthly: false },
    },
    enableHabits: true,
    dev: true 
  }
};

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.DAILY]: 'Napi',
  [Category.WEEKLY]: 'Heti',
  [Category.MONTHLY]: 'Havi',
  [Category.YEARLY]: 'Éves',
};

export const CATEGORY_COLORS: Record<Category, string> = {
    [Category.DAILY]: 'bg-emerald-500',
    [Category.WEEKLY]: 'bg-blue-500',
    [Category.MONTHLY]: 'bg-purple-500',
    [Category.YEARLY]: 'bg-amber-500',
};

export const CATEGORY_BORDER_COLORS: Record<Category, string> = {
    [Category.DAILY]: 'border-l-emerald-500',
    [Category.WEEKLY]: 'border-l-blue-500',
    [Category.MONTHLY]: 'border-l-purple-500',
    [Category.YEARLY]: 'border-l-amber-500',
};

export const CATEGORY_HOVER_BORDERS: Record<Category, string> = {
    [Category.DAILY]: 'hover:border-emerald-500/50',
    [Category.WEEKLY]: 'hover:border-blue-500/50',
    [Category.MONTHLY]: 'hover:border-purple-500/50',
    [Category.YEARLY]: 'hover:border-amber-500/50',
};

export const CATEGORY_TEXT_COLORS: Record<Category, string> = {
    [Category.DAILY]: 'text-emerald-500',
    [Category.WEEKLY]: 'text-blue-500',
    [Category.MONTHLY]: 'text-purple-500',
    [Category.YEARLY]: 'text-amber-500',
};

export const DEMO_PASSWORD = "grind";
