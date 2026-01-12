import React from 'react';
import { AppData, Entry, WidgetConfig, User, WeatherIconPack, EmojiStyle } from '../../types';
import { DEFAULT_WIDGETS } from '../../constants';
import { WidgetWrapper } from '../dashboard/WidgetWrapper';
import { StatsWidget } from '../dashboard/StatsWidget';
import { OnThisDayWidget } from '../dashboard/OnThisDayWidget';
import EntryList from './EntryList';
import { Users, Activity } from 'lucide-react';

interface DashboardProps {
    data: AppData;
    themeClasses: any;
    t: (key: string, params?: any) => string;
    onSelectEntry: (e: Entry) => void;
    isAdmin: boolean;
    weatherPack: WeatherIconPack;
    emojiStyle: EmojiStyle;
    currentUser: User | null;
}

export default function DashboardView({
    data,
    themeClasses,
    t,
    onSelectEntry,
    isAdmin,
    weatherPack,
    emojiStyle,
    currentUser
}: DashboardProps) {

    const widgets = data.dashboardWidgets || DEFAULT_WIDGETS || [];

    // Ezen a napon bejegyzések (mindenkié)
    const today = new Date();
    const md = `${today.getMonth()+1}-${today.getDate()}`;
    const onThisDayEntries = data.entries.filter(e => {
            const d = new Date(e.timestamp);
            return `${d.getMonth()+1}-${d.getDate()}` === md && d.getFullYear() !== today.getFullYear() && !e.isTrashed && (!e.isPrivate || isAdmin || e.userId === currentUser?.id);
    }).sort((a,b) => b.timestamp - a.timestamp);

    // Feed: Minden bejegyzés, kivéve kuka
    const feedEntries = data.entries.filter(e => {
        if (e.isTrashed) return false;
        if (e.isPrivate) {
            // Privát: Csak ha admin vagy a sajátja
            return isAdmin || (currentUser && e.userId === currentUser.id);
        }
        return true;
    }).sort((a,b) => b.timestamp - a.timestamp).slice(0, 50);

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
            {/* Bal oszlop: Widgetek (1/3) */}
            <div className="w-full lg:w-1/3 space-y-6">
                {/* Üdvözlet */}
                <div className={`p-6 rounded-2xl ${themeClasses.card} border border-white/10 shadow-lg`}>
                    <h2 className="text-2xl font-bold mb-1">Szia, {currentUser?.name || 'Vendég'}! 👋</h2>
                    <p className="opacity-60 text-sm">{new Date().toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {widgets.sort((a,b) => a.order - b.order).map(widget => {
                    if (!widget.isEnabled) return null;
                    switch(widget.type) {
                        case 'stats':
                            return <StatsWidget key={widget.id} data={data} themeClasses={themeClasses} t={t} />;
                        case 'onThisDay':
                            return <OnThisDayWidget key={widget.id} entries={onThisDayEntries} themeClasses={themeClasses} t={t} onViewEntry={onSelectEntry} />;
                        case 'activeUsers':
                            return (
                                <WidgetWrapper key={widget.id} title="Felhasználók" icon={<Users className="w-4 h-4"/>} themeClasses={themeClasses}>
                                    <div className="flex flex-col gap-2">
                                        {(data.users || []).map(u => (
                                            <div key={u.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors cursor-default">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                                                    style={{ backgroundColor: u.color || '#10b981', color: '#fff' }}
                                                >
                                                    {u.avatar || u.name.charAt(0)}
                                                </div>
                                                <span className="font-medium">{u.name}</span>
                                                {u.isAdmin && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded ml-auto">ADMIN</span>}
                                            </div>
                                        ))}
                                        {(!data.users || data.users.length === 0) && <span className="text-xs opacity-50 p-2">Nincs felhasználó</span>}
                                    </div>
                                </WidgetWrapper>
                            );
                        default:
                            return null;
                    }
                })}
            </div>

            {/* Jobb oszlop: Feed (2/3) */}
            <div className="w-full lg:w-2/3">
                <div className="flex items-center gap-2 mb-4 opacity-80 px-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h2 className="font-bold text-lg uppercase tracking-wider">Közösségi Üzenőfal</h2>
                </div>

                <EntryList
                    viewMode="grid"
                    entries={feedEntries}
                    onSelectEntry={onSelectEntry}
                    renderActionButtons={() => null}
                    themeClasses={themeClasses}
                    isAdmin={isAdmin}
                    t={t}
                    weatherPack={weatherPack}
                    emojiStyle={emojiStyle}
                />
            </div>
        </div>
    );
}
