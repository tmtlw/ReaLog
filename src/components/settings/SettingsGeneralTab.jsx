
import React from 'react';
import { AppSettings, ThemeOption } from '../../types';
import { Input } from '../ui';

const DEFAULT_MOODS = ['🔥', '🚀', '🙂', '😐', '😫'];



const SettingsGeneralTab = ({ localSettings, setLocalSettings, themeClasses, currentTheme, setCurrentTheme, t }) => {
    return (
        <div className="space-y-4 animate-fade-in">
            <div>
                <label className={`text-xs uppercase font-bold ${themeClasses.subtext}`}>{t('settings.theme')}</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['light', 'dark', 'lavender', 'system'] as const).map(t => (
                        <button key={t} onClick={() => {
                                setCurrentTheme(t);
                                // Explicitly unset activeHoliday to prevent sticky behavior
                                setLocalSettings(prev => ({...prev, theme: t, activeHoliday: undefined}))
                            }}
                            className={`p-2 rounded border text-sm capitalize ${currentTheme === t ? themeClasses.accent + ' border-current' : 'border-transparent bg-black/5'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className={`text-xs uppercase font-bold ${themeClasses.subtext}`}>{t('settings.mood_emojis')}</label>
                <p className="text-[10px] opacity-60 mb-2">Vesszővel vagy szóközzel elválasztva</p>
                <Input
                    themeClasses={themeClasses}
                    value={localSettings.moods?.join(' ') || DEFAULT_MOODS.join(' ')}
                    onChange={(e) => {
                        const newMoods = e.target.value.split(/[, ]+/).filter((x) => x.trim() !== '');
                        setLocalSettings(prev => ({ ...prev, moods: newMoods }));
                    }}
                    placeholder="🔥 🚀 🙂"
                />
            </div>
            <div>
                <label className={`text-xs uppercase font-bold ${themeClasses.subtext}`}>{t('settings.weather_api')}</label>
                <Input themeClasses={themeClasses} value={localSettings.openWeatherMapKey || ''} onChange={(e) => setLocalSettings(prev => ({ ...prev, openWeatherMapKey: e.target.value }))} placeholder="api_key_..." />
            </div>
        </div>
    );
};

export default SettingsGeneralTab;
