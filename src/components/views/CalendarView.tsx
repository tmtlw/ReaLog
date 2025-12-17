
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Entry } from '../../types';
import { CATEGORY_COLORS } from '../../constants';

const CalendarView: React.FC<{
    entries: Entry[];
    currentDate: Date;
    onDateChange: (d: Date) => void;
    onSelectEntry: (e: Entry) => void;
    themeClasses: any;
    t?: (key: string) => string;
}> = ({ entries, currentDate, onDateChange, onSelectEntry, themeClasses, t }) => {
    // Determine days in month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    
    // Adjust for Monday start (Monday = 0 in our logic, Sunday = 6)
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const changeMonth = (offset: number) => {
        onDateChange(new Date(year, month + offset, 1));
    };

    const today = new Date();
    const isToday = (d: number) => year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
    const isCurrentMonthView = year === today.getFullYear() && month === today.getMonth();

    const getEntriesForDay = (d: number) => {
        return entries.filter(e => {
            const entryDate = new Date(e.timestamp);
            return entryDate.getFullYear() === year && 
                   entryDate.getMonth() === month && 
                   entryDate.getDate() === d;
        }).sort((a, b) => a.timestamp - b.timestamp); // Sort by time ascending for the list
    };

    return (
        <div className="animate-fade-in relative">
            {/* Calendar Header */}
            <div className={`flex items-center justify-between mb-4 p-4 rounded-lg border ${themeClasses.card}`}>
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-black/5 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                <div className="font-bold text-lg capitalize">
                    {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-black/5 rounded-full"><ChevronRight className="w-5 h-5" /></button>
            </div>

            {/* Jump to Today Button */}
            {!isCurrentMonthView && (
                <button 
                    onClick={() => onDateChange(new Date())}
                    className="absolute top-4 right-16 p-2 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all z-10"
                    title={t ? t('common.jump_today') : 'Today'}
                >
                    <CalendarIcon className="w-4 h-4" />
                </button>
            )}

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold opacity-60">
                <div>H</div><div>K</div><div>Sz</div><div>Cs</div><div>P</div><div>Sz</div><div>V</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square opacity-10"></div>
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEntries = getEntriesForDay(day);
                    const current = isToday(day);
                    
                    return (
                        <div 
                            key={day} 
                            className={`aspect-square rounded-lg border relative flex flex-col pt-1 transition-all cursor-pointer hover:border-emerald-500/50 overflow-hidden ${current ? 'bg-emerald-500/10 border-emerald-500' : themeClasses.card}`}
                            onClick={() => {
                                if (dayEntries.length > 0) onSelectEntry(dayEntries[0]);
                            }}
                        >
                            <span className={`text-xs font-bold text-center block mb-1 ${current ? 'text-emerald-500' : 'opacity-70'}`}>{day}</span>
                            
                            {/* List View inside Cell */}
                            <div className="flex-1 overflow-y-auto px-1 pb-1 space-y-1 no-scrollbar">
                                {dayEntries.map(e => (
                                    <div 
                                        key={e.id} 
                                        onClick={(ev) => { ev.stopPropagation(); onSelectEntry(e); }}
                                        className={`text-[9px] leading-tight p-1 rounded truncate hover:bg-white/10 transition-colors ${e.isDraft ? 'italic opacity-70' : ''}`}
                                        title={`${new Date(e.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${e.title || e.dateLabel}`}
                                    >
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${CATEGORY_COLORS[e.category]}`}></span>
                                        <span className="opacity-70 mr-1">{new Date(e.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                        <span className="font-medium">{e.title || e.dateLabel}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {dayEntries.length > 0 && dayEntries.some(e => e.photo) && (
                                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-50 pointer-events-none"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
