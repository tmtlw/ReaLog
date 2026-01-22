
import React from 'react';
import { AppData } from '../../types';
import { BarChart3 } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';

interface StatsWidgetProps {
    data: AppData;
    themeClasses: any;
    t: (key: string) => string;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ data, themeClasses, t }) => {
    const entryCount = data.entries.filter(e => !e.isTrashed).length;
    const wordCount = data.entries.reduce((acc, e) => acc + (e.freeTextContent?.split(' ').length || 0), 0);

    return (
        <WidgetWrapper title={t('nav.stats')} icon={<BarChart3 className="w-4 h-4"/>} themeClasses={themeClasses}>
            <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-2xl font-bold">{entryCount}</div>
                    <div className="text-[10px] md:text-xs opacity-60 uppercase tracking-wider">{t('app.entries_tab')}</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-2xl font-bold">{wordCount}</div>
                    <div className="text-[10px] md:text-xs opacity-60 uppercase tracking-wider">Szavak</div>
                </div>
            </div>
        </WidgetWrapper>
    );
}
