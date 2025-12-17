
import React, { useState, useEffect } from 'react';
import { Entry, WeatherIconPack, EmojiStyle } from '../../types';
import { Card } from '../ui';
import { BarChart, Activity, PieChart, CalendarDays, MapPin, AlignLeft, CloudSun, Calendar, ArrowUp, ArrowDown, Layout } from 'lucide-react';
import WeatherRenderer, { getWeatherCategory } from '../ui/WeatherRenderer';
import EmojiRenderer from '../ui/EmojiRenderer';

interface StatsViewProps {
    entries: Entry[];
    themeClasses: any;
    t: (key: string, params?: any) => string;
    savedLayout?: string[];
    onSaveLayout?: (order: string[]) => void;
    weatherPack?: WeatherIconPack;
    emojiStyle?: EmojiStyle; // Added emojiStyle prop
}

const StatsView: React.FC<StatsViewProps> = ({ entries, themeClasses, t, savedLayout, onSaveLayout, weatherPack = 'outline', emojiStyle = 'native' }) => {
    const [isReordering, setIsReordering] = useState(false);
    const [widgetOrder, setWidgetOrder] = useState<string[]>(
        savedLayout && savedLayout.length > 0 
        ? savedLayout 
        : ['summary', 'correlations', 'moods', 'locations', 'heatmap']
    );

    // --- DATA PROCESSING ---

    // 1. Calculate Mood Distribution
    const moodCounts: Record<string, number> = {};
    let totalMoods = 0;
    
    // 2. Locations
    const locations = new Set<string>();
    const locationCounts: Record<string, number> = {};
    let totalLocations = 0;

    // 3. Longest Entry
    let longestEntryTitle = "";
    let maxWords = 0;

    // 4. Activity Heatmap (Daily Data)
    const dayActivity: Record<string, number> = {}; // "YYYY-MM-DD" -> count
    let earliestEntryTimestamp = Date.now();
    
    // 5. Total Words
    let totalWords = 0;

    // 6. Correlations (Weather & Day)
    const weatherMoods: Record<string, Record<string, number>> = {}; // { 'Clouds': { '🙂': 5 } }
    const dayMoods: Record<number, Record<string, number>> = {}; 

    entries.forEach(e => {
        if (e.timestamp < earliestEntryTimestamp) earliestEntryTimestamp = e.timestamp;
        
        const dateStr = new Date(e.timestamp).toISOString().split('T')[0];
        dayActivity[dateStr] = (dayActivity[dateStr] || 0) + 1;

        // Moods & Correlations
        if (e.mood) {
            moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
            totalMoods++;

            // Correlations: Weather
            if (e.weather) {
                // Use condition (code or text) as key for grouping
                // If it is a code (wmo_X), we group by that code
                // If it is legacy text ('Clear sky'), we group by that
                // To keep it clean, we group by what is stored
                const conditionKey = e.weather.condition;
                if (conditionKey) {
                    if (!weatherMoods[conditionKey]) weatherMoods[conditionKey] = {};
                    weatherMoods[conditionKey][e.mood] = (weatherMoods[conditionKey][e.mood] || 0) + 1;
                }
            }

            // Correlations: Day
            const day = new Date(e.timestamp).getDay(); 
            if (!dayMoods[day]) dayMoods[day] = {};
            dayMoods[day][e.mood] = (dayMoods[day][e.mood] || 0) + 1;
        }

        // Locations
        if (e.location) {
            locations.add(e.location);
            locationCounts[e.location] = (locationCounts[e.location] || 0) + 1;
            totalLocations++;
        }

        // Word Count
        const text = (e.freeTextContent || '') + Object.values(e.responses || {}).join(' ');
        const wordCount = text.trim().split(/\s+/).length;
        
        totalWords += wordCount;

        if (wordCount > maxWords) {
            maxWords = wordCount;
            longestEntryTitle = e.title || e.dateLabel;
        }
    });

    const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const sortedLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const getTopMood = (map: Record<string, number>) => {
        let top = '';
        let max = 0;
        let total = 0;
        Object.entries(map).forEach(([m, c]) => {
            total += c;
            if (c > max) { max = c; top = m; }
        });
        return { mood: top, percent: total > 0 ? Math.round((max / total) * 100) : 0 };
    };

    const days = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    
    // Updated translation helper
    const translateWeather = (cond: string) => {
        if (cond.startsWith('wmo_')) {
            return t(`weather.${cond}`);
        }
        // Fallback for legacy static text
        switch(cond) {
            case 'Clear': return 'Napos';
            case 'Clouds': return 'Felhős';
            case 'Rain': return 'Esős';
            case 'Snow': return 'Havas';
            case 'Storm': return 'Viharos';
            case 'Mist': return 'Ködös';
            default: return cond;
        }
    };

    // Reordering Helpers
    const moveWidget = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...widgetOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setWidgetOrder(newOrder);
        if(onSaveLayout) onSaveLayout(newOrder);
    };

    // --- WIDGET RENDERERS ---

    const renderSummary = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card themeClasses={themeClasses} className="p-4 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-bold ${themeClasses.accent}`}>{entries.length}</span>
                <span className="text-xs opacity-60 uppercase tracking-wider mt-1">{t('stats.total_entries')}</span>
            </Card>
            
            <Card themeClasses={themeClasses} className="p-4 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-bold text-blue-500`}>{locations.size}</span>
                <span className="text-xs opacity-60 uppercase tracking-wider mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {t('stats.locations')}
                </span>
            </Card>

            <Card themeClasses={themeClasses} className="p-4 flex flex-col items-center justify-center text-center overflow-hidden">
                <span className={`text-xl font-bold text-orange-500 truncate w-full`} title={longestEntryTitle}>
                    {maxWords > 0 ? longestEntryTitle : "-"}
                </span>
                <span className="text-xs opacity-60 uppercase tracking-wider mt-1 flex items-center gap-1">
                    <AlignLeft className="w-3 h-3" /> {t('stats.longest_entry')} ({maxWords})
                </span>
            </Card>
            
            <Card themeClasses={themeClasses} className="p-4 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-bold text-purple-500`}>{totalWords.toLocaleString()}</span>
                <span className="text-xs opacity-60 uppercase tracking-wider mt-1">{t('stats.words')}</span>
            </Card>
        </div>
    );

    const renderCorrelations = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Weather & Mood */}
            <Card themeClasses={themeClasses} className="p-6 h-full">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-orange-400" /> {t('stats.weather_mood')}
                </h3>
                <div className="space-y-3">
                    {Object.keys(weatherMoods).length === 0 ? <p className="opacity-50 text-sm text-center">{t('stats.no_data')}</p> : 
                        Object.entries(weatherMoods).map(([cond, moods]) => {
                            const { mood, percent } = getTopMood(moods);
                            // Ensure iconCode is set to the condition code so renderer can pick it up
                            let iconCode = '';
                            if (cond.startsWith('wmo_')) iconCode = cond;
                            else if (!isNaN(parseInt(cond))) iconCode = `wmo_${cond}`; // handle potential bare numbers
                            else iconCode = cond; // Pass legacy text if no WMO
                            
                            return (
                                <div key={cond} className="flex items-center justify-between p-2 rounded bg-black/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <WeatherRenderer data={{ condition: cond, temp:0, location:'', icon: iconCode }} pack={weatherPack} className="w-5 h-5" />
                                        <span className="text-sm font-bold">{translateWeather(cond)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs opacity-60 hidden sm:inline">Domináns:</span>
                                        <EmojiRenderer emoji={mood} style={emojiStyle} className="text-xl" />
                                        <span className="text-xs font-bold bg-white/10 px-1.5 py-0.5 rounded">{percent}%</span>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </Card>

            {/* Day & Mood */}
            <Card themeClasses={themeClasses} className="p-6 h-full">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" /> {t('stats.day_mood')}
                </h3>
                <div className="space-y-3">
                    {Object.keys(dayMoods).length === 0 ? <p className="opacity-50 text-sm text-center">{t('stats.no_data')}</p> :
                        Object.entries(dayMoods).sort((a,b) => Number(a[0]) - Number(b[0])).map(([dayIdx, moods]) => {
                            const { mood, percent } = getTopMood(moods);
                            return (
                                <div key={dayIdx} className="flex items-center justify-between p-2 rounded bg-black/5 border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold w-20">{days[Number(dayIdx)]}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <EmojiRenderer emoji={mood} style={emojiStyle} className="text-xl" />
                                        <span className="text-xs font-bold bg-white/10 px-1.5 py-0.5 rounded">{percent}%</span>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </Card>
        </div>
    );

    const renderMoods = () => (
        <Card themeClasses={themeClasses} className="p-6 h-full">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-500" /> {t('stats.mood_distribution')}
            </h3>
            {sortedMoods.length === 0 ? (
                <p className="opacity-50 text-center py-8">{t('stats.no_data')}</p>
            ) : (
                <div className="space-y-3">
                    {sortedMoods.map(([mood, count]) => (
                        <div key={mood} className="flex items-center gap-3">
                            <div className="w-8 text-center"><EmojiRenderer emoji={mood} style={emojiStyle} className="text-2xl" /></div>
                            <div className="flex-1 h-3 bg-black/10 rounded-full overflow-hidden relative">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full opacity-80" 
                                    style={{ width: `${(count / totalMoods) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-mono opacity-60 w-8 text-right">{count}</span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );

    const renderLocations = () => (
        <Card themeClasses={themeClasses} className="p-6 h-full">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" /> {t('stats.top_locations')}
            </h3>
            {sortedLocations.length === 0 ? (
                <p className="opacity-50 text-center py-8">{t('stats.no_data')}</p>
            ) : (
                <div className="space-y-3">
                    {sortedLocations.map(([loc, count]) => (
                        <div key={loc} className="flex items-center gap-3">
                            <span className="text-xs font-bold w-24 truncate text-right" title={loc}>{loc}</span>
                            <div className="flex-1 h-3 bg-black/10 rounded-full overflow-hidden relative">
                                <div 
                                    className="h-full bg-blue-500 rounded-full opacity-80" 
                                    style={{ width: `${(count / totalLocations) * 100}%` }} 
                                ></div>
                            </div>
                            <span className="text-xs font-mono opacity-60 w-8 text-right">{count}</span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );

    const renderHeatmap = () => {
        // Calculate start date based on earliest entry, but at least 1 year ago
        const today = new Date();
        const minDate = new Date(Math.min(today.getTime() - 365*24*60*60*1000, earliestEntryTimestamp));
        
        // Adjust start date to previous Monday to align grid properly
        const dayOfWeek = minDate.getDay();
        const diff = minDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is sunday
        minDate.setDate(diff);

        const dates: Date[] = [];
        // Fill array from start until today
        for (let d = new Date(minDate); d <= today; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }

        const weeks = [];
        for (let i = 0; i < dates.length; i += 7) {
            weeks.push(dates.slice(i, i + 7));
        }

        return (
            <Card themeClasses={themeClasses} className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" /> {t('stats.activity_heatmap')}
                </h3>
                <div className="overflow-x-auto pb-2 no-scrollbar">
                    <div className="flex flex-col">
                        <div className="flex items-end">
                            {weeks.map((weekDates, colIndex) => {
                                const firstDayOfWeek = weekDates[0];
                                const prevFirstDay = colIndex > 0 ? weeks[colIndex-1][0] : null;
                                const isMonthChanged = prevFirstDay && firstDayOfWeek.getMonth() !== prevFirstDay.getMonth();

                                return (
                                    <React.Fragment key={colIndex}>
                                        <div className={`flex flex-col gap-1 mr-1 ${isMonthChanged ? 'ml-3' : ''}`}>
                                            {/* Render 7 cells for the week */}
                                            {Array.from({ length: 7 }).map((_, rowIndex) => {
                                                const d = weekDates[rowIndex];
                                                if (!d) return <div key={rowIndex} className="w-3 h-3 md:w-3.5 md:h-3.5"></div>;

                                                const dateStr = d.toISOString().split('T')[0];
                                                const count = dayActivity[dateStr] || 0;
                                                let bgClass = "bg-transparent border border-current opacity-20"; 
                                                let style = {};

                                                if (count > 0) {
                                                    const brightness = Math.max(40, 100 - (count * 15));
                                                    bgClass = themeClasses.primaryBtn.split(' ')[0] + " opacity-100 border-none";
                                                    style = { filter: `brightness(${brightness}%)` };
                                                }

                                                return (
                                                    <div 
                                                        key={rowIndex}
                                                        className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm ${bgClass}`}
                                                        style={style}
                                                        title={`${dateStr}: ${count} bejegyzés`}
                                                    ></div>
                                                );
                                            })}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        {/* Month Labels Row */}
                        <div className="flex items-start mt-2 h-4 relative">
                             {weeks.map((weekDates, colIndex) => {
                                const firstDayOfWeek = weekDates[0];
                                const prevFirstDay = colIndex > 0 ? weeks[colIndex-1][0] : null;
                                const isMonthChanged = !prevFirstDay || firstDayOfWeek.getMonth() !== prevFirstDay.getMonth();
                                
                                if (isMonthChanged) {
                                    const monthLabel = firstDayOfWeek.toLocaleDateString(undefined, { month: 'short' });
                                    return (
                                        <div key={`m-${colIndex}`} className={`text-[9px] opacity-60 font-bold uppercase w-3 md:w-3.5 overflow-visible whitespace-nowrap mr-1 ml-3`}>
                                            {monthLabel}
                                        </div>
                                    );
                                }
                                return <div key={`m-${colIndex}`} className="w-3 md:w-3.5 mr-1"></div>;
                             })}
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    const renderWidget = (id: string, index: number) => {
        let content = null;
        switch(id) {
            case 'summary': content = renderSummary(); break;
            case 'correlations': content = renderCorrelations(); break;
            case 'moods': content = renderMoods(); break;
            case 'locations': content = renderLocations(); break;
            case 'heatmap': content = renderHeatmap(); break;
            default: return null;
        }

        return (
            <div key={id} className="relative group">
                {isReordering && (
                    <div className="absolute top-2 right-2 z-20 flex gap-1 bg-black/50 rounded p-1 backdrop-blur-sm">
                        <button onClick={() => moveWidget(index, 'up')} disabled={index === 0} className="p-1 text-white hover:bg-white/20 rounded disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                        <button onClick={() => moveWidget(index, 'down')} disabled={index === widgetOrder.length-1} className="p-1 text-white hover:bg-white/20 rounded disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    </div>
                )}
                {content}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-end">
                <button 
                    onClick={() => setIsReordering(!isReordering)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all border ${isReordering ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-transparent border-current opacity-50 hover:opacity-100'}`}
                >
                    <Layout className="w-4 h-4" />
                    {isReordering ? 'Kész' : 'Átrendezés'}
                </button>
            </div>

            <div className="space-y-6">
                {widgetOrder.map((id, idx) => renderWidget(id, idx))}
            </div>
        </div>
    );
};

export default StatsView;
