
import React from 'react';
import { Layers, LayoutGrid, FileText, Activity, ThermometerSun } from 'lucide-react';
import { Category, AppSettings } from '../../types';

interface SettingsViewsTabProps {
    localSettings: Partial<AppSettings>;
    setLocalSettings: React.Dispatch<React.SetStateAction<Partial<AppSettings>>>;
    themeClasses: any;
    t: (key: string) => string;
}

const SettingsViewsTab: React.FC<SettingsViewsTabProps> = ({ localSettings, setLocalSettings, themeClasses, t }) => {
    
    const updateCategoryConfig = (cat: Category, key: string, value: boolean) => {
        setLocalSettings(prev => ({
            ...prev,
            categoryConfigs: {
                ...prev.categoryConfigs,
                [cat]: {
                    ...(prev.categoryConfigs?.[cat] || { viewMode: 'grid' }),
                    [key]: value
                }
            }
        }));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Grid Layout Section */}
            <div className="p-4 rounded-lg bg-black/5 border border-white/5">
                <h4 className={`font-bold flex items-center gap-2 mb-3 ${themeClasses.accent}`}>
                    <LayoutGrid className="w-4 h-4" /> {t('settings.grid_layout')}
                </h4>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="gridLayout" 
                            value="standard" 
                            checked={!localSettings.gridLayout || localSettings.gridLayout === 'standard'} 
                            onChange={() => setLocalSettings(prev => ({ ...prev, gridLayout: 'standard' }))} 
                            className="accent-emerald-500 w-4 h-4" 
                        />
                        <span className="text-sm">{t('settings.layout_standard')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="gridLayout" 
                            value="masonry" 
                            checked={localSettings.gridLayout === 'masonry'} 
                            onChange={() => setLocalSettings(prev => ({ ...prev, gridLayout: 'masonry' }))} 
                            className="accent-emerald-500 w-4 h-4" 
                        />
                        <span className="text-sm">{t('settings.layout_masonry')}</span>
                    </label>
                </div>
            </div>

            {/* Weather Icons Section */}
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm">
                <h4 className="font-bold flex items-center gap-2 mb-3 text-cyan-500">
                    <ThermometerSun className="w-4 h-4" /> {t('settings.weather_icons')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {['outline', 'filled', 'color', 'emoji', 'ascii', 'thin', 'bold', 'cartoon', 'mono-duotone', 'neon'].map(pack => (
                        <button
                            key={pack}
                            onClick={() => setLocalSettings(prev => ({ ...prev, weatherIconPack: pack as any }))}
                            className={`p-2 rounded border text-xs capitalize ${localSettings.weatherIconPack === pack ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-black/5 border-transparent hover:bg-black/10'}`}
                        >
                            {pack}
                        </button>
                    ))}
                </div>
            </div>

            {/* Features Toggle Section */}
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm">
                <h4 className="font-bold flex items-center gap-2 mb-3 text-orange-500">
                    <Activity className="w-4 h-4" /> {t('settings.features')}
                </h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="enable_habits" 
                            className="w-4 h-4 accent-orange-500" 
                            checked={localSettings.enableHabits ?? true} 
                            onChange={(e) => setLocalSettings(prev => ({ ...prev, enableHabits: e.target.checked }))} 
                        />
                        <label htmlFor="enable_habits" className="text-sm font-medium">{t('settings.enable_habits')}</label>
                    </div>
                </div>
            </div>

            {/* Writing Goals Section */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                <h4 className="font-bold flex items-center gap-2 mb-3 text-blue-500">
                    <FileText className="w-4 h-4" /> {t('settings.writing_goals')}
                </h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm opacity-80">{t('settings.show_word_count')}</label>
                        <input 
                            type="checkbox" 
                            className="accent-blue-500 w-5 h-5" 
                            checked={localSettings.showWordCount !== false} 
                            onChange={(e) => setLocalSettings(prev => ({ ...prev, showWordCount: e.target.checked }))} 
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm opacity-80">{t('settings.min_word_count')}</label>
                        <input 
                            type="number" 
                            className={`w-20 text-right rounded px-2 py-1 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${themeClasses.input} ${themeClasses.bg}`} 
                            value={localSettings.minWordCount || 0} 
                            onChange={(e: any) => setLocalSettings(prev => ({ ...prev, minWordCount: parseInt(e.target.value) || 0 }))} 
                        />
                    </div>
                </div>
            </div>

            {/* Hierarchical View Section */}
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm space-y-4">
                <div>
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-emerald-500">
                        <Layers className="w-4 h-4" /> {t('settings.hierarchical_view')}
                    </h4>
                    <p className="opacity-80 mb-4">{t('settings.hierarchical_hint')}</p>
                </div>

                <div className="space-y-4 divide-y divide-emerald-500/20">
                    {/* Weekly Config */}
                    <div className="pt-2">
                        <h5 className="font-bold text-blue-400 mb-2">{t('settings.weekly_view')}</h5>
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="w_inc_d" 
                                className="accent-emerald-500 w-4 h-4" 
                                checked={localSettings.categoryConfigs?.[Category.WEEKLY]?.includeDaily || false} 
                                onChange={(e) => updateCategoryConfig(Category.WEEKLY, 'includeDaily', e.target.checked)} 
                            />
                            <label htmlFor="w_inc_d" className="text-sm cursor-pointer">{t('settings.inc_daily')}</label>
                        </div>
                    </div>

                    {/* Monthly Config */}
                    <div className="pt-2">
                        <h5 className="font-bold text-purple-400 mb-2">{t('settings.monthly_view')}</h5>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="m_inc_d" 
                                    className="accent-emerald-500 w-4 h-4"
                                    checked={localSettings.categoryConfigs?.[Category.MONTHLY]?.includeDaily || false}
                                    onChange={(e) => updateCategoryConfig(Category.MONTHLY, 'includeDaily', e.target.checked)}
                                />
                                <label htmlFor="m_inc_d" className="text-sm cursor-pointer">{t('settings.inc_daily')}</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="m_inc_w" 
                                    className="accent-blue-500 w-4 h-4"
                                    checked={localSettings.categoryConfigs?.[Category.MONTHLY]?.includeWeekly || false}
                                    onChange={(e) => updateCategoryConfig(Category.MONTHLY, 'includeWeekly', e.target.checked)}
                                />
                                <label htmlFor="m_inc_w" className="text-sm cursor-pointer">{t('settings.inc_weekly')}</label>
                            </div>
                        </div>
                    </div>

                    {/* Yearly Config */}
                    <div className="pt-2">
                        <h5 className="font-bold text-amber-400 mb-2">{t('settings.yearly_view')}</h5>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="y_inc_d" 
                                    className="accent-emerald-500 w-4 h-4"
                                    checked={localSettings.categoryConfigs?.[Category.YEARLY]?.includeDaily || false}
                                    onChange={(e) => updateCategoryConfig(Category.YEARLY, 'includeDaily', e.target.checked)}
                                />
                                <label htmlFor="y_inc_d" className="text-sm cursor-pointer">{t('settings.inc_daily')}</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="y_inc_w" 
                                    className="accent-blue-500 w-4 h-4"
                                    checked={localSettings.categoryConfigs?.[Category.YEARLY]?.includeWeekly || false}
                                    onChange={(e) => updateCategoryConfig(Category.YEARLY, 'includeWeekly', e.target.checked)}
                                />
                                <label htmlFor="y_inc_w" className="text-sm cursor-pointer">{t('settings.inc_weekly')}</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="y_inc_m" 
                                    className="accent-purple-500 w-4 h-4"
                                    checked={localSettings.categoryConfigs?.[Category.YEARLY]?.includeMonthly || false}
                                    onChange={(e) => updateCategoryConfig(Category.YEARLY, 'includeMonthly', e.target.checked)}
                                />
                                <label htmlFor="y_inc_m" className="text-sm cursor-pointer">{t('settings.inc_monthly')}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsViewsTab;
