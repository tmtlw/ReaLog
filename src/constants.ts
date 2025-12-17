
import { Category, AppData } from './types';
import { DEFAULT_QUESTIONS } from './data/questions';
import { DEFAULT_HABITS } from './data/habits';
import { SAMPLE_ENTRIES } from './data/samples';

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

// Re-export for compatibility
export { DEFAULT_QUESTIONS, DEFAULT_HABITS, SAMPLE_ENTRIES };

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
    dev: true,
    entryModalLayout: ['header', 'tags', 'content', 'map', 'habits', 'gallery'],
    entryMapSize: 'medium'
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
