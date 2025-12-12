
import React, { useRef } from 'react';
import { User, Upload, BookOpen } from 'lucide-react';
import { AppSettings } from '../../types';
import { Input } from '../ui';
import { AVAILABLE_LANGUAGES, Language } from '../../services/i18n';

interface SettingsAccountTabProps {
    localSettings: Partial<AppSettings>;
    setLocalSettings: React.Dispatch<React.SetStateAction<Partial<AppSettings>>>;
    themeClasses: any;
    t: (key: string) => string;
}

const SettingsAccountTab: React.FC<SettingsAccountTabProps> = ({ localSettings, setLocalSettings, themeClasses, t }) => {
    const profileRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalSettings(prev => ({
                    ...prev,
                    [type === 'profile' ? 'profileImage' : 'bookCoverImage']: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        } catch (e) {
            console.error("Image upload failed", e);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-500"><User className="w-4 h-4" /> {t('settings.tabs.account')}</h4>
                <p className="opacity-80">Itt testreszabhatod a megjelenített nevet, a jelszót és az egyéb személyes beállításokat.</p>
            </div>
            
            {/* Display Name */}
            <div>
                <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>{t('settings.display_name')}</label>
                <Input themeClasses={themeClasses} value={localSettings.userName || ''} onChange={(e: any) => setLocalSettings(prev => ({ ...prev, userName: e.target.value }))} placeholder={t('settings.account_hint_name')} />
            </div>

            {/* Weather API Key */}
            <div>
                <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>{t('settings.weather_api')}</label>
                <Input themeClasses={themeClasses} value={localSettings.openWeatherMapKey || ''} onChange={(e: any) => setLocalSettings(prev => ({ ...prev, openWeatherMapKey: e.target.value }))} placeholder="api_key_..." />
            </div>
            
            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>Profilkép (Könyv)</label>
                    <div className="border border-dashed rounded-lg p-2 text-center relative hover:bg-black/5 transition-colors cursor-pointer" onClick={() => profileRef.current?.click()}>
                        {localSettings.profileImage ? <img src={localSettings.profileImage} className="h-20 mx-auto rounded object-cover" /> : <div className="h-20 flex flex-col items-center justify-center opacity-50"><Upload className="w-6 h-6 mb-1" /><span className="text-[10px]">Feltöltés</span></div>}
                        <input type="file" ref={profileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'profile')} />
                    </div>
                </div>
                <div>
                    <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>Könyvborító (Export)</label>
                    <div className="border border-dashed rounded-lg p-2 text-center relative hover:bg-black/5 transition-colors cursor-pointer" onClick={() => coverRef.current?.click()}>
                        {localSettings.bookCoverImage ? <img src={localSettings.bookCoverImage} className="h-20 mx-auto rounded object-cover" /> : <div className="h-20 flex flex-col items-center justify-center opacity-50"><BookOpen className="w-6 h-6 mb-1" /><span className="text-[10px]">Feltöltés</span></div>}
                        <input type="file" ref={coverRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'cover')} />
                    </div>
                </div>
            </div>

            {/* Language */}
            <div>
                <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>{t('settings.language')}</label>
                <select value={localSettings.language || 'hu'} onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value as Language }))} className={`w-full rounded-lg px-4 py-2 border focus:ring-2 focus:outline-none transition-all ${themeClasses.input} ${themeClasses.bg}`}>
                    {AVAILABLE_LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.label}</option>))}
                </select>
            </div>

            {/* Password */}
            <div>
                <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>{t('settings.admin_password')}</label>
                <Input themeClasses={themeClasses} type="password" value={localSettings.adminPassword || ''} onChange={(e: any) => setLocalSettings(prev => ({ ...prev, adminPassword: e.target.value }))} placeholder={t('settings.admin_password_hint')} />
                <p className="text-[10px] opacity-50 mt-1">{t('settings.account_hint_pass')}</p>
            </div>
        </div>
    );
};

export default SettingsAccountTab;
