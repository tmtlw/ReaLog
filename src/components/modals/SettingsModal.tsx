import React, { useState } from 'react';
import { Layers, Shield, Globe, Images, User, Cloud } from 'lucide-react';
import { AppData, Category, ThemeOption } from '../../types';
import { Button, Card, Input } from '../ui';
import { DEFAULT_MOODS } from '../../constants';

const SettingsModal: React.FC<{ 
    onClose: () => void, 
    data: AppData,
    setData: React.Dispatch<React.SetStateAction<AppData>>, 
    themeClasses: any, 
    currentTheme: ThemeOption, 
    setCurrentTheme: (t: ThemeOption) => void
}> = ({ onClose, data, setData, themeClasses, currentTheme, setCurrentTheme }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'views' | 'public' | 'account' | 'cloud'>('general');
    const [localSettings, setLocalSettings] = useState(data.settings || {});

    const handleSave = () => {
        setData(prev => ({ ...prev, settings: localSettings }));
        onClose();
    };

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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card themeClasses={themeClasses} className="w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className={`flex border-b overflow-x-auto ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-200'}`}>
                    <button onClick={() => setActiveTab('general')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'general' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>Általános</button>
                    <button onClick={() => setActiveTab('views')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'views' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>Nézet</button>
                    <button onClick={() => setActiveTab('public')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'public' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>Publikus</button>
                    <button onClick={() => setActiveTab('account')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'account' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>Fiók</button>
                    <button onClick={() => setActiveTab('cloud')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'cloud' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>Felhő</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'general' && (
                        <div className="space-y-4">
                            <div>
                                <label className={`text-xs uppercase font-bold ${themeClasses.subtext}`}>Téma</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {(['light', 'dark', 'lavender', 'system'] as const).map(t => (
                                        <button key={t} onClick={() => { setCurrentTheme(t); setLocalSettings(prev => ({...prev, theme: t})) }} 
                                            className={`p-2 rounded border text-sm capitalize ${currentTheme === t ? themeClasses.accent + ' border-current' : 'border-transparent bg-black/5'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={`text-xs uppercase font-bold ${themeClasses.subtext}`}>Hangulat Emojik</label>
                                <p className="text-[10px] opacity-60 mb-2">Vesszővel vagy szóközzel elválasztva</p>
                                <Input 
                                    themeClasses={themeClasses} 
                                    value={localSettings.moods?.join(' ') || DEFAULT_MOODS.join(' ')} 
                                    onChange={(e: any) => {
                                        const newMoods = e.target.value.split(/[, ]+/).filter((x: string) => x.trim() !== '');
                                        setLocalSettings(prev => ({ ...prev, moods: newMoods }));
                                    }} 
                                    placeholder="🔥 🚀 🙂" 
                                />
                            </div>
                            <div>
                                <label className={`text-xs uppercase font-bold ${themeClasses.subtext}`}>OpenWeatherMap API Kulcs</label>
                                <Input themeClasses={themeClasses} value={localSettings.openWeatherMapKey || ''} onChange={(e: any) => setLocalSettings(prev => ({ ...prev, openWeatherMapKey: e.target.value }))} placeholder="api_key_..." />
                            </div>
                        </div>
                    )}

                    {activeTab === 'views' && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
                                <h4 className="font-bold flex items-center gap-2 mb-2 text-emerald-500"><Layers className="w-4 h-4" /> Hierarchikus Nézet</h4>
                                <p className="opacity-80">
                                    Itt beállíthatod, hogy a magasabb szintű nézetek (pl. Havi) megjelenítsék-e az alacsonyabb szintű bejegyzéseket (pl. Napi, Heti).
                                </p>
                            </div>

                            {/* Weekly Config */}
                            <div className="border-b pb-4 border-white/5">
                                <h5 className="font-bold text-blue-400 mb-2">Heti Nézet Beállításai</h5>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="w_inc_d" className="accent-emerald-500" 
                                        checked={localSettings.categoryConfigs?.[Category.WEEKLY]?.includeDaily || false}
                                        onChange={(e) => updateCategoryConfig(Category.WEEKLY, 'includeDaily', e.target.checked)}
                                    />
                                    <label htmlFor="w_inc_d" className="text-sm">Napi bejegyzések megjelenítése</label>
                                </div>
                            </div>

                            {/* Monthly Config */}
                            <div className="border-b pb-4 border-white/5">
                                <h5 className="font-bold text-purple-400 mb-2">Havi Nézet Beállításai</h5>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="m_inc_d" className="accent-emerald-500"
                                            checked={localSettings.categoryConfigs?.[Category.MONTHLY]?.includeDaily || false}
                                            onChange={(e) => updateCategoryConfig(Category.MONTHLY, 'includeDaily', e.target.checked)}
                                        />
                                        <label htmlFor="m_inc_d" className="text-sm">Napi bejegyzések megjelenítése</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="m_inc_w" className="accent-blue-500"
                                            checked={localSettings.categoryConfigs?.[Category.MONTHLY]?.includeWeekly || false}
                                            onChange={(e) => updateCategoryConfig(Category.MONTHLY, 'includeWeekly', e.target.checked)}
                                        />
                                        <label htmlFor="m_inc_w" className="text-sm">Heti bejegyzések megjelenítése</label>
                                    </div>
                                </div>
                            </div>

                            {/* Yearly Config */}
                            <div>
                                <h5 className="font-bold text-amber-400 mb-2">Éves Nézet Beállításai</h5>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="y_inc_d" className="accent-emerald-500"
                                            checked={localSettings.categoryConfigs?.[Category.YEARLY]?.includeDaily || false}
                                            onChange={(e) => updateCategoryConfig(Category.YEARLY, 'includeDaily', e.target.checked)}
                                        />
                                        <label htmlFor="y_inc_d" className="text-sm">Napi bejegyzések megjelenítése</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="y_inc_w" className="accent-blue-500"
                                            checked={localSettings.categoryConfigs?.[Category.YEARLY]?.includeWeekly || false}
                                            onChange={(e) => updateCategoryConfig(Category.YEARLY, 'includeWeekly', e.target.checked)}
                                        />
                                        <label htmlFor="y_inc_w" className="text-sm">Heti bejegyzések megjelenítése</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="y_inc_m" className="accent-purple-500"
                                            checked={localSettings.categoryConfigs?.[Category.YEARLY]?.includeMonthly || false}
                                            onChange={(e) => updateCategoryConfig(Category.YEARLY, 'includeMonthly', e.target.checked)}
                                        />
                                        <label htmlFor="y_inc_m" className="text-sm">Havi bejegyzések megjelenítése</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'public' && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                                <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-500"><Shield className="w-4 h-4" /> Publikus Nézet Beállításai</h4>
                                <p className="opacity-80">
                                    Itt szabályozhatod, hogy a bejelentkezés nélküli látogatók mely funkciókat érhetik el.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded border border-white/5 bg-black/5">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 opacity-70" />
                                        <span className="text-sm font-medium">Térkép (Atlasz) megjelenítése</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="accent-emerald-500 w-5 h-5"
                                        checked={localSettings.publicConfig?.showAtlas ?? true}
                                        onChange={(e) => setLocalSettings(prev => ({
                                            ...prev,
                                            publicConfig: { ...prev.publicConfig, showAtlas: e.target.checked }
                                        }))}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded border border-white/5 bg-black/5">
                                    <div className="flex items-center gap-2">
                                        <Images className="w-4 h-4 opacity-70" />
                                        <span className="text-sm font-medium">Galéria megjelenítése</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="accent-emerald-500 w-5 h-5"
                                        checked={localSettings.publicConfig?.showGallery ?? true}
                                        onChange={(e) => setLocalSettings(prev => ({
                                            ...prev,
                                            publicConfig: { ...prev.publicConfig, showGallery: e.target.checked }
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                                <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-500"><User className="w-4 h-4" /> Felhasználói Fiók</h4>
                                <p className="opacity-80">
                                    Itt testreszabhatod a megjelenített nevet és módosíthatod az admin jelszót.
                                </p>
                            </div>

                            <div>
                                <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>Megjelenített Név</label>
                                <Input 
                                    themeClasses={themeClasses} 
                                    value={localSettings.userName || ''} 
                                    onChange={(e: any) => setLocalSettings(prev => ({ ...prev, userName: e.target.value }))} 
                                    placeholder="pl. Grind Napló" 
                                />
                            </div>

                            <div>
                                <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>Új Admin Jelszó</label>
                                <Input 
                                    themeClasses={themeClasses} 
                                    type="password"
                                    value={localSettings.adminPassword || ''} 
                                    onChange={(e: any) => setLocalSettings(prev => ({ ...prev, adminPassword: e.target.value }))} 
                                    placeholder="Hagyd üresen, ha nem változtatod" 
                                />
                                <p className="text-[10px] opacity-50 mt-1">Ha üresen hagyod, az alapértelmezett (vagy előző) jelszó marad érvényben.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cloud' && (
                        <div className="space-y-6">
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
                    )}
                </div>

                <div className={`p-4 border-t flex justify-end gap-2 ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-200'}`}>
                    <Button variant="ghost" onClick={onClose}>Mégse</Button>
                    <Button onClick={handleSave} themeClasses={themeClasses}>Beállítások Mentése</Button>
                </div>
            </Card>
          </div>
    );
};

export default SettingsModal;