import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Lock, Plus, Trash2, X, ChevronRight, Layout, RefreshCw,
  Calendar, List, Grid as GridIcon,
  Server, MapPin, Eye, Search, ChevronLeft, Map as MapIcon,
  ThermometerSun, PenTool, Images, Globe
} from 'lucide-react';

import { AppData, Category, Entry, ThemeOption, CategoryConfig } from './types';
import { CATEGORY_LABELS, DEMO_PASSWORD, INITIAL_DATA, DEFAULT_QUESTIONS, CATEGORY_COLORS, DEFAULT_MOODS } from './constants';
import { THEMES } from './constants/theme';
import * as StorageService from './services/storage';

// Sub-components
import { Button, Card, Input } from './components/ui';
import StatusBar from './components/layout/StatusBar';
import Navbar from './components/layout/Navbar';
import EntryEditor from './components/forms/EntryEditor';
import EntryList from './components/views/EntryList';
import AtlasView from './components/views/AtlasView';
import GalleryView from './components/views/GalleryView';
import CalendarView from './components/views/CalendarView';
import QuestionManager from './components/views/QuestionManager';

// Modals
import ExportModal from './components/modals/ExportModal';
import SettingsModal from './components/modals/SettingsModal';
import DeployModal from './components/modals/DeployModal';
import StorageDebugMenu from './components/modals/StorageDebugMenu';

