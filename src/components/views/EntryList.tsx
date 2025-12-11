
import React from 'react';
import { Book, Layout, List, Calendar, Map as MapIcon, Images, FileText, ThermometerSun, MapPin, Clock } from 'lucide-react';
import { Entry, Category, WeatherIconPack } from '../../types';
import { CATEGORY_COLORS, CATEGORY_HOVER_BORDERS, CATEGORY_TEXT_COLORS } from '../../constants';
import { Card } from '../ui';
import WeatherRenderer from '../ui/WeatherRenderer';

interface EntryListProps {
    viewMode: 'grid' | 'timeline' | 'calendar' | 'atlas' | 'gallery';
    entries: Entry[];
    onSelectEntry: (e: Entry) => void;
    renderActionButtons: (e: Entry) => React.ReactNode;
    themeClasses: any;
    isAdmin: boolean;
    t: (key: string, params?: any) => string;
    gridLayout?: 'standard' | 'masonry';
    weatherPack?: WeatherIconPack; // New Prop
}

const EntryList: React.FC<EntryListProps> = ({
    viewMode, entries, onSelectEntry, renderActionButtons, themeClasses, isAdmin, t, gridLayout = 'standard', weatherPack = 'outline'
}) => {

    const getCatLabel = (cat: Category) => t(`category.${cat.toLowerCase()}`);

    const getReadTime = (e: Entry) => {
        const text = (e.freeTextContent || '') + Object.values(e.responses || {}).join(' ');
        // Strip HTML tags for accurate word count
        const plainText = text.replace(/<[^>]*>?/gm, '');
        const words = plainText.trim().split(/\s+/).length;
        const min = Math.max(1, Math.ceil(words / 200)); // Avg reading speed 200 wpm
        return t('app.read_time', { min });
    };

    if (entries.length === 0 && viewMode !== 'calendar') {
        return (
            <div className="text-center py-20 opacity-40">
                <Book className="w-12 h-12 mx-auto mb-4" />
                <p>{t('app.no_entries')}</p>
                {isAdmin && <p className="text-sm mt-2">{t('app.click_plus')}</p>}
            </div>
        );
    }

    // Render Location and Weather fragment
    const renderMetaInfo = (e: Entry) => {
        const showLocation = e.location && (!e.isLocationPrivate || isAdmin);
        const showWeather = !!e.weather;

        if (!showLocation && !showWeather) return null;

        return (
            <div className="flex flex-col text-[10px] md:text-xs opacity-60 mt-2 gap-0.5">
                {showLocation && (
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {e.location}
                    </span>
                )}
                {showWeather && e.weather && (
                    <span className="flex items-center gap-1">
                        <WeatherRenderer data={e.weather} pack={weatherPack} className="w-3 h-3" />
                        {e.weather.temp}°C, {e.weather.condition}
                    </span>
                )}
            </div>
        );
    };

    const EntryCard = ({ entry: e }: { entry: Entry }) => {
        const coverPhoto = e.photos && e.photos.length > 0 ? e.photos[0] : e.photo;
        const readTime = getReadTime(e);
        
        return (
            <Card themeClasses={themeClasses} className={`group transition-colors flex flex-col h-full relative ${e.isDraft ? 'border-dashed border-2 border-orange-500/50' : 'hover:border-emerald-500/50'}`}>
                {coverPhoto && (
                    <div className="h-32 overflow-hidden relative cursor-pointer flex-shrink-0" onClick={() => onSelectEntry(e)}>
                        <img src={coverPhoto} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {e.photos && e.photos.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Images className="w-3 h-3" /> {e.photos.length}
                            </div>
                        )}
                    </div>
                )}
                <div className="p-5 flex-1 flex flex-col min-h-0" onClick={() => onSelectEntry(e)}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${CATEGORY_COLORS[e.category]} text-white`}>{getCatLabel(e.category)}</span>
                            {e.isDraft && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500 text-white flex items-center gap-1"><FileText className="w-3 h-3" /> {t('common.draft')}</span>}
                        </div>
                        {e.mood && <span className="text-lg">{e.mood}</span>}
                    </div>
                    <h3 className="font-bold text-lg mb-2 leading-tight group-hover:text-emerald-500 transition-colors cursor-pointer">{e.title || e.dateLabel}</h3>
                    
                    <div className="text-sm opacity-60 mb-4 line-clamp-3 flex-1 overflow-hidden">
                        {e.entryMode === 'free' ? (
                            <div dangerouslySetInnerHTML={{ __html: e.freeTextContent || '' }} />
                        ) : (
                            (Object.values(e.responses || {}) as string[]).filter(Boolean).join(' • ')
                        )}
                    </div>
                    
                    <div className="border-t border-current border-opacity-10 pt-3 mt-auto">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-xs opacity-70 font-mono flex items-center gap-1 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(e.timestamp).toLocaleDateString()} 
                                </span>
                                <span className="opacity-50 hidden md:inline">|</span> 
                                <span>{readTime}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={ev => ev.stopPropagation()}>
                                {renderActionButtons(e)}
                            </div>
                        </div>
                        {renderMetaInfo(e)}
                    </div>
                </div>
            </Card>
        );
    };

    if (viewMode === 'grid') {
        if (gridLayout === 'masonry') {
            return (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
                    {entries.map(e => (
                        <div key={e.id} className="break-inside-avoid mb-4">
                            <EntryCard entry={e} />
                        </div>
                    ))}
                </div>
            );
        }

        // Standard Grid
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                {entries.map(e => (
                    <div key={e.id} className="h-full">
                        <EntryCard entry={e} />
                    </div>
                ))}
            </div>
        );
    }

    if (viewMode === 'timeline') {
        let lastDateString = "";

        return (
            <div className="relative border-l-2 border-emerald-500/20 ml-3 space-y-4 py-2">
                {entries.map((e, index) => {
                    const dateObj = new Date(e.timestamp);
                    const dateString = dateObj.toLocaleDateString();
                    const showDateHeader = dateString !== lastDateString;
                    lastDateString = dateString;
                    const coverPhoto = e.photos && e.photos.length > 0 ? e.photos[0] : e.photo;
                    const readTime = getReadTime(e);

                    return (
                        <div key={e.id} className="relative pl-8 group">
                            {/* Date Header Grouping */}
                            {showDateHeader && (
                                <div className="absolute -left-[29px] top-0 flex items-center mb-4">
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 border-4 border-zinc-950 z-10"></div>
                                    <span className={`ml-4 text-sm font-bold uppercase tracking-wider ${themeClasses.accent}`}>
                                        {dateString}
                                    </span>
                                </div>
                            )}

                            <div className={`mt-2 ${showDateHeader ? 'pt-6' : ''}`}>
                                {!showDateHeader && (
                                    <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-zinc-950 ${CATEGORY_COLORS[e.category]}`}></div>
                                )}
                                
                                <div 
                                    className={`p-4 rounded-lg border transition-all cursor-pointer ${themeClasses.card} ${e.isDraft ? 'border-dashed border-orange-500/50' : CATEGORY_HOVER_BORDERS[e.category] || 'hover:border-emerald-500/50'}`} 
                                    onClick={() => onSelectEntry(e)}
                                >
                                    <div className="flex gap-4">
                                        {coverPhoto && (
                                            <div className="flex-shrink-0">
                                                <img src={coverPhoto} alt="img" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md border border-white/10" />
                                            </div>
                                        )}
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-mono opacity-50 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            <span className="opacity-50">|</span>
                                                            {readTime}
                                                        </span>
                                                        {e.isDraft && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500 text-white">{t('common.draft')}</span>}
                                                    </div>
                                                    <h3 className={`font-bold text-lg transition-colors ${`group-hover:${CATEGORY_TEXT_COLORS[e.category] || 'text-current'}`}`}>{e.title || e.dateLabel}</h3>
                                                </div>
                                                {e.mood && <div className="text-2xl">{e.mood}</div>}
                                            </div>
                                            
                                            <div className="mt-2 text-sm opacity-80 line-clamp-2">
                                                {e.entryMode === 'free' ? (
                                                    <div dangerouslySetInnerHTML={{ __html: (e.freeTextContent || '').replace(/<[^>]+>/g, ' ').substring(0, 150) + '...' }} />
                                                ) : (
                                                    (Object.values(e.responses || {}) as string[]).filter(Boolean).join(' • ')
                                                )}
                                            </div>

                                            {/* Meta info for Timeline */}
                                            <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex-1">
                                                    {renderMetaInfo(e)}
                                                </div>
                                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2" onClick={ev => ev.stopPropagation()}>
                                                    {renderActionButtons(e)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return null;
};

export default EntryList;
