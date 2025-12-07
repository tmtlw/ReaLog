import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Entry } from '../../types';
import { CATEGORY_COLORS } from '../../constants';

const CalendarView: React.FC<{
    entries: Entry[];
    currentDate: Date;
    onDateChange: (d: Date) => void;
    onSelectEntry: (e: Entry) => void;
    themeClasses: any;
}> = ({ entries, currentDate, onDateChange, onSelectEntry, themeClasses }) => {
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

    const getEntriesForDay = (d: number) => {
        return entries.filter(e => {
            const entryDate = new Date(e.timestamp);
            return entryDate.getFullYear() === year && 
                   entryDate.getMonth() === month && 
                   entryDate.getDate() === d;
        });
    };

    return (
        <div className="animate-fade-in">
            {/* Calendar Header */}
            <div className={`flex items-center justify-between mb-4 p-4 rounded-lg border ${themeClasses.card}`}>
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-black/5 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                <div className="font-bold text-lg capitalize">
                    {currentDate.toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-black/5 rounded-full"><ChevronRight className="w-5 h-5" /></button>
            </div>

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
                            className={`aspect-square rounded-lg border relative flex flex-col items-center justify-start pt-2 transition-all cursor-pointer hover:border-emerald-500/50 ${current ? 'bg-emerald-500/10 border-emerald-500' : themeClasses.card}`}
                            onClick={() => {
                                if (dayEntries.length > 0) onSelectEntry(dayEntries[0]);
                            }}
                        >
                            <span className={`text-xs font-bold ${current ? 'text-emerald-500' : 'opacity-70'}`}>{day}</span>
                            
                            <div className="flex flex-wrap gap-1 justify-center mt-1 px-1">
                                {dayEntries.map(e => (
                                    <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[e.category]}`} title={e.title || e.dateLabel}></div>
                                ))}
                            </div>
                            
                            {dayEntries.length > 0 && dayEntries[0].photo && (
                                <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-400 rounded-full opacity-50" title="Van fotó"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;