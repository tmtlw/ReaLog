
import React from 'react';
import { Entry } from '../../types';
import { CalendarClock } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';

interface Props {
    entries: Entry[];
    themeClasses: any;
    t: (key: string, params?: any) => string;
    onViewEntry: (e: Entry) => void;
}

export const OnThisDayWidget: React.FC<Props> = ({ entries, themeClasses, t, onViewEntry }) => {
    if (entries.length === 0) return null;

    return (
        <WidgetWrapper title={t('nav.on_this_day')} icon={<CalendarClock className="w-4 h-4"/>} themeClasses={themeClasses}>
            <div className="space-y-3">
                {entries.slice(0, 3).map(e => (
                    <div key={e.id} className="group cursor-pointer hover:bg-white/5 p-2 rounded transition-colors" onClick={() => onViewEntry(e)}>
                        <div className="text-xs opacity-50 mb-1">{new Date(e.timestamp).getFullYear()}</div>
                        <div className="font-medium group-hover:text-emerald-500 transition-colors line-clamp-2 text-sm">
                            {e.title || e.dateLabel}
                        </div>
                    </div>
                ))}
                {entries.length > 3 && (
                     <div className="text-center text-xs opacity-50 pt-2 border-t border-white/5">
                        +{entries.length - 3} további
                     </div>
                )}
            </div>
        </WidgetWrapper>
    );
};
