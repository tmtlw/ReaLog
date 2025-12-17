
import React from 'react';
import { Layout, ArrowUp, ArrowDown, Map as MapIcon } from 'lucide-react';
import { AppSettings } from '../../types';

interface SettingsLayoutTabProps {
    localSettings: Partial<AppSettings>;
    setLocalSettings: React.Dispatch<React.SetStateAction<Partial<AppSettings>>>;
    themeClasses: any;
    t?: (key: string) => string;
}

const DEFAULT_ORDER = ['header', 'mood', 'tags', 'content', 'habits', 'gallery', 'map'];

const SettingsLayoutTab: React.FC<SettingsLayoutTabProps> = ({ localSettings, setLocalSettings, themeClasses, t = (k:string)=>k }) => {
    // Ensure map is in the list if not already
    const currentOrder = localSettings.entryModalLayout || DEFAULT_ORDER;
    if (!currentOrder.includes('map')) {
        currentOrder.push('map');
    }

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...currentOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setLocalSettings(prev => ({ ...prev, entryModalLayout: newOrder }));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
                <h4 className="font-bold flex items-center gap-2 mb-2 text-emerald-500"><Layout className="w-4 h-4" /> {t('settings.tabs.layout')}</h4>
                <p className="opacity-80">{t('settings.layout_desc')}</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    {currentOrder.map((item, index) => (
                        <div key={item} className={`flex items-center justify-between p-3 rounded-lg border bg-black/5 ${themeClasses.card}`}>
                            <span className="text-sm font-bold">{t(`settings.layout_${item}`)}</span>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => moveItem(index, 'up')} 
                                    disabled={index === 0}
                                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => moveItem(index, 'down')} 
                                    disabled={index === currentOrder.length - 1}
                                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/10 pt-4">
                    <label className={`text-xs uppercase font-bold block mb-2 ${themeClasses.subtext} flex items-center gap-2`}>
                        <MapIcon className="w-3 h-3" /> {t('settings.map_size')}
                    </label>
                    <select 
                        value={localSettings.entryMapSize || 'medium'}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, entryMapSize: e.target.value as any }))}
                        className={`w-full rounded-lg px-4 py-2 border focus:ring-2 focus:outline-none transition-all ${themeClasses.input} ${themeClasses.bg}`}
                    >
                        <option value="small">{t('settings.map_small')} (128px)</option>
                        <option value="medium">{t('settings.map_medium')} (256px)</option>
                        <option value="large">{t('settings.map_large')} (384px)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SettingsLayoutTab;
