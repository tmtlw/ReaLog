
import React from 'react';
import { Trophy, Calendar as CalendarIcon, Flame, Target } from 'lucide-react';
import { Card } from '../ui';
import { Entry } from '../../types';

interface StreakViewProps {
    entries: Entry[];
    currentStreak: number;
    longestStreak: number;
    themeClasses: any;
    t: (key: string, params?: any) => string;
}

const StreakView: React.FC<StreakViewProps> = ({ entries, currentStreak, longestStreak, themeClasses, t }) => {
    
    // Generate a map of active days
    const activeDays = new Set(
        entries.map(e => new Date(e.timestamp).setHours(0,0,0,0))
    );

    const renderYearCalendar = () => {
        const today = new Date();
        const year = today.getFullYear();
        const months = Array.from({length: 12}, (_, i) => i);

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {months.map(month => {
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
                    const offset = firstDay === 0 ? 6 : firstDay - 1; // Mon start

                    return (
                        <div key={month} className={`p-3 rounded-lg border bg-black/5 ${themeClasses.card.includes('zinc') ? 'border-zinc-800' : 'border-slate-200'}`}>
                            <div className="font-bold text-sm mb-2 text-center capitalize">
                                {new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long' })}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-[9px] text-center opacity-50 mb-1">
                                <div>H</div><div>K</div><div>Sz</div><div>Cs</div><div>P</div><div>Sz</div><div>V</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({length: offset}).map((_, i) => <div key={`off-${i}`} />)}
                                {Array.from({length: daysInMonth}).map((_, i) => {
                                    const d = new Date(year, month, i + 1);
                                    const ts = d.setHours(0,0,0,0);
                                    const isActive = activeDays.has(ts);
                                    const isFuture = d > today;
                                    
                                    // Handle dark mode inactive cubes
                                    const inactiveClass = themeClasses.bg.includes('zinc-9') 
                                        ? 'bg-zinc-800 text-zinc-600' 
                                        : 'bg-black/5 text-black/30';

                                    return (
                                        <div 
                                            key={i} 
                                            className={`aspect-square rounded-sm flex items-center justify-center text-[9px] font-medium transition-colors
                                                ${isActive 
                                                    ? 'bg-orange-500 text-white shadow-sm' 
                                                    : isFuture ? 'opacity-0' : inactiveClass
                                                }`}
                                        >
                                            {i + 1}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    {t('stats.streak_title')}
                </h2>
                <p className="opacity-60">{t('stats.streak_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card themeClasses={themeClasses} className="p-6 flex flex-col items-center justify-center text-center border-orange-500/20 bg-orange-500/5">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 text-orange-500">
                        <Flame className="w-8 h-8" />
                    </div>
                    <span className="text-5xl font-black text-orange-500 mb-1">{currentStreak}</span>
                    <span className="text-sm font-bold uppercase tracking-wider opacity-70">{t('stats.current_streak')}</span>
                </Card>

                <Card themeClasses={themeClasses} className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-500">
                        <Target className="w-8 h-8" />
                    </div>
                    <span className="text-5xl font-black text-blue-500 mb-1">{longestStreak}</span>
                    <span className="text-sm font-bold uppercase tracking-wider opacity-70">{t('stats.longest_streak')}</span>
                </Card>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-orange-500" /> {t('stats.calendar_view')}
                </h3>
                {renderYearCalendar()}
            </div>
        </div>
    );
};

export default StreakView;
