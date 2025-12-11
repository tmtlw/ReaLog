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

export type ThemeKey = 'dark' | 'light' | 'lavender' | 'system' | 'custom';

// Helper to generate tailwind classes from hex and determine text color
const c = (hex: string, label: string) => {
    // Simple heuristic for light colors to use black text
    const lightColors = ['#eab308', '#facc15', '#fde047', '#bef264', '#84cc16', '#a3e635', '#4ade80', '#22d3ee', '#67e8f9', '#c084fc', '#f472b6', '#fb7185', '#fb923c', '#fdba74'];
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

// Accent Colors - Removed duplicates of Category Colors (c21, c32, c44, c14) to avoid confusion
export const ACCENT_COLORS = {
    // Reds & Pinks
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

    // Oranges & Yellows
    c11: c('#f97316', 'Orange'),
    c12: c('#ea580c', 'Dark Orange'),
    c13: c('#fb923c', 'Light Orange'),
    // c14: c('#f59e0b', 'Amber'), // Removed - Yearly Color
    c15: c('#d97706', 'Dark Amber'),
    c16: c('#eab308', 'Yellow'),
    c17: c('#ca8a04', 'Gold'),
    c18: c('#fbbf24', 'Sunflower'),
    c19: c('#854d0e', 'Bronze'),
    c20: c('#fdba74', 'Peach'),

    // Greens
    // c21: c('#10b981', 'Emerald'), // Removed - Daily Color
    c22: c('#059669', 'Dark Emerald'),
    c23: c('#34d399', 'Light Emerald'),
    c24: c('#22c55e', 'Green'),
    c25: c('#16a34a', 'Forest'),
    c26: c('#84cc16', 'Lime'),
    c27: c('#65a30d', 'Dark Lime'),
    c28: c('#14b8a6', 'Teal'),
    c29: c('#0d9488', 'Dark Teal'),
    c30: c('#065f46', 'Pine'),

    // Blues
    c31: c('#3b82f6', 'Blue'),
    // c32: c('#2563eb', 'Royal Blue'), // Removed - Weekly Color
    c33: c('#60a5fa', 'Sky Blue'),
    c34: c('#0ea5e9', 'Sky'),
    c35: c('#0284c7', 'Deep Sky'),
    c36: c('#06b6d4', 'Cyan'),
    c37: c('#6366f1', 'Indigo'),
    c38: c('#4f46e5', 'Deep Indigo'),
    c39: c('#1e40af', 'Navy'),
    c40: c('#1e3a8a', 'Midnight'),

    // Purples & Violets
    c41: c('#8b5cf6', 'Violet'),
    c42: c('#7c3aed', 'Dark Violet'),
    c43: c('#a78bfa', 'Lavender'),
    // c44: c('#a855f7', 'Purple'), // Removed - Monthly Color
    c45: c('#9333ea', 'Deep Purple'),
    c46: c('#d946ef', 'Fuchsia'),
    c47: c('#c026d3', 'Magenta'),
    c48: c('#86198f', 'Plum'),
    c49: c('#701a75', 'Berry'),
    c50: c('#4a044e', 'Dark Orchid'),
};

export const generateCustomTheme = (base: 'light' | 'dark', accentKey: keyof typeof ACCENT_COLORS): ThemeColors => {
    // Fallback to first color if key invalid
    const accent = ACCENT_COLORS[accentKey] || ACCENT_COLORS['c22'];
    
    if (base === 'dark') {
        return {
            bg: 'bg-zinc-950',
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
            bg: 'bg-slate-50',
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

// Standard Themes now leverage the accent system for consistency
const darkAccent = ACCENT_COLORS['c22']; // Dark Emerald
const lightAccent = ACCENT_COLORS['c22']; // Dark Emerald
const lavenderAccent = ACCENT_COLORS['c47']; // Magenta

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
        bg: 'bg-[#fdf4ff]', // Fuchsia 50
        text: 'text-[#4a044e]', // Fuchsia 950
        card: 'bg-white border-[#e879f9]/30 shadow-sm',
        input: 'bg-white border-[#d8b4fe] focus:ring-[#c026d3] text-[#4a044e]',
        nav: 'bg-white/90 border-[#f0abfc]',
        accent: 'text-[#c026d3]', // Fuchsia 600
        primaryBtn: `${lavenderAccent.btn} ${lavenderAccent.textOnBtn}`,
        secondaryBtn: 'bg-white hover:bg-[#fae8ff] text-[#86198f] border-[#e879f9]',
        subtext: 'text-[#86198f]', // Fuchsia 800
        statusBar: 'bg-[#fdf4ff] border-[#f0abfc] text-[#86198f]'
    }
};