
// Theme definitions and types

export interface ThemeColors {
    bg: string;
    text: string;
    card: string;
    input: string;
    nav: string;
    accent: string;
    primaryBtn: string;
    secondaryBtn: string;
    subtext: string;
    statusBar: string;
}

export type ThemeKey = 'dark' | 'light' | 'lavender' | 'nord' | 'forest' | 'ocean' | 'sunset' | 'coffee' | 'rose' | 'cyberpunk' | 'system' | 'custom' | 'holiday';

// Helper to generate tailwind classes from hex and determine text color
const c = (hex: string, label: string) => {
    // Simple heuristic for light colors to use black text
    const lightColors = ['#eab308', '#facc15', '#fde047', '#bef264', '#84cc16', '#a3e635', '#4ade80', '#22d3ee', '#67e8f9', '#c084fc', '#f472b6', '#fb7185', '#fb923c', '#fdba74', '#ffffff', '#e5e7eb'];
    const textCol = lightColors.includes(hex.toLowerCase()) ? 'text-black' : 'text-white';
    
    return {
        label,
        hex,
        text: `text-[${hex}]`,
        btn: `bg-[${hex}] hover:opacity-90`,
        ring: `focus:ring-[${hex}]`,
        textOnBtn: textCol
    };
};

// Accent Colors
export const ACCENT_COLORS = {
    c1: c('#ef4444', 'Red'),
    c2: c('#dc2626', 'Dark Red'),
    c3: c('#f87171', 'Light Red'),
    c4: c('#be123c', 'Rose'),
    c5: c('#ec4899', 'Pink'),
    c6: c('#db2777', 'Dark Pink'),
    c7: c('#f472b6', 'Light Pink'),
    c8: c('#e11d48', 'Crimson'),
    c9: c('#9f1239', 'Maroon'),
    c10: c('#fb7185', 'Salmon'),
    c11: c('#f97316', 'Orange'),
    c12: c('#ea580c', 'Dark Orange'),
    c13: c('#fb923c', 'Light Orange'),
    c15: c('#d97706', 'Dark Amber'),
    c16: c('#eab308', 'Yellow'),
    c17: c('#ca8a04', 'Gold'),
    c18: c('#fbbf24', 'Sunflower'),
    c19: c('#854d0e', 'Bronze'),
    c20: c('#fdba74', 'Peach'),
    c22: c('#059669', 'Dark Emerald'),
    c23: c('#34d399', 'Light Emerald'),
    c24: c('#22c55e', 'Green'),
    c25: c('#16a34a', 'Forest'),
    c26: c('#84cc16', 'Lime'),
    c27: c('#65a30d', 'Dark Lime'),
    c28: c('#14b8a6', 'Teal'),
    c29: c('#0d9488', 'Dark Teal'),
    c30: c('#065f46', 'Pine'),
    c31: c('#3b82f6', 'Blue'),
    c33: c('#60a5fa', 'Sky Blue'),
    c34: c('#0ea5e9', 'Sky'),
    c35: c('#0284c7', 'Deep Sky'),
    c36: c('#06b6d4', 'Cyan'),
    c37: c('#6366f1', 'Indigo'),
    c38: c('#4f46e5', 'Deep Indigo'),
    c39: c('#1e40af', 'Navy'),
    c40: c('#1e3a8a', 'Midnight'),
    c41: c('#8b5cf6', 'Violet'),
    c42: c('#7c3aed', 'Dark Violet'),
    c43: c('#a78bfa', 'Lavender'),
    c45: c('#9333ea', 'Deep Purple'),
    c46: c('#d946ef', 'Fuchsia'),
    c47: c('#c026d3', 'Magenta'),
    c48: c('#86198f', 'Plum'),
    c49: c('#701a75', 'Berry'),
    c50: c('#4a044e', 'Dark Orchid'),
};

export const generateCustomTheme = (base: 'light' | 'dark', accentKey: keyof typeof ACCENT_COLORS, customBg?: string): ThemeColors => {
    const accent = ACCENT_COLORS[accentKey] || ACCENT_COLORS['c22'];
    const bgColor = customBg ? 'bg-transparent' : (base === 'dark' ? 'bg-zinc-950' : 'bg-slate-50');
    
    if (base === 'dark') {
        return {
            bg: bgColor,
            text: 'text-zinc-100',
            card: 'bg-zinc-900 border-zinc-800',
            input: `bg-zinc-950 border-zinc-700 ${accent.ring} text-zinc-100`,
            nav: 'bg-zinc-900/90 border-zinc-800',
            accent: accent.text,
            primaryBtn: `${accent.btn} ${accent.textOnBtn}`,
            secondaryBtn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700',
            subtext: 'text-zinc-400',
            statusBar: 'bg-zinc-900 border-zinc-800 text-zinc-400'
        };
    } else {
        return {
            bg: bgColor,
            text: 'text-slate-900',
            card: 'bg-white border-slate-200 shadow-sm',
            input: `bg-white border-slate-300 ${accent.ring} text-slate-900`,
            nav: 'bg-white/90 border-slate-200',
            accent: accent.text,
            primaryBtn: `${accent.btn} ${accent.textOnBtn}`,
            secondaryBtn: 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300',
            subtext: 'text-slate-500',
            statusBar: 'bg-white border-slate-200 text-slate-600'
        };
    }
};

const darkAccent = ACCENT_COLORS['c22'];
const lightAccent = ACCENT_COLORS['c22'];
const lavenderAccent = ACCENT_COLORS['c47'];

