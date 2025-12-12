
import React from 'react';
import { Cloud } from 'lucide-react';
import { AppSettings } from '../../types';
import { Input } from '../ui';

interface SettingsCloudTabProps {
    localSettings: Partial<AppSettings>;
    setLocalSettings: React.Dispatch<React.SetStateAction<Partial<AppSettings>>>;
    themeClasses: any;
}

const SettingsCloudTab: React.FC<SettingsCloudTabProps> = ({ localSettings, setLocalSettings, themeClasses }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
                <h4 className="font-bold flex items-center gap-2 mb-2 text-emerald-500"><Cloud className="w-4 h-4" /> Külső Szinkronizáció</h4>
                <p className="opacity-80 mb-2">
                    Ha nem a saját szervereden futtatod az alkalmazást, itt beállíthatsz egy külső JSON tárolót (pl. JSONBin.io).
                </p>
                <a href="https://jsonbin.io" target="_blank" className="underline font-bold hover:text-emerald-400">JSONBin.io Regisztráció &rarr;</a>
            </div>

            <div className="flex items-center gap-3">
                <input 
                    type="checkbox" 
                    id="cloudEnabled"
                    checked={localSettings.cloud?.enabled || false}
                    onChange={(e) => setLocalSettings(prev => ({...prev, cloud: { ...prev.cloud, enabled: e.target.checked } }))}
                    className="w-5 h-5 accent-emerald-500"
                />
                <label htmlFor="cloudEnabled" className="font-bold cursor-pointer">Külső felhő engedélyezése</label>
            </div>

            <div className={!localSettings.cloud?.enabled ? 'opacity-50 pointer-events-none' : ''}>
                <div className="mb-4">
                    <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>API URL (Endpoint)</label>
                    <Input 
                        themeClasses={themeClasses} 
                        placeholder="https://api.jsonbin.io/v3/b/<BIN_ID>"
                        value={localSettings.cloud?.url || ''}
                        onChange={(e: any) => setLocalSettings(prev => ({...prev, cloud: { ...prev.cloud, url: e.target.value } }))}
                    />
                </div>
                <div>
                    <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>API Kulcs (Auth Header)</label>
                    <Input 
                        themeClasses={themeClasses} 
                        type="password"
                        placeholder="X-Master-Key vagy Bearer Token"
                        value={localSettings.cloud?.apiKey || ''}
                        onChange={(e: any) => setLocalSettings(prev => ({...prev, cloud: { ...prev.cloud, apiKey: e.target.value } }))}
                    />
                </div>
            </div>
        </div>
    );
};

export default SettingsCloudTab;
