export const stringToColor = (str: string, theme: 'dark' | 'light' = 'dark') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    // Dark theme: Pastel/Light colors (L=70-80%), Light theme: Darker colors (L=30-40%)
    const s = 60;
    const l = theme === 'dark' ? 70 : 40;
    return `hsl(${h}, ${s}%, ${l}%)`;
};

export const stringToBgColor = (str: string, theme: 'dark' | 'light' = 'dark') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    // Backgrounds should be subtle
    const s = 60;
    const l = theme === 'dark' ? 20 : 90;
    return `hsl(${h}, ${s}%, ${l}%)`;
};
