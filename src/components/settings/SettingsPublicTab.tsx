
import React from 'react';
import { Shield, Globe, Image as ImageIcon, PieChart, Trophy } from 'lucide-react';
import { AppSettings } from '../../types';

interface SettingsPublicTabProps {
    localSettings: Partial<AppSettings>;
    setLocalSettings: React.Dispatch<React.SetStateAction<Partial<AppSettings>>>;
    themeClasses: any;
    t: (key: string) => string;
}

const SettingsPublicTab: React.FC<SettingsPublicTabProps> = ({ localSettings, setLocalSettings, themeClasses, t }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-500"><Shield className="w-4 h-4" /> {t('settings.public_settings')}</h4>
                <p className="opacity-80">Itt szabályozhatod, hogy a bejelentkezés nélküli látogatók mely funkciókat érhetik el.</p>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded border border-white/5 bg-black/5">
                    <div className="flex items-center gap-2"><Globe className="w-4 h-4 opacity-70" /><span className="text-sm font-medium">{t('settings.public_atlas')}</span></div>
                    <input type="checkbox" className="accent-emerald-500 w-5 h-5" checked={localSettings.publicConfig?.showAtlas ?? true} onChange={(e) => setLocalSettings(prev => ({ ...prev, publicConfig: { ...prev.publicConfig, showAtlas: e.target.checked } }))} />
                </div>
                <div className="flex items-center justify-between p-3 rounded border border-white/5 bg-black/5">
                    <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4 opacity-70" /><span className="text-sm font-medium">{t('settings.public_gallery')}</span></div>
                    <input type="checkbox" className="accent-emerald-500 w-5 h-5" checked={localSettings.publicConfig?.showGallery ?? true} onChange={(e) => setLocalSettings(prev => ({ ...prev, publicConfig: { ...prev.publicConfig, showGallery: e.target.checked } }))} />
                </div>
            </div>
            <div className="pt-4 border-t border-white/5">
                <h5 className={`font-bold text-xs uppercase mb-3 ${themeClasses.subtext}`}>{t('settings.features')}</h5>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="enable_stats" className="w-4 h-4 accent-emerald-500" checked={localSettings.enableStats ?? false} onChange={(e) => setLocalSettings(prev => ({ ...prev, enableStats: e.target.checked }))} />
                        <label htmlFor="enable_stats" className="text-sm font-medium flex items-center gap-2"><PieChart className="w-4 h-4 text-emerald-500" /> {t('settings.enable_stats')}</label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="enable_gamification" className="w-4 h-4 accent-orange-500" checked={localSettings.enableGamification ?? false} onChange={(e) => setLocalSettings(prev => ({ ...prev, enableGamification: e.target.checked }))} />
                        <label htmlFor="enable_gamification" className="text-sm font-medium flex items-center gap-2"><Trophy className="w-4 h-4 text-orange-500" /> {t('settings.enable_gamification')}</label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPublicTab;