export const THEMES: Record<string, ThemeColors> = {
    dark: {
        bg: 'bg-zinc-950',
        text: 'text-zinc-100',
        card: 'bg-zinc-900 border-zinc-800',
        input: 'bg-zinc-950 border-zinc-700 focus:ring-emerald-500 text-zinc-100',
        nav: 'bg-zinc-900/90 border-zinc-800',
        accent: 'text-emerald-500',
        primaryBtn: `${darkAccent.btn} ${darkAccent.textOnBtn}`,
        secondaryBtn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700',
        subtext: 'text-zinc-400',
        statusBar: 'bg-zinc-900 border-zinc-800 text-zinc-400'
    },
    light: {
        bg: 'bg-slate-50',
        text: 'text-slate-900',
        card: 'bg-white border-slate-200 shadow-sm',
        input: 'bg-white border-slate-300 focus:ring-emerald-500 text-slate-900',
        nav: 'bg-white/90 border-slate-200',
        accent: 'text-emerald-600',
        primaryBtn: `${lightAccent.btn} ${lightAccent.textOnBtn}`,
        secondaryBtn: 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300',
        subtext: 'text-slate-500',
        statusBar: 'bg-white border-slate-200 text-slate-600'
    },
    lavender: {
        bg: 'bg-[#fdf4ff]', 
        text: 'text-[#4a044e]', 
        card: 'bg-white border-[#e879f9]/30 shadow-sm',
        input: 'bg-white border-[#d8b4fe] focus:ring-[#c026d3] text-[#4a044e]',
        nav: 'bg-white/90 border-[#f0abfc]',
        accent: 'text-[#c026d3]', 
        primaryBtn: `${lavenderAccent.btn} ${lavenderAccent.textOnBtn}`,
        secondaryBtn: 'bg-white hover:bg-[#fae8ff] text-[#86198f] border-[#e879f9]',
        subtext: 'text-[#86198f]', 
        statusBar: 'bg-[#fdf4ff] border-[#f0abfc] text-[#86198f]'
    },
    nord: {
        bg: 'bg-[#2e3440]',
        text: 'text-[#eceff4]',
        card: 'bg-[#3b4252] border-[#4c566a]',
        input: 'bg-[#3b4252] border-[#434c5e] focus:ring-[#88c0d0] text-[#eceff4]',
        nav: 'bg-[#2e3440]/90 border-[#4c566a]',
        accent: 'text-[#88c0d0]',
        primaryBtn: 'bg-[#5e81ac] hover:bg-[#81a1c1] text-white',
        secondaryBtn: 'bg-[#3b4252] hover:bg-[#434c5e] text-[#d8dee9] border-[#4c566a]',
        subtext: 'text-[#d8dee9]',
        statusBar: 'bg-[#2e3440] border-[#4c566a] text-[#d8dee9]'
    },
    forest: {
        bg: 'bg-[#0f2415]',
        text: 'text-[#e2e8f0]',
        card: 'bg-[#143320] border-[#1e4a2e]',
        input: 'bg-[#143320] border-[#2d5c3e] focus:ring-[#4ade80] text-[#e2e8f0]',
        nav: 'bg-[#0f2415]/90 border-[#1e4a2e]',
        accent: 'text-[#4ade80]',
        primaryBtn: 'bg-[#15803d] hover:bg-[#166534] text-white',
        secondaryBtn: 'bg-[#143320] hover:bg-[#1a4028] text-[#cbd5e1] border-[#1e4a2e]',
        subtext: 'text-[#94a3b8]',
        statusBar: 'bg-[#0f2415] border-[#1e4a2e] text-[#94a3b8]'
    },
    ocean: {
        bg: 'bg-[#0f172a]', // Slate 900
        text: 'text-[#f1f5f9]',
        card: 'bg-[#1e293b] border-[#334155]',
        input: 'bg-[#1e293b] border-[#334155] focus:ring-[#38bdf8] text-[#f1f5f9]',
        nav: 'bg-[#0f172a]/90 border-[#1e293b]',
        accent: 'text-[#38bdf8]', // Sky 400
        primaryBtn: 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white',
        secondaryBtn: 'bg-[#1e293b] hover:bg-[#334155] text-[#cbd5e1] border-[#334155]',
        subtext: 'text-[#94a3b8]',
        statusBar: 'bg-[#0f172a] border-[#1e293b] text-[#94a3b8]'
    },
    sunset: {
        bg: 'bg-[#431407]', // Orange 950 base
        text: 'text-[#ffedd5]',
        card: 'bg-[#7c2d12] border-[#9a3412]',
        input: 'bg-[#7c2d12] border-[#9a3412] focus:ring-[#fb923c] text-[#ffedd5]',
        nav: 'bg-[#431407]/90 border-[#7c2d12]',
        accent: 'text-[#fb923c]', // Orange 400
        primaryBtn: 'bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white',
        secondaryBtn: 'bg-[#7c2d12] hover:bg-[#9a3412] text-[#fdba74] border-[#9a3412]',
        subtext: 'text-[#fdba74]',
        statusBar: 'bg-[#431407] border-[#7c2d12] text-[#fdba74]'
    },
    coffee: {
        bg: 'bg-[#292524]', // Stone 800
        text: 'text-[#e7e5e4]', // Stone 200
        card: 'bg-[#44403c] border-[#57534e]',
        input: 'bg-[#44403c] border-[#57534e] focus:ring-[#d6d3d1] text-[#e7e5e4]',
        nav: 'bg-[#292524]/90 border-[#44403c]',
        accent: 'text-[#d6d3d1]', // Stone 300
        primaryBtn: 'bg-[#78350f] hover:bg-[#92400e] text-[#f5f5f4]',
        secondaryBtn: 'bg-[#44403c] hover:bg-[#57534e] text-[#d6d3d1] border-[#57534e]',
        subtext: 'text-[#a8a29e]',
        statusBar: 'bg-[#292524] border-[#44403c] text-[#a8a29e]'
    },
    rose: {
        bg: 'bg-[#fff1f2]', // Rose 50
        text: 'text-[#881337]', // Rose 900
        card: 'bg-white border-[#fecdd3]',
        input: 'bg-white border-[#fda4af] focus:ring-[#e11d48] text-[#881337]',
        nav: 'bg-[#fff1f2]/90 border-[#ffe4e6]',
        accent: 'text-[#e11d48]', // Rose 600
        primaryBtn: 'bg-[#e11d48] hover:bg-[#be123c] text-white',
        secondaryBtn: 'bg-white hover:bg-[#ffe4e6] text-[#be123c] border-[#fecdd3]',
        subtext: 'text-[#9f1239]',
        statusBar: 'bg-[#fff1f2] border-[#ffe4e6] text-[#9f1239]'
    },
    cyberpunk: {
        bg: 'bg-[#000000]',
        text: 'text-[#fcee0a]', // Yellow
        card: 'bg-[#1a1a1a] border-[#00f0ff]', // Cyan border
        input: 'bg-[#000000] border-[#fcee0a] focus:ring-[#00f0ff] text-[#fcee0a]',
        nav: 'bg-[#000000]/90 border-[#fcee0a]',
        accent: 'text-[#00f0ff]',
        primaryBtn: 'bg-[#fcee0a] text-black hover:bg-[#fff700] font-bold',
        secondaryBtn: 'bg-[#1a1a1a] border-[#00f0ff] text-[#00f0ff]',
        subtext: 'text-[#00f0ff]',
        statusBar: 'bg-[#000000] border-[#fcee0a] text-[#fcee0a]'
    }
};

// --- HOLIDAY LOGIC ---

export interface HolidayTheme {
    id: string;
    name: string;
    emoji: string;
    colors: ThemeColors;
    match: (d: Date) => boolean;
    getDisplayDate: (year: number) => string;
}

const checkDate = (d: Date, month: number, day: number) => d.getMonth() === month - 1 && d.getDate() === day;

