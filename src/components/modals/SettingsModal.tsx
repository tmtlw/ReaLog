
import React, { useState, useEffect } from 'react';
import { AppData, ThemeOption } from '../../types';
import { Button, Card } from '../ui';
import { APP_VERSION } from '../../changelog';
import * as StorageService from '../../services/storage';

// Direct Data Imports for Reset/Restore Logic
import { DEFAULT_QUESTIONS } from '../../data/questions';
import { DEFAULT_HABITS } from '../../data/habits';
import { SAMPLE_ENTRIES } from '../../data/samples';

// Tabs
import SettingsViewsTab from '../settings/SettingsViewsTab';
import SettingsPublicTab from '../settings/SettingsPublicTab';
import SettingsAccountTab from '../settings/SettingsAccountTab';
import SettingsDataTab from '../settings/SettingsDataTab';
import SettingsLayoutTab from '../settings/SettingsCloudTab'; 
import SettingsAboutTab from '../settings/SettingsAboutTab';

type Tab = 'views' | 'public' | 'account' | 'layout' | 'about' | 'data';

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
    const [updateInfo, setUpdateInfo] = useState<{version: string, changes: string[], url: string, error?: string} | null>(null);

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
            } else {
                // Up to date
                setUpdateInfo({ version: APP_VERSION, changes: [], url: "" });
            }
        } catch(e: any) {
            console.warn("Update check error", e);
            setUpdateInfo({ 
                version: "Error", 
                changes: [e.message || "Hiba a verzió ellenőrzésekor"], 
                url: "",
                error: "true" 
            });
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
            // Use the directly imported SAMPLE_ENTRIES to find IDs to delete
            const sampleIds = SAMPLE_ENTRIES.map(e => e.id);
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
                // Try to reset server side (delete files) if possible, but ignore error if offline/local
                try {
                    await StorageService.resetDiary();
                } catch(e) {
                    console.warn("Server reset skipped or failed (local mode?)");
                }

                // Restore default data from source files
                const freshData: AppData = {
                    questions: DEFAULT_QUESTIONS,
                    habits: DEFAULT_HABITS,
                    entries: SAMPLE_ENTRIES,
                    settings: localSettings // Preserve current settings
                };

                setData(freshData);
                
                // Force immediate local save to persist the reset state
                StorageService.saveData(freshData);
                
                alert(t('common.success'));
            } catch(e) {
                console.error(e);
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

    // Helper for About tab sticky background
    const cardBg = themeClasses.card.split(' ').find((c:string) => c.startsWith('bg-')) || 'bg-zinc-900';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 pb-12">
            <Card themeClasses={themeClasses} className="w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] mb-10 border-2">
                <div className={`flex border-b overflow-x-auto shrink-0 ${themeClasses.card.includes('zinc') ? 'border-zinc-800' : 'border-slate-200'}`}>
                    <button onClick={() => setActiveTab('account')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'account' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>{t('settings.tabs.account')}</button>
                    <button onClick={() => setActiveTab('views')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'views' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>{t('settings.tabs.views')}</button>
                    <button onClick={() => setActiveTab('public')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'public' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>{t('settings.tabs.public')}</button>
                    <button onClick={() => setActiveTab('layout')} className={`flex-1 p-4 text-sm font-bold text-center whitespace-nowrap ${activeTab === 'layout' ? themeClasses.accent + ' border-b-2 border-current' : 'opacity-60'}`}>{t('settings.tabs.layout')}</button>
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
                        <SettingsPublicTab 
                            localSettings={localSettings} 
                            setLocalSettings={setLocalSettings} 
                            themeClasses={themeClasses} 
                            t={t} 
                        />
                    )}
                    
                    {activeTab === 'account' && (
                        <SettingsAccountTab 
                            localSettings={localSettings} 
                            setLocalSettings={setLocalSettings} 
                            themeClasses={themeClasses} 
                            t={t} 
                        />
                    )}

                    {activeTab === 'layout' && (
                        <SettingsLayoutTab 
                            localSettings={localSettings} 
                            setLocalSettings={setLocalSettings} 
                            themeClasses={themeClasses} 
                            t={t} 
                        />
                    )}

                    {activeTab === 'data' && (
                        <SettingsDataTab 
                            themeClasses={themeClasses} 
                            t={t} 
                            dbSize={dbSize} 
                            backups={backups} 
                            isLoadingBackups={isLoadingBackups} 
                            onCreateBackup={handleCreateBackup} 
                            onRestoreBackup={handleRestoreBackup} 
                            onDeleteSampleData={handleDeleteSampleData} 
                            onResetDiary={handleResetDiary} 
                        />
                    )}

                    {activeTab === 'about' && (
                        <SettingsAboutTab 
                            themeClasses={themeClasses} 
                            t={t} 
                            isCheckingUpdate={isCheckingUpdate} 
                            updateInfo={updateInfo} 
                            cardBg={cardBg}
                            isDevMode={localSettings.dev}
                            onToggleDevMode={(enabled) => setLocalSettings(prev => ({ ...prev, dev: enabled }))}
                        />
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
