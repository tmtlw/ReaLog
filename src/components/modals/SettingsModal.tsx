
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Globe, Image as ImageIcon, User, Info, Heart, Trash2, PieChart, Trophy, Upload, BookOpen, Database, RefreshCw, AlertTriangle, ExternalLink, History } from 'lucide-react';
import { AppData, ThemeOption } from '../../types';
import { Button, Card, Input } from '../ui';
import { INITIAL_DATA } from '../../constants';
import { CHANGELOG, APP_VERSION } from '../../changelog';
import { AVAILABLE_LANGUAGES, Language } from '../../services/i18n';
import * as StorageService from '../../services/storage';
import SettingsViewsTab from '../settings/SettingsViewsTab';

type Tab = 'views' | 'public' | 'account' | 'about' | 'data';

const SettingsModal: React.FC<{ 
    onClose: () => void, 
    data: AppData,
    setData: React.Dispatch<React.SetStateAction<AppData>>, 
    themeClasses: any, 
    currentTheme: ThemeOption, 
    setCurrentTheme: (t: ThemeOption) => void,
    t: (key: string) => string,
    initialTab?: Tab
}> = ({ onClose, data, setData, themeClasses, currentTheme, setCurrentTheme, t, initialTab = 'account' }) => {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [localSettings, setLocalSettings] = useState(data.settings || {});
    
    // Backup State
    const [backups, setBackups] = useState<any[]>([]);
    const [isLoadingBackups, setIsLoadingBackups] = useState(false);
    
    // Update State
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
    const [updateInfo, setUpdateInfo] = useState<{version: string, changes: string[], url: string} | null>(null);
    
    // Refs for image uploads
    const profileRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);

    // Fetch backups when Data tab is active
    useEffect(() => {
        if (activeTab === 'data') {
            refreshBackups();
        }
    }, [activeTab]);

    // Check for updates when About tab is active
    useEffect(() => {
        if (activeTab === 'about' && !updateInfo && !isCheckingUpdate) {
            checkForUpdates();
        }
    }, [activeTab]);

    const refreshBackups = async () => {
        setIsLoadingBackups(true);
        try {
            const list = await StorageService.getBackups();
            setBackups(list);
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoadingBackups(false);
        }
    };

    const checkForUpdates = async () => {
        setIsCheckingUpdate(true);
        try {
            const info = await StorageService.checkGithubVersion(APP_VERSION);
            if (info) {
                setUpdateInfo(info);
            }
        } catch(e) {
            console.warn("Update check error", e);
        } finally {
            setIsCheckingUpdate(false);
        }
    };

    // Calculate DB Size
    const dbSize = React.useMemo(() => {
        try {
            const json = JSON.stringify(data);
            const bytes = new Blob([json]).size;
            return (bytes / (1024 * 1024)).toFixed(2);
        } catch (e) {
            return "0.00";
        }
    }, [data]);

    const handleSave = () => {
        setData(prev => ({ ...prev, settings: localSettings }));
        onClose();
    };

    const handleDeleteSampleData = () => {
        if (confirm(t('common.yes') + "?")) {
            const sampleIds = INITIAL_DATA.entries.map(e => e.id);
            setData(prev => ({
                ...prev,
                entries: prev.entries.filter(e => !sampleIds.includes(e.id))
            }));
            alert(t('common.success'));
        }
    };

    const handleResetDiary = async () => {
        if (confirm(t('settings.reset_confirm'))) {
            try {
                await StorageService.resetDiary();
                setData(prev => ({ ...prev, entries: [] })); // Clear locally immediately
                alert(t('common.success'));
            } catch(e) {
                alert(t('common.error'));
            }
        }
    };

    const handleCreateBackup = async () => {
        try {
            await StorageService.createBackup();
            await refreshBackups();
            alert(t('common.success'));
        } catch(e) {
            alert(t('common.error'));
        }
    };

    const handleRestoreBackup = async (filename: string) => {
        if (confirm(t('settings.restore_confirm'))) {
            try {
                await StorageService.restoreBackup(filename);
                // Reload data from server
                const newData = await StorageService.serverLoad();
                if (newData) {
                    setData(newData);
                    setLocalSettings(newData.settings || {});
                    alert(t('common.success'));
                }
            } catch(e) {
                alert(t('common.error'));
            }
        }
    };

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

    // Helper for About tab sticky background
    const cardBg = themeClasses.card.split(' ').find((c:string) => c.startsWith('bg-')) || 'bg-zinc-900';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 pb-12">
            <Card themeClasses={themeClasses} className="w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] mb-10 border-2">
                <div className={`flex border-b overflow-x-auto shrink-0 ${themeClasses.card.includes('zinc') ? 'border-zinc-800' : 'border-slate-200'}`}>
                    <button onClick={() => setActiveTab('account')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'account' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>{t('settings.tabs.account')}</button>
                    <button onClick={() => setActiveTab('views')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'views' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>{t('settings.tabs.views')}</button>
                    <button onClick={() => setActiveTab('public')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'public' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>{t('settings.tabs.public')}</button>
                    <button onClick={() => setActiveTab('data')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'data' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>{t('settings.tabs.data')}</button>
                    <button onClick={() => setActiveTab('about')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'about' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>{t('settings.tabs.about')}</button>
                </div>

                <div className={`flex-1 min-h-0 ${activeTab === 'about' ? 'flex flex-col overflow-hidden' : 'p-6 overflow-y-auto'}`}>
                    
                    {activeTab === 'views' && (
                        <SettingsViewsTab 
                            localSettings={localSettings} 
                            setLocalSettings={setLocalSettings} 
                            themeClasses={themeClasses} 
                            t={t} 
                        />
                    )}

                    {activeTab === 'public' && (
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
                    )}
                    
                    {activeTab === 'account' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                                <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-500"><User className="w-4 h-4" /> {t('settings.tabs.account')}</h4>
                                <p className="opacity-80">Itt testreszabhatod a megjelenített nevet és módosíthatod az admin jelszót.</p>
                            </div>
                            <div>
                                <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>{t('settings.display_name')}</label>
                                <Input themeClasses={themeClasses} value={localSettings.userName || ''} onChange={(e: any) => setLocalSettings(prev => ({ ...prev, userName: e.target.value }))} placeholder={t('settings.account_hint_name')} />
                            </div>
                            <div>
                                <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>{t('settings.weather_api')}</label>
                                <Input themeClasses={themeClasses} value={localSettings.openWeatherMapKey || ''} onChange={(e: any) => setLocalSettings(prev => ({ ...prev, openWeatherMapKey: e.target.value }))} placeholder="api_key_..." />
                            </div>
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
                            <div>
                                <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>{t('settings.language')}</label>
                                <select value={localSettings.language || 'hu'} onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value as Language }))} className={`w-full rounded-lg px-4 py-2 border focus:ring-2 focus:outline-none transition-all ${themeClasses.input} ${themeClasses.bg}`}>
                                    {AVAILABLE_LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.label}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className={`text-xs uppercase font-bold block mb-1 ${themeClasses.subtext}`}>{t('settings.admin_password')}</label>
                                <Input themeClasses={themeClasses} type="password" value={localSettings.adminPassword || ''} onChange={(e: any) => setLocalSettings(prev => ({ ...prev, adminPassword: e.target.value }))} placeholder={t('settings.admin_password_hint')} />
                                <p className="text-[10px] opacity-50 mt-1">{t('settings.account_hint_pass')}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm">
                                <h4 className="font-bold flex items-center gap-2 mb-2 text-red-500"><AlertTriangle className="w-4 h-4" /> {t('settings.data_management')}</h4>
                                <p className="opacity-80">Az itt végrehajtott műveletek visszafordíthatatlanok lehetnek. Kérjük, légy óvatos!</p>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-black/5 border border-white/5">
                                <span className="text-sm flex items-center gap-2"><Database className="w-4 h-4 opacity-70" /> {t('settings.db_size')}</span>
                                <span className="text-sm font-mono font-bold">{dbSize} MB</span>
                            </div>
                            <div className="space-y-4">
                                <h5 className={`font-bold text-xs uppercase mb-2 ${themeClasses.subtext}`}>{t('settings.backup_title')}</h5>
                                <div className="flex gap-2">
                                    <Button themeClasses={themeClasses} onClick={handleCreateBackup} className="w-full"><Upload className="w-4 h-4" /> {t('settings.create_backup')}</Button>
                                </div>
                                <p className="text-[10px] opacity-50">{t('settings.backup_hint')}</p>
                                <div className="border rounded-lg max-h-48 overflow-y-auto bg-black/5">
                                    {isLoadingBackups ? (
                                        <div className="p-4 text-center opacity-50 text-xs"><RefreshCw className="w-4 h-4 animate-spin inline mr-2" />{t('common.loading')}</div>
                                    ) : backups.length === 0 ? (
                                        <div className="p-4 text-center opacity-50 text-xs">{t('settings.no_backups')}</div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {backups.map((b, i) => (
                                                <div key={i} className="p-3 flex items-center justify-between text-xs">
                                                    <div>
                                                        <div className="font-bold">{new Date(b.date).toLocaleString()}</div>
                                                        <div className="opacity-50">{b.name} ({(b.size/1024).toFixed(1)} KB)</div>
                                                    </div>
                                                    <Button size="sm" variant="secondary" onClick={() => handleRestoreBackup(b.name)} themeClasses={themeClasses}><History className="w-3 h-3" /> {t('settings.restore')}</Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <hr className="border-white/10" />
                            <div className="space-y-4">
                                <Button variant="danger" themeClasses={themeClasses} onClick={handleDeleteSampleData} className="w-full justify-start"><Trash2 className="w-4 h-4" /> {t('settings.delete_sample_data')}</Button>
                                <p className="text-[10px] opacity-50 mt-1">{t('settings.delete_sample_hint')}</p>
                                <Button variant="danger" themeClasses={themeClasses} onClick={handleResetDiary} className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"><AlertTriangle className="w-4 h-4" /> {t('settings.reset_diary')}</Button>
                                <p className="text-[10px] opacity-50 mt-1 text-red-400">{t('settings.reset_hint')}</p>
                            </div>
                        </div>
                    )}

                    {/* About Tab with Forced Style */}
                    {activeTab === 'about' && (
                        <div className="flex flex-col flex-1 min-h-0 relative isolate animate-fade-in">
                            <style>{`
                                .lobster-font-important {
                                    font-family: 'Lobster', cursive !important;
                                }
                            `}</style>
                            <div className={`p-6 pb-2 shrink-0 border-b border-white/5 z-20 text-center ${cardBg} transition-colors`}>
                                <div className="mb-2">
                                    <h2 className="lobster-font-important text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent tracking-tighter drop-shadow-sm">ReaLog</h2>
                                    <p className={`text-xs opacity-60 font-mono mt-1`}>v{APP_VERSION}</p>
                                </div>
                                {isCheckingUpdate && (
                                    <div className="text-[10px] opacity-50 animate-pulse mt-2">{t('settings.checking_update')}...</div>
                                )}
                                {updateInfo && (
                                    <div className="mt-3 flex flex-col items-center gap-2">
                                        <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                                            {t('settings.new_version')}: v{updateInfo.version}
                                        </div>
                                        <Button 
                                            size="sm" 
                                            themeClasses={themeClasses} 
                                            onClick={() => window.open(updateInfo.url, '_blank')}
                                            className="animate-bounce"
                                        >
                                            <ExternalLink className="w-3 h-3" /> {t('settings.update_btn')}
                                        </Button>
                                        
                                        {updateInfo.changes.length > 0 && (
                                            <div className="w-full mt-2 text-left bg-black/10 p-2 rounded text-[10px] border border-white/5">
                                                <strong className="block mb-1 opacity-70 uppercase tracking-wider">{t('settings.whats_new')}:</strong>
                                                <ul className="list-disc pl-3 space-y-0.5 opacity-80">
                                                    {updateInfo.changes.map((c, i) => (
                                                        <li key={i}>{c}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 bg-black/5 min-h-0">
                                <div className="p-0 space-y-6">
                                    <div className="flex items-center gap-2 font-bold text-xs uppercase opacity-70 mb-4 sticky top-0 bg-transparent">
                                        <Info className="w-4 h-4" /> Változásnapló
                                    </div>
                                    {CHANGELOG.map((log, idx) => (
                                        <div key={idx} className="relative pl-4 border-l-2 border-current border-opacity-10 text-left">
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

                            <div className={`p-4 pt-2 shrink-0 text-center border-t border-white/5 z-20 text-sm font-medium text-pink-500 flex items-center justify-center gap-2 ${cardBg} transition-colors`}>
                                <span className="animate-pulse flex items-center gap-2">Szeretettel Rea-nak <Heart className="w-4 h-4 fill-current" /></span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`p-4 border-t flex justify-end gap-2 bg-black/5 shrink-0 ${themeClasses.card.includes('zinc') ? 'border-zinc-800' : 'border-slate-200'}`}>
                    <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button onClick={handleSave} themeClasses={themeClasses}>{t('settings.save_settings')}</Button>
                </div>
            </Card>
          </div>
    );
};

export default SettingsModal;