// Checks if date is the Nth Weekday of Month (e.g., 2nd Sunday of May)
// nth: 1=1st, 2=2nd, -1=Last
// weekday: 0=Sun, 1=Mon...
const checkNthDay = (d: Date, month: number, weekday: number, nth: number) => {
    if (d.getMonth() !== month - 1) return false;
    if (d.getDay() !== weekday) return false;

    const date = d.getDate();
    // Calculate which occurrence this is
    const occurrence = Math.ceil(date / 7);
    
    if (nth > 0) return occurrence === nth;
    
    // Check if it's the last one
    const daysInMonth = new Date(d.getFullYear(), month, 0).getDate();
    return (date + 7) > daysInMonth;
}

// Movable dates lookup (2024-2050)
const MOVABLE_DATES: Record<string, string[]> = {
    chinese_new_year: [
        '2024-02-10', '2025-01-29', '2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03', '2031-01-23', '2032-02-11', '2033-01-31', 
        '2034-02-19', '2035-02-08', '2036-01-28', '2037-02-15', '2038-02-04', '2039-01-24', '2040-02-12', '2041-02-01', '2042-01-22', '2043-02-10', 
        '2044-01-30', '2045-02-17', '2046-02-06', '2047-01-26', '2048-02-14', '2049-02-02', '2050-01-23'
    ],
    diwali: [
        '2024-11-01', '2025-10-20', '2026-11-08', '2027-10-29', '2028-10-17', '2029-11-05', '2030-10-26', '2031-11-14', '2032-11-01', '2033-10-22',
        '2034-11-10', '2035-10-30', '2036-11-17', '2037-11-07', '2038-10-27', '2039-11-15', '2040-11-03', '2041-10-23', '2042-11-11', '2043-11-01',
        '2044-10-20', '2045-11-08', '2046-10-28', '2047-11-16', '2048-11-04', '2049-10-24', '2050-11-12'
    ],
    hanukkah: [ // Start date
        '2024-12-25', '2025-12-14', '2026-12-04', '2027-12-24', '2028-12-12', '2029-12-02', '2030-12-20', '2031-12-10', '2032-11-28', '2033-12-16',
        '2034-12-06', '2035-12-26', '2036-12-14', '2037-12-03', '2038-12-23', '2039-12-12', '2040-12-01', '2041-12-19', '2042-12-08', '2043-12-27',
        '2044-12-15', '2045-12-05', '2046-12-24', '2047-12-13', '2048-12-02', '2049-12-21', '2050-12-10'
    ],
    easter: [ // Easter Sunday
        '2024-03-31', '2025-04-20', '2026-04-05', '2027-03-28', '2028-04-16', '2029-04-01', '2030-04-21',
        '2031-04-13', '2032-03-28', '2033-04-17', '2034-04-09', '2035-03-25', '2036-04-13', '2037-04-05',
        '2038-04-25', '2039-04-10', '2040-04-01', '2041-04-21', '2042-04-06', '2043-03-29', '2044-04-17',
        '2045-04-09', '2046-03-25', '2047-04-14', '2048-04-05', '2049-04-18', '2050-04-10'
    ]
};

const checkMovable = (d: Date, key: string) => {
    const iso = d.toISOString().split('T')[0];
    return MOVABLE_DATES[key]?.includes(iso) || false;
};

// Helper for display date of movable fixed-list holidays
const getMovableDisplayDate = (key: string, year: number) => {
    const dateStr = MOVABLE_DATES[key]?.find(d => d.startsWith(`${year}-`));
    if(!dateStr) return `${year} ???`;
    return new Date(dateStr).toLocaleDateString('hu-HU', {month:'long', day:'numeric'});
};

// Helper for display date of Nth day rule holidays
const getNthDayDisplayDate = (year: number, month: number, weekday: number, nth: number) => {
    const d = new Date(year, month - 1, 1);
    const offset = (weekday - d.getDay() + 7) % 7;
    let day = 1 + offset + (nth - 1) * 7;
    
    if (nth === -1) {
        const lastDay = new Date(year, month, 0);
        const lastOffset = (lastDay.getDay() - weekday + 7) % 7;
        day = lastDay.getDate() - lastOffset;
    }
    
    return new Date(year, month - 1, day).toLocaleDateString('hu-HU', {month:'long', day:'numeric'});
};

// Hanukkah only on first day
const checkHanukkah = (d: Date) => checkMovable(d, 'hanukkah');

// Easter exception: Sunday and Monday (multi-day)
const checkEaster = (d: Date) => {
    // Check Sunday
    if (checkMovable(d, 'easter')) return true;
    // Check Monday (if yesterday was Easter Sunday)
    const yesterday = new Date(d);
    yesterday.setDate(d.getDate() - 1);
    return checkMovable(yesterday, 'easter');
};

export const HOLIDAY_THEMES: HolidayTheme[] = [
    {
        id: 'new_year',
        name: 'Újév',
        emoji: '🍾',
        match: (d) => checkDate(d, 1, 1),
        getDisplayDate: (y) => 'Január 1.',
        colors: {
            bg: 'bg-zinc-950',
            text: 'text-amber-100', 
            card: 'bg-zinc-900 border-zinc-700',
            input: 'bg-zinc-900 border-zinc-600 focus:ring-yellow-500 text-amber-100',
            nav: 'bg-zinc-900/90 border-zinc-700',
            accent: 'text-yellow-400', 
            primaryBtn: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:opacity-90',
            secondaryBtn: 'bg-zinc-800 border-zinc-600 text-zinc-300',
            subtext: 'text-zinc-400',
            statusBar: 'bg-zinc-950 border-zinc-800 text-zinc-500'
        }
    },
    {
        id: 'womens_day',
        name: 'Nemzetközi Nőnap',
        emoji: '♀️',
        match: (d) => checkDate(d, 3, 8),
        getDisplayDate: (y) => 'Március 8.',
        colors: {
            bg: 'bg-purple-50',
            text: 'text-purple-900',
            card: 'bg-white border-purple-200',
            input: 'bg-white border-purple-300 focus:ring-purple-500 text-purple-900',
            nav: 'bg-white/90 border-purple-200',
            accent: 'text-green-500', 
            primaryBtn: 'bg-purple-600 text-white hover:bg-purple-700',
            secondaryBtn: 'bg-white border-purple-200 text-purple-700',
            subtext: 'text-purple-400',
            statusBar: 'bg-purple-50 border-purple-200 text-purple-500'
        }
    },
    {
        id: 'valentine',
        name: 'Valentin-nap',
        emoji: '💖',
        match: (d) => checkDate(d, 2, 14),
        getDisplayDate: (y) => 'Február 14.',
        colors: {
            bg: 'bg-rose-50',
            text: 'text-rose-900',
            card: 'bg-white border-rose-200 shadow-sm',
            input: 'bg-white border-rose-300 focus:ring-pink-500 text-rose-900',
            nav: 'bg-white/90 border-rose-200',
            accent: 'text-pink-500',
            primaryBtn: 'bg-pink-500 text-white hover:bg-pink-600',
            secondaryBtn: 'bg-white border-rose-200 text-rose-700 hover:bg-rose-50',
            subtext: 'text-rose-400',
            statusBar: 'bg-rose-50 border-rose-200 text-rose-400'
        }
    },
    {
        id: 'st_patrick',
        name: 'Szent Patrik napja',
        emoji: '☘️',
        match: (d) => checkDate(d, 3, 17),
        getDisplayDate: (y) => 'Március 17.',
        colors: {
            bg: 'bg-green-50',
            text: 'text-green-900',
            card: 'bg-white border-green-200',
            input: 'bg-white border-green-300 focus:ring-orange-500 text-green-900',
            nav: 'bg-white/90 border-green-200',
            accent: 'text-orange-500',
            primaryBtn: 'bg-green-600 text-white hover:bg-green-700',
            secondaryBtn: 'bg-white border-green-200 text-green-700',
            subtext: 'text-green-600',
            statusBar: 'bg-green-50 border-green-200 text-green-600'
        }
    },
    {
        id: 'trans_visibility',
        name: 'Transznemű Láthatóság Napja',
        emoji: '⚧️',
        match: (d) => checkDate(d, 3, 31),
        getDisplayDate: (y) => 'Március 31.',
        colors: {
            bg: 'bg-sky-50',
            text: 'text-slate-700',
            card: 'bg-white border-pink-200',
            input: 'bg-white border-sky-200 focus:ring-pink-400 text-slate-900',
            nav: 'bg-white/90 border-sky-100',
            accent: 'text-pink-400',
            primaryBtn: 'bg-gradient-to-r from-sky-300 to-pink-300 text-white',
            secondaryBtn: 'bg-white border-sky-200 text-slate-500',
            subtext: 'text-sky-400',
            statusBar: 'bg-sky-50 border-pink-100 text-slate-500'
        }
    },
    {
        id: 'easter',
        name: 'Húsvét',
        emoji: '🐰',
        match: (d) => checkEaster(d),
        getDisplayDate: (y) => getMovableDisplayDate('easter', y),
        colors: {
            bg: 'bg-lime-50',
            text: 'text-lime-900',
            card: 'bg-white border-lime-200',
            input: 'bg-white border-lime-300 focus:ring-green-500 text-lime-900',
            nav: 'bg-white/90 border-lime-200',
            accent: 'text-green-600',
            primaryBtn: 'bg-lime-500 text-white hover:bg-lime-600',
            secondaryBtn: 'bg-white border-lime-200 text-lime-700',
            subtext: 'text-lime-500',
            statusBar: 'bg-lime-50 border-lime-200 text-lime-600'
        }
    },
    {
        id: 'earth_day',
        name: 'Föld napja',
        emoji: '🌍',
        match: (d) => checkDate(d, 4, 22),
        getDisplayDate: (y) => 'Április 22.',
        colors: {
            bg: 'bg-blue-50',
            text: 'text-green-900',
            card: 'bg-white border-green-200',
            input: 'bg-white border-green-300 focus:ring-blue-500 text-green-900',
            nav: 'bg-white/90 border-green-200',
            accent: 'text-blue-500',
            primaryBtn: 'bg-gradient-to-r from-green-500 to-blue-500 text-white',
            secondaryBtn: 'bg-white border-green-200 text-green-700',
            subtext: 'text-blue-400',
            statusBar: 'bg-blue-50 border-green-200 text-green-600'
        }
    },
    {
        id: 'mothers_day',
        name: 'Anyák napja',
        emoji: '💐',
        match: (d) => checkNthDay(d, 5, 0, 1), // HU: 1st Sunday of May
        getDisplayDate: (y) => getNthDayDisplayDate(y, 5, 0, 1),
        colors: {
            bg: 'bg-pink-50',
            text: 'text-rose-800',
            card: 'bg-white border-red-100',
            input: 'bg-white border-pink-200 focus:ring-red-400 text-rose-900',
            nav: 'bg-white/90 border-pink-100',
            accent: 'text-red-500',
            primaryBtn: 'bg-rose-400 text-white hover:bg-rose-500',
            secondaryBtn: 'bg-white border-pink-200 text-rose-600',
            subtext: 'text-pink-400',
            statusBar: 'bg-pink-50 border-pink-200 text-rose-400'
        }
    },
    {
        id: 'labor_day',
        name: 'A munka ünnepe',
        emoji: '🛠️',
        match: (d) => checkDate(d, 5, 1), // Standard May 1st (International)
        getDisplayDate: (y) => 'Május 1.',
        colors: {
            bg: 'bg-red-50',
            text: 'text-red-900',
            card: 'bg-white border-red-200',
            input: 'bg-white border-red-300 focus:ring-red-600 text-red-900',
            nav: 'bg-white/90 border-red-200',
            accent: 'text-red-600',
            primaryBtn: 'bg-red-600 text-white hover:bg-red-700',
            secondaryBtn: 'bg-white border-red-200 text-red-700',
            subtext: 'text-red-400',
            statusBar: 'bg-red-50 border-red-200 text-red-500'
        }
    },
    {
        id: 'rea_bday',
        name: 'Rea születésnapja',
        emoji: '🎂',
        match: (d) => checkDate(d, 5, 22),
        getDisplayDate: (y) => 'Május 22.',
        colors: {
            bg: 'bg-fuchsia-50',
            text: 'text-purple-900',
            card: 'bg-white border-pink-200 shadow-lg',
            input: 'bg-white border-pink-300 focus:ring-purple-500 text-purple-900',
            nav: 'bg-white/90 border-pink-200',
            accent: 'text-pink-500',
            primaryBtn: 'bg-gradient-to-r from-pink-400 to-purple-500 text-white',
            secondaryBtn: 'bg-white border-pink-200 text-purple-700',
            subtext: 'text-pink-400',
            statusBar: 'bg-fuchsia-50 border-pink-200 text-purple-400'
        }
    },
    {
        id: 'childrens_day',
        name: 'Gyereknap',
        emoji: '🎈',
        match: (d) => checkNthDay(d, 5, 0, -1), // HU: Last Sunday of May
        getDisplayDate: (y) => getNthDayDisplayDate(y, 5, 0, -1),
        colors: {
            bg: 'bg-cyan-50',
            text: 'text-blue-900',
            card: 'bg-white border-yellow-200',
            input: 'bg-white border-blue-200 focus:ring-yellow-400 text-blue-900',
            nav: 'bg-white/90 border-blue-100',
            accent: 'text-blue-500', // Blue + Rainbow vibes
            primaryBtn: 'bg-gradient-to-r from-yellow-400 via-red-400 to-blue-400 text-white',
            secondaryBtn: 'bg-white border-blue-200 text-blue-600',
            subtext: 'text-blue-400',
            statusBar: 'bg-cyan-50 border-yellow-200 text-blue-500'
        }
    },
    {
        id: 'fathers_day',
        name: 'Apák napja',
        emoji: '👨‍👧‍👦',
        match: (d) => checkNthDay(d, 6, 0, 3), // HU: 3rd Sunday of June
        getDisplayDate: (y) => getNthDayDisplayDate(y, 6, 0, 3),
        colors: {
            bg: 'bg-slate-50',
            text: 'text-slate-900',
            card: 'bg-white border-blue-200',
            input: 'bg-white border-slate-300 focus:ring-blue-600 text-slate-900',
            nav: 'bg-white/90 border-slate-200',
            accent: 'text-blue-700',
            primaryBtn: 'bg-blue-700 text-white hover:bg-blue-800',
            secondaryBtn: 'bg-white border-slate-300 text-slate-600',
            subtext: 'text-slate-500',
            statusBar: 'bg-slate-50 border-blue-200 text-blue-800'
        }
    },
    {
        id: 'pride_day',
        name: 'LMBTQ+ Büszkeség Napja',
        emoji: '🏳️‍🌈',
        match: (d) => checkDate(d, 6, 28),
        getDisplayDate: (y) => 'Június 28.',
        colors: {
            bg: 'bg-zinc-950',
            text: 'text-white',
            card: 'bg-zinc-900 border-zinc-800',
            input: 'bg-zinc-900 border-zinc-700 focus:ring-purple-500 text-white',
            nav: 'bg-zinc-900/90 border-zinc-800',
            accent: 'text-purple-400',
            primaryBtn: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white',
            secondaryBtn: 'bg-zinc-800 border-zinc-700 text-zinc-300',
            subtext: 'text-zinc-400',
            statusBar: 'bg-zinc-950 border-zinc-800 text-pink-400'
        }
    },
    {
        id: 'peace_day',
        name: 'Nemzetközi békenap',
        emoji: '🕊️',
        match: (d) => checkDate(d, 9, 21),
        getDisplayDate: (y) => 'Szeptember 21.',
        colors: {
            bg: 'bg-sky-50',
            text: 'text-sky-900',
            card: 'bg-white border-sky-100',
            input: 'bg-white border-sky-200 focus:ring-green-400 text-sky-900',
            nav: 'bg-white/90 border-sky-100',
            accent: 'text-green-500',
            primaryBtn: 'bg-sky-400 text-white hover:bg-sky-500',
            secondaryBtn: 'bg-white border-sky-100 text-sky-600',
            subtext: 'text-sky-400',
            statusBar: 'bg-sky-50 border-sky-100 text-green-500'
        }
    },
    {
        id: 'elderly_day',
        name: 'Idősek nemzetközi napja',
        emoji: '👵🏼',
        match: (d) => checkDate(d, 10, 1),
        getDisplayDate: (y) => 'Október 1.',
        colors: {
            bg: 'bg-stone-50', // Beige/Cream ish
            text: 'text-stone-800',
            card: 'bg-white border-stone-200',
            input: 'bg-white border-stone-300 focus:ring-sky-400 text-stone-900',
            nav: 'bg-white/90 border-stone-200',
            accent: 'text-sky-500',
            primaryBtn: 'bg-stone-500 text-white hover:bg-stone-600',
            secondaryBtn: 'bg-white border-stone-200 text-stone-600',
            subtext: 'text-stone-400',
            statusBar: 'bg-stone-50 border-stone-200 text-stone-500'
        }
    },
    {
        id: 'halloween',
        name: 'Halloween',
        emoji: '🎃',
        match: (d) => checkDate(d, 10, 31),
        getDisplayDate: (y) => 'Október 31.',
        colors: {
            bg: 'bg-orange-950',
            text: 'text-orange-100',
            card: 'bg-zinc-900 border-orange-900/50',
            input: 'bg-zinc-900 border-orange-800 focus:ring-purple-500 text-orange-100',
            nav: 'bg-zinc-900/90 border-orange-900',
            accent: 'text-purple-500',
            primaryBtn: 'bg-orange-600 text-white hover:bg-orange-700',
            secondaryBtn: 'bg-zinc-800 border-orange-900 text-orange-200',
            subtext: 'text-orange-400',
            statusBar: 'bg-orange-950 border-orange-900 text-orange-500'
        }
    },
    {
        id: 'diwali',
        name: 'Díváli',
        emoji: '🪔',
        match: (d) => checkMovable(d, 'diwali'),
        getDisplayDate: (y) => getMovableDisplayDate('diwali', y),
        colors: {
            bg: 'bg-purple-950',
            text: 'text-amber-100',
            card: 'bg-purple-900/50 border-purple-800',
            input: 'bg-purple-900 border-purple-700 focus:ring-orange-500 text-amber-100',
            nav: 'bg-purple-900/90 border-purple-800',
            accent: 'text-orange-400',
            primaryBtn: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
            secondaryBtn: 'bg-purple-800 border-purple-700 text-amber-100',
            subtext: 'text-purple-300',
            statusBar: 'bg-purple-950 border-purple-800 text-amber-500'
        }
    },
    {
        id: 'thanksgiving',
        name: 'Hálaadás',
        emoji: '🦃',
        match: (d) => checkNthDay(d, 11, 4, 4), // 4th Thursday of Nov
        getDisplayDate: (y) => getNthDayDisplayDate(y, 11, 4, 4),
        colors: {
            bg: 'bg-orange-50',
            text: 'text-amber-900',
            card: 'bg-white border-orange-200',
            input: 'bg-white border-orange-300 focus:ring-red-600 text-amber-900',
            nav: 'bg-white/90 border-orange-200',
            accent: 'text-orange-600',
            primaryBtn: 'bg-amber-700 text-white hover:bg-amber-800',
            secondaryBtn: 'bg-white border-orange-200 text-amber-800',
            subtext: 'text-amber-600',
            statusBar: 'bg-orange-50 border-orange-200 text-amber-700'
        }
    },
    {
        id: 'hanukkah',
        name: 'Hanuka',
        emoji: '🕎',
        match: (d) => checkHanukkah(d),
        getDisplayDate: (y) => getMovableDisplayDate('hanukkah', y),
        colors: {
            bg: 'bg-blue-950',
            text: 'text-blue-50',
            card: 'bg-slate-900 border-blue-900',
            input: 'bg-slate-900 border-blue-800 focus:ring-blue-400 text-white',
            nav: 'bg-slate-900/90 border-blue-900',
            accent: 'text-blue-300', // Silver/Light Blue
            primaryBtn: 'bg-blue-600 text-white hover:bg-blue-500',
            secondaryBtn: 'bg-slate-800 border-blue-900 text-blue-200',
            subtext: 'text-slate-400',
            statusBar: 'bg-blue-950 border-blue-900 text-blue-300'
        }
    },
    {
        id: 'christmas',
        name: 'Karácsony',
        emoji: '🎄',
        match: (d) => checkDate(d, 12, 24) || checkDate(d, 12, 25) || checkDate(d, 12, 26),
        getDisplayDate: (y) => 'December 24.',
        colors: {
            bg: 'bg-red-950',
            text: 'text-green-50',
            card: 'bg-zinc-900 border-red-900',
            input: 'bg-zinc-900 border-green-900 focus:ring-yellow-500 text-white',
            nav: 'bg-red-950/90 border-red-900',
            accent: 'text-yellow-400', // Gold
            primaryBtn: 'bg-green-700 text-white hover:bg-green-600',
            secondaryBtn: 'bg-red-900 border-red-800 text-red-100',
            subtext: 'text-red-200',
            statusBar: 'bg-red-950 border-red-900 text-green-200'
        }
    },
    {
        id: 'chinese_new_year',
        name: 'Kínai újév',
        emoji: '🐉',
        match: (d) => checkMovable(d, 'chinese_new_year'),
        getDisplayDate: (y) => getMovableDisplayDate('chinese_new_year', y),
        colors: {
            bg: 'bg-red-900',
            text: 'text-yellow-50',
            card: 'bg-red-950 border-red-800',
            input: 'bg-red-950 border-red-800 focus:ring-yellow-500 text-yellow-50',
            nav: 'bg-red-950/90 border-red-800',
            accent: 'text-yellow-400',
            primaryBtn: 'bg-yellow-500 text-red-900 font-bold hover:bg-yellow-400',
            secondaryBtn: 'bg-red-800 border-red-700 text-yellow-100',
            subtext: 'text-red-300',
            statusBar: 'bg-red-900 border-red-800 text-yellow-500'
        }
    }
];

export const getHolidayTheme = (date: Date): HolidayTheme | null => {
    return HOLIDAY_THEMES.find(h => h.match(date)) || null;
};