export default function App() {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [activeCategory, setActiveCategory] = useState<Category>(Category.DAILY);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>('dark');
  const [themeClasses, setThemeClasses] = useState(THEMES.dark);

  const [serverMode, setServerMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [showStorageMenu, setShowStorageMenu] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null); 
  const [passwordInput, setPasswordInput] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'calendar' | 'atlas' | 'gallery'>('grid');
  const [globalView, setGlobalView] = useState<'none' | 'atlas' | 'gallery'>('none');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<Entry>>({});
  const [activeTab, setActiveTab] = useState<'entries' | 'questions'>('entries');
  const [locationParts, setLocationParts] = useState<string[]>([]);

  // Dynamic App Name Logic
  const appName = data.settings?.userName || 'Grind Napló';

  useEffect(() => {
    const init = async () => {
        setIsAppLoading(true);
        const local = StorageService.loadData();
        if (local.settings?.theme) setCurrentTheme(local.settings.theme);
        
        // Restore session
        if (StorageService.checkAuthSession()) {
            setIsAdmin(true);
        }

        const status = await StorageService.checkServerStatus();
        if (status.online) {
            setServerMode(true);
            setSyncStatus('syncing');
            const serverData = await StorageService.serverLoad();
            if (serverData) {
                if (!serverData.questions || serverData.questions.length === 0) serverData.questions = DEFAULT_QUESTIONS;
                setData({ ...serverData, settings: { ...local.settings, ...serverData.settings } });
                setSyncStatus('success');
                setLastSyncTime(Date.now());
                setSystemMessage("");
                setIsAppLoading(false);
                return;
            } else {
                setSystemMessage("Adatlekérési hiba a szerverről!");
            }
        } else {
             console.log("Server Offline:", status.message, status.details);
        }
        
        setData(local);
        setIsAppLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
      let target = currentTheme;
      if (currentTheme === 'system') target = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setThemeClasses(THEMES[target as keyof typeof THEMES] || THEMES.dark);
      document.body.className = (THEMES[target as keyof typeof THEMES] || THEMES.dark).bg;
  }, [currentTheme]);

  useEffect(() => {
      if (activeCategory) {
          const config = data.settings?.categoryConfigs?.[activeCategory];
          if (config && config.viewMode) setViewMode(config.viewMode);
          else setViewMode('grid');
      }
  }, [activeCategory, data.settings?.categoryConfigs]);

  useEffect(() => {
    StorageService.saveData(data); // Local save always happens
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if(isAppLoading) return;

    // Only save to Server if Admin is logged in
    if (serverMode && isAdmin) {
        setSyncStatus('syncing');
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await StorageService.serverSave(data);
                setSyncStatus('success');
                setLastSyncTime(Date.now());
                setSystemMessage("");
                setTimeout(() => setSyncStatus('idle'), 2000);
            } catch (e) {
                setSyncStatus('error');
                setSystemMessage("Szerver mentési hiba!");
            }
        }, 1000);
    } 
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [data, serverMode, isAdmin]);

  const getFilteredEntries = () => {
      let entries = data.entries;

      if (!isAdmin) {
          entries = entries.filter(e => !e.isPrivate);
      }

      if (globalView === 'atlas' || globalView === 'gallery') {
          return entries;
      }

      const config = data.settings?.categoryConfigs?.[activeCategory] || ({} as Partial<CategoryConfig>);
      const allowedCategories = [activeCategory];
      if (config.includeDaily) allowedCategories.push(Category.DAILY);
      if (config.includeWeekly) allowedCategories.push(Category.WEEKLY);
      if (config.includeMonthly) allowedCategories.push(Category.MONTHLY);

      entries = entries.filter(e => allowedCategories.includes(e.category));
      
      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          entries = entries.filter(e => 
              (e.title?.toLowerCase().includes(q)) ||
              (e.location?.toLowerCase().includes(q)) ||
              (Object.values(e.responses).some((r: string) => r.toLowerCase().includes(q))) ||
              (e.freeTextContent?.toLowerCase().includes(q))
          );
      }
      
      return entries.sort((a, b) => b.timestamp - a.timestamp);
  };

  const handleModalNav = (direction: 'next' | 'prev') => {
      if (!selectedEntry) return;
      const filtered = getFilteredEntries();
      const currentIndex = filtered.findIndex(e => e.id === selectedEntry.id);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'next' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex >= 0 && targetIndex < filtered.length) {
          setSelectedEntry(filtered[targetIndex]);
      }
  };

  const handleStorageModeSwitch = async (mode: 'server' | 'local') => {
      if (mode === 'server') {
          try {
              const status = await StorageService.checkServerStatus();
              if (!status.online) throw new Error(`${status.message} - ${status.details}`);
              setServerMode(true);
              setSystemMessage("");
              const serverData = await StorageService.serverLoad();
              if (serverData) {
                  if (!serverData.questions || serverData.questions.length === 0) serverData.questions = DEFAULT_QUESTIONS;
                  setData(prev => ({...serverData, settings: {...prev.settings, ...serverData.settings}}));
              }
          } catch (e: any) {
              setServerMode(false);
              const msg = e.message || "Ismeretlen szerver hiba";
              setSystemMessage(msg);
              throw new Error(msg);
          }
      } 
      else {
          setServerMode(false);
          setSystemMessage("Offline Mód Aktív");
      }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAppLoading) return;
    const currentPassword = data.settings?.adminPassword || DEMO_PASSWORD;
    if (passwordInput === currentPassword) {
      setIsAdmin(true);
      StorageService.saveAuthSession();
      setShowAuthModal(false);
      setPasswordInput("");
    } else {
      alert("Hibás jelszó!");
    }
  };

  const handleLogout = () => {
    StorageService.clearAuthSession();
    setIsAdmin(false);
    setIsEditing(false);
    setActiveTab('entries');
    setShowMobileMenu(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        let importedEntries: Entry[] = [];
        let importedData: AppData | null = null;
        
        if (file.name.endsWith('.xml') || file.name.endsWith('.wxr')) {
            importedEntries = await StorageService.importFromWxr(file);
        } else {
            importedData = await StorageService.importFromJson(file);
        }

        if (confirm("Biztosan importálod az adatokat? " + (importedData ? "Ez felülírja a jelenlegi adatbázist." : "Az új bejegyzések hozzáadódnak a listához."))) {
           if (importedData) {
              setData(importedData);
              if (importedData.settings?.theme) setCurrentTheme(importedData.settings.theme);
           } else if (importedEntries.length > 0) {
              setData(prev => ({ ...prev, entries: [...importedEntries, ...prev.entries] }));
           }
        }
      } catch (err) {
        alert("Hiba az importálás során.");
      }
    }
  };

  const startNewEntry = () => {
    const today = new Date();
    let label = today.toISOString().slice(0, 10);
    if (activeCategory === Category.WEEKLY) label = `${today.getFullYear()} W${Math.ceil((today.getDate() + 6 - today.getDay()) / 7)}`;
    if (activeCategory === Category.MONTHLY) label = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    if (activeCategory === Category.YEARLY) label = `${today.getFullYear()}`;

    const activeQuestions = data.questions.filter(q => q.category === activeCategory && q.isActive);
    const initialResponses: Record<string, string> = {};
    activeQuestions.forEach(q => initialResponses[q.id] = "");

    setCurrentEntry({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      category: activeCategory,
      dateLabel: label,
      title: '',
      responses: initialResponses,
      entryMode: 'structured',
      freeTextContent: '',
      isPrivate: false,
      isLocationPrivate: false
    });
    setLocationParts([]);
    setIsEditing(true);
    setShowMobileMenu(false);
  };

  const saveEntry = () => {
    if (!currentEntry.id || !currentEntry.dateLabel) return;
    const newEntry = currentEntry as Entry;
    if (!newEntry.title?.trim()) newEntry.title = newEntry.dateLabel;
    
    if (locationParts.length > 0) {
        newEntry.location = locationParts.join(', ');
    } else if (newEntry.location && locationParts.length === 0 && isEditing) {
        newEntry.location = undefined;
    }

    setData(prev => ({
      ...prev,
      entries: [newEntry, ...prev.entries.filter(e => e.id !== newEntry.id)]
    }));
    setIsEditing(false);
    setCurrentEntry({});
    setLocationParts([]);
  };

  const deleteEntry = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Biztosan törlöd ezt a bejegyzést?")) {
      setData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
      if (selectedEntry?.id === id) setSelectedEntry(null);
    }
  };

  const toggleQuestionStatus = (id: string) => {
    setData(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, isActive: !q.isActive } : q)
    }));
  };

  const addQuestion = (text: string) => {
    setData(prev => ({
        ...prev,
        questions: [...prev.questions, { id: crypto.randomUUID(), text, category: activeCategory, isActive: true }]
    }));
  };

  const deleteQuestion = (id: string) => {
      setData(prev => ({ ...prev, questions: prev.questions.filter(x => x.id !== id) }));
  };

  const handleViewModeChange = (mode: 'grid' | 'timeline' | 'calendar' | 'atlas' | 'gallery') => {
      setViewMode(mode);
      if (activeCategory) {
          setData(prev => ({
              ...prev,
              settings: {
                  ...prev.settings,
                  categoryConfigs: {
                      ...prev.settings?.categoryConfigs,
                      [activeCategory]: {
                          ...(prev.settings?.categoryConfigs?.[activeCategory] || {}),
                          viewMode: mode
                      }
                  }
              }
          }));
      }
  };

  const renderActionButtons = (e: Entry): React.ReactNode => (
      <>
          <button onClick={(ev) => { ev.stopPropagation(); setSelectedEntry(e); }} className="p-1 hover:text-blue-500"><Eye className="w-4 h-4" /></button>
          {isAdmin && (
              <>
                  <button onClick={(ev) => { ev.stopPropagation(); setCurrentEntry(e); setLocationParts(e.location ? e.location.split(', ') : []); setIsEditing(true); }} className="p-1 hover:text-yellow-500"><PenTool className="w-4 h-4" /></button>
                  <button onClick={(ev) => deleteEntry(e.id, ev)} className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </>
          )}
      </>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text} font-sans selection:bg-emerald-500/30 flex flex-col`}>
        {showAuthModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <Card themeClasses={themeClasses} className="w-full max-w-sm p-8 shadow-2xl relative">
                    <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 opacity-50 hover:opacity-100"><X className="w-5 h-5" /></button>
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Admin Belépés</h2>
                        <p className={`text-sm mt-2 ${themeClasses.subtext}`}>Add meg a jelszót a szerkesztéshez.</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input 
                            themeClasses={themeClasses} 
                            type="password" 
                            value={passwordInput} 
                            onChange={(e: any) => setPasswordInput(e.target.value)} 
                            placeholder="Jelszó" 
                            autoFocus
                        />
                        <Button type="submit" themeClasses={themeClasses} className="w-full">Belépés</Button>
                    </form>
                </Card>
            </div>
        )}

        {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} data={data} onImport={handleImport} themeClasses={themeClasses} currentTheme={currentTheme} />}
        {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} data={data} setData={setData} themeClasses={themeClasses} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />}
        {showDeployModal && <DeployModal onClose={() => setShowDeployModal(false)} themeClasses={themeClasses} />}
        {showStorageMenu && <StorageDebugMenu onClose={() => setShowStorageMenu(false)} onSwitchMode={handleStorageModeSwitch} serverMode={serverMode} lastError={systemMessage} themeClasses={themeClasses} />}

        {selectedEntry && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedEntry(null)}>
                <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl relative bg-zinc-900 border border-zinc-800 shadow-2xl" onClick={e => e.stopPropagation()}>
                   <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-white/10 bg-zinc-900/90 backdrop-blur">
                        <div className="flex gap-2">
                             <Button size="sm" variant="secondary" onClick={() => handleModalNav('prev')}><ChevronLeft className="w-4 h-4" /></Button>
                             <Button size="sm" variant="secondary" onClick={() => handleModalNav('next')}><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                        <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                   </div>
                   <div className="p-6 md:p-8 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${CATEGORY_COLORS[selectedEntry.category]} text-white`}>{CATEGORY_LABELS[selectedEntry.category]}</span>
                                <h2 className="text-2xl md:text-3xl font-bold leading-tight">{selectedEntry.title || selectedEntry.dateLabel}</h2>
                                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm opacity-60">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(selectedEntry.timestamp).toLocaleDateString()}</span>
                                    
                                    {(selectedEntry.location && (!selectedEntry.isLocationPrivate || isAdmin)) && (
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedEntry.location}</span>
                                    )}
                                    
                                    {selectedEntry.weather && (
                                        <span className="flex items-center gap-1">
                                            <ThermometerSun className="w-3 h-3" /> 
                                            {selectedEntry.weather.icon && <img src={`https://openweathermap.org/img/wn/${selectedEntry.weather.icon}.png`} className="w-4 h-4" alt="icon" />}
                                            {selectedEntry.weather.temp}°C, {selectedEntry.weather.condition}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {selectedEntry.mood && <div className="text-4xl">{selectedEntry.mood}</div>}
                        </div>

                        {selectedEntry.photo && (
                            <div className="rounded-xl overflow-hidden border border-white/10">
                                <img src={selectedEntry.photo} className="w-full h-auto" alt="Entry" />
                            </div>
                        )}

                        <div className="space-y-6 text-lg leading-relaxed opacity-90">
                            {selectedEntry.entryMode === 'free' ? (
                                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedEntry.freeTextContent?.replace(/\n/g, '<br/>') || '' }} />
                            ) : (
                                Object.entries(selectedEntry.responses).map(([qId, ans]) => {
                                    const q = data.questions.find(qx => qx.id === qId);
                                    if (!q || !ans) return null;
                                    return (
                                        <div key={qId} className="border-l-2 border-emerald-500/50 pl-4 py-1">
                                            <h4 className="font-bold text-sm text-emerald-500 mb-1">{q.text}</h4>
                                            <p className="whitespace-pre-wrap">{ans as React.ReactNode}</p>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                   </div>
                   <div className="p-4 border-t border-white/10 bg-zinc-900/50 flex justify-end gap-2">
                       {isAdmin && (
                           <>
                               <Button variant="danger" size="sm" onClick={(e) => { deleteEntry(selectedEntry.id); }}>Törlés</Button>
                               <Button variant="primary" size="sm" onClick={() => { 
                                   setCurrentEntry(selectedEntry); 
                                   setLocationParts(selectedEntry.location ? selectedEntry.location.split(', ') : []);
                                   setIsEditing(true); 
                                   setSelectedEntry(null); 
                                }}>Szerkesztés</Button>
                           </>
                       )}
                   </div>
                </div>
            </div>
        )}

        <Navbar 
            appName={appName}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            globalView={globalView}
            setGlobalView={setGlobalView}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
            onOpenDeploy={() => setShowDeployModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenExport={() => setShowExportModal(true)}
            onLogout={handleLogout}
            onOpenAuth={() => setShowAuthModal(true)}
            themeClasses={themeClasses}
            showMobileMenu={showMobileMenu}
            setShowMobileMenu={setShowMobileMenu}
        />

        <main className="flex-1 max-w-6xl mx-auto w-full p-4 pb-24">
            {isAppLoading ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                    <p>Betöltés...</p>
                </div>
            ) : isEditing ? (
                <EntryEditor 
                    currentEntry={currentEntry}
                    onChange={setCurrentEntry}
                    onSave={saveEntry}
                    onCancel={() => setIsEditing(false)}
                    activeCategory={activeCategory}
                    questions={data.questions}
                    settings={data.settings}
                    themeClasses={themeClasses}
                    currentTheme={currentTheme}
                    locationParts={locationParts}
                    setLocationParts={setLocationParts}
                    serverMode={serverMode}
                />
            ) : globalView === 'atlas' ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Globe className="w-5 h-5" /> Világtérkép</h2>
                    <AtlasView entries={data.entries} activeCategory={activeCategory} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} showAll={true} isAdmin={isAdmin} />
                </div>
            ) : globalView === 'gallery' ? (
                <div className="space-y-4">
                     <h2 className="text-xl font-bold flex items-center gap-2"><Images className="w-5 h-5" /> Fotógaléria</h2>
                     <GalleryView entries={data.entries} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} renderActionButtons={renderActionButtons} />
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                             {activeTab === 'entries' && (
                                <div className="flex bg-black/5 p-1 rounded-lg border border-black/5 mr-2">
                                    <button onClick={() => handleViewModeChange('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow text-black' : 'opacity-50'}`} title="Grid"><Layout className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('timeline')} className={`p-1.5 rounded ${viewMode === 'timeline' ? 'bg-white shadow text-black' : 'opacity-50'}`} title="Timeline"><List className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('calendar')} className={`p-1.5 rounded ${viewMode === 'calendar' ? 'bg-white shadow text-black' : 'opacity-50'}`} title="Naptár"><Calendar className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('atlas')} className={`p-1.5 rounded ${viewMode === 'atlas' ? 'bg-white shadow text-black' : 'opacity-50'}`} title="Térkép"><MapIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('gallery')} className={`p-1.5 rounded ${viewMode === 'gallery' ? 'bg-white shadow text-black' : 'opacity-50'}`} title="Galéria"><Images className="w-4 h-4" /></button>
                                </div>
                             )}
                             {isAdmin && (
                                <div className="flex bg-black/5 p-1 rounded-lg border border-black/5">
                                    <button onClick={() => setActiveTab('entries')} className={`px-3 py-1 rounded text-xs font-bold ${activeTab === 'entries' ? 'bg-white shadow text-black' : 'opacity-50'}`}>Bejegyzések</button>
                                    <button onClick={() => setActiveTab('questions')} className={`px-3 py-1 rounded text-xs font-bold ${activeTab === 'questions' ? 'bg-white shadow text-black' : 'opacity-50'}`}>Kérdések</button>
                                </div>
                             )}
                         </div>

                         <div className="relative w-full md:w-64">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                             <input 
                                className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-transparent border focus:ring-2 focus:outline-none ${themeClasses.input}`}
                                placeholder="Keresés..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                             />
                         </div>
                    </div>

                    {activeTab === 'questions' ? (
                        <QuestionManager 
                            questions={data.questions} 
                            activeCategory={activeCategory} 
                            onAdd={addQuestion} 
                            onToggle={toggleQuestionStatus} 
                            onDelete={deleteQuestion} 
                            themeClasses={themeClasses} 
                        />
                    ) : (
                        <div className="animate-fade-in">
                            {(viewMode === 'grid' || viewMode === 'timeline') && (
                                <EntryList 
                                    viewMode={viewMode}
                                    entries={getFilteredEntries()}
                                    onSelectEntry={setSelectedEntry}
                                    renderActionButtons={renderActionButtons}
                                    themeClasses={themeClasses}
                                    isAdmin={isAdmin}
                                />
                            )}

                            {viewMode === 'atlas' && (
                                <AtlasView entries={getFilteredEntries()} activeCategory={activeCategory} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} isAdmin={isAdmin} />
                            )}
                            
                            {viewMode === 'gallery' && (
                                <GalleryView entries={getFilteredEntries()} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} renderActionButtons={renderActionButtons} />
                            )}
                            
                            {viewMode === 'calendar' && (
                                <CalendarView 
                                    entries={getFilteredEntries()} 
                                    currentDate={calendarDate} 
                                    onDateChange={setCalendarDate} 
                                    onSelectEntry={setSelectedEntry} 
                                    themeClasses={themeClasses}
                                />
                            )}
                        </div>
                    )}
                </>
            )}
        </main>

        {isAdmin && !isEditing && (
            <button 
                onClick={startNewEntry}
                className="fixed bottom-8 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-50"
            >
                <Plus className="w-6 h-6" />
            </button>
        )}

        {isAdmin && (
            <StatusBar 
                serverMode={serverMode} 
                syncStatus={syncStatus} 
                lastSyncTime={lastSyncTime} 
                systemMessage={systemMessage} 
                themeClasses={themeClasses}
                onOpenDebug={() => setShowStorageMenu(true)}
            />
        )}
    </div>
  );
}