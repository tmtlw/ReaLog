import React, { useState } from 'react';
import { Layers, Shield, Globe, Images, User, Info, Heart } from 'lucide-react';
import { AppData, Category, ThemeOption } from '../../types';
import { Button, Card, Input } from '../ui';
import { DEFAULT_MOODS } from '../../constants';
import { CHANGELOG, APP_VERSION } from '../../changelog';

const SettingsModal: React.FC<{ 
    onClose: () => void, 
    data: AppData,
    setData: React.Dispatch<React.SetStateAction<AppData>>, 
    themeClasses: any, 
    currentTheme: ThemeOption, 
    setCurrentTheme: (t: ThemeOption) => void
}> = ({ onClose, data, setData, themeClasses, currentTheme, setCurrentTheme }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'views' | 'public' | 'account' | 'about'>('general');
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
                    <button onClick={() => setActiveTab('about')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'about' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>Rólam</button>
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

                    {activeTab === 'about' && (
                        <div className="space-y-6 text-center h-full flex flex-col">
                            <div className="mb-6 mt-4">
                                <h2 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent tracking-tighter drop-shadow-sm">ReaLog</h2>
                                <p className={`text-xs opacity-60 font-mono mt-2`}>v{APP_VERSION}</p>
                            </div>
                            
                            <div className={`text-left flex-1 overflow-y-auto rounded-xl border p-0 ${themeClasses.card} bg-black/5 relative`}>
                                <div className="sticky top-0 bg-inherit border-b p-3 flex items-center gap-2 font-bold text-xs uppercase opacity-70 z-10">
                                    <Info className="w-4 h-4" /> Változásnapló
                                </div>
                                <div className="p-4 space-y-6">
                                    {CHANGELOG.map((log, idx) => (
                                        <div key={idx} className="relative pl-4 border-l-2 border-current border-opacity-10">
                                            <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-current opacity-30'}`}></div>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="font-bold text-sm">v{log.version}</span>
                                                <span className="text-[10px] opacity-50 font-mono">{log.date}</span>
                                            </div>
                                            <ul className="text-xs space-y-1 opacity-80 list-disc pl-3">
                                                {log.changes.map((change, cIdx) => (
                                                    <li key={cIdx}>{change}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 pb-2 text-sm font-medium text-pink-500 animate-pulse flex items-center justify-center gap-2">
                                Szeretettel Rea-nak <Heart className="w-4 h-4 fill-current" />
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