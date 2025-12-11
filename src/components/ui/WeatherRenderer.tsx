
import React from 'react';
import { Sun, Cloud, CloudRain, Snowflake, CloudLightning, CloudSun, CloudFog, Moon } from 'lucide-react';
import { WeatherData, WeatherIconPack } from '../../types';

// Helper to determine category from API data
export const getWeatherCategory = (data?: WeatherData): string => {
    if (!data) return 'Other';
    
    // 1. Try Icon Code (OpenWeatherMap)
    if (data.icon) {
        const c = data.icon;
        if (c.startsWith('01')) return 'Clear';
        if (c.startsWith('02') || c.startsWith('03') || c.startsWith('04')) return 'Clouds';
        if (c.startsWith('09') || c.startsWith('10')) return 'Rain';
        if (c.startsWith('11')) return 'Storm';
        if (c.startsWith('13')) return 'Snow';
        if (c.startsWith('50')) return 'Mist';
    }

    // 2. Fallback to condition text
    const cond = (data.condition || '').toLowerCase();
    if (cond.includes('storm') || cond.includes('thunder')) return 'Storm';
    if (cond.includes('snow') || cond.includes('sleet')) return 'Snow';
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) return 'Rain';
    if (cond.includes('cloud') || cond.includes('overcast')) return 'Clouds';
    if (cond.includes('clear') || cond.includes('sunny')) return 'Clear';
    if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) return 'Mist';

    return 'Other';
};

interface WeatherRendererProps {
    data: WeatherData;
    pack?: WeatherIconPack;
    className?: string;
}

const WeatherRenderer: React.FC<WeatherRendererProps> = ({ data, pack = 'outline', className = "w-5 h-5" }) => {
    const category = getWeatherCategory(data);
    const isNight = data.icon?.endsWith('n');

    // --- PACKS ---

    // 1. Outline (Lucide Default)
    if (pack === 'outline') {
        switch(category) {
            case 'Clear': return isNight ? <Moon className={className} /> : <Sun className={className} />;
            case 'Clouds': return <Cloud className={className} />;
            case 'Rain': return <CloudRain className={className} />;
            case 'Snow': return <Snowflake className={className} />;
            case 'Storm': return <CloudLightning className={className} />;
            case 'Mist': return <CloudFog className={className} />;
            default: return <CloudSun className={className} />;
        }
    }

    // 2. Filled (Lucide Filled)
    if (pack === 'filled') {
        const fillClass = `${className} fill-current`;
        switch(category) {
            case 'Clear': return isNight ? <Moon className={fillClass} /> : <Sun className={fillClass} />;
            case 'Clouds': return <Cloud className={fillClass} />;
            case 'Rain': return <CloudRain className={fillClass} />;
            case 'Snow': return <Snowflake className={fillClass} />;
            case 'Storm': return <CloudLightning className={fillClass} />;
            case 'Mist': return <CloudFog className={fillClass} />;
            default: return <CloudSun className={fillClass} />;
        }
    }

    // 3. Color (Lucide Styled)
    if (pack === 'color') {
        switch(category) {
            case 'Clear': return isNight ? <Moon className={`${className} text-indigo-300 fill-indigo-300/20`} /> : <Sun className={`${className} text-orange-500 fill-orange-500/20`} />;
            case 'Clouds': return <Cloud className={`${className} text-gray-400 fill-gray-400/20`} />;
            case 'Rain': return <CloudRain className={`${className} text-blue-500 fill-blue-500/20`} />;
            case 'Snow': return <Snowflake className={`${className} text-cyan-300 fill-cyan-300/20`} />;
            case 'Storm': return <CloudLightning className={`${className} text-yellow-500 fill-yellow-500/20`} />;
            case 'Mist': return <CloudFog className={`${className} text-teal-400 fill-teal-400/20`} />;
            default: return <CloudSun className={`${className} text-orange-300`} />;
        }
    }

    // 4. Emoji (System)
    if (pack === 'emoji') {
        const sizeClass = className.includes('w-') ? 'text-lg' : 'text-base'; // heuristic mapping
        switch(category) {
            case 'Clear': return <span className={sizeClass}>{isNight ? '🌙' : '☀️'}</span>;
            case 'Clouds': return <span className={sizeClass}>☁️</span>;
            case 'Rain': return <span className={sizeClass}>🌧️</span>;
            case 'Snow': return <span className={sizeClass}>❄️</span>;
            case 'Storm': return <span className={sizeClass}>⛈️</span>;
            case 'Mist': return <span className={sizeClass}>🌫️</span>;
            default: return <span className={sizeClass}>⛅</span>;
        }
    }

    // 5. ASCII (Retro)
    if (pack === 'ascii') {
        const fontClass = "font-mono text-xs leading-none";
        switch(category) {
            case 'Clear': return <span className={fontClass}>{isNight ? 'C' : 'O'}</span>;
            case 'Clouds': return <span className={fontClass}>@</span>;
            case 'Rain': return <span className={fontClass}>;;</span>;
            case 'Snow': return <span className={fontClass}>**</span>;
            case 'Storm': return <span className={fontClass}>%!</span>;
            case 'Mist': return <span className={fontClass}>~~</span>;
            default: return <span className={fontClass}>-</span>;
        }
    }

    return null;
};

export default WeatherRenderer;
