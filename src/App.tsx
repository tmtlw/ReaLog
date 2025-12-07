import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Lock, Unlock, PenTool, Download, 
  Plus, Trash2, Save, X, ChevronRight, Layout, RefreshCw,
  Image as ImageIcon, Calendar, List, Grid as GridIcon,
  Settings, Server, MapPin, Eye, EyeOff, Search, ChevronLeft, Map as MapIcon,
  ThermometerSun, Menu, LogOut,
  Globe, Images, Bold, Italic, Underline, Link as LinkIcon
} from 'lucide-react';
import { AppData, Category, Entry, WeatherData, ThemeOption, CategoryConfig } from './types';
import { CATEGORY_LABELS, DEMO_PASSWORD, INITIAL_DATA, DEFAULT_QUESTIONS, CATEGORY_COLORS } from './constants';
import { THEMES } from './constants/theme';
import * as StorageService from './services/storage';

// Imported Components
import { Button, Card, Input } from './components/ui';
import StatusBar from './components/layout/StatusBar';
import AtlasView from './components/views/AtlasView';
import GalleryView from './components/views/GalleryView';
import CalendarView from './components/views/CalendarView';
import QuestionManager from './components/views/QuestionManager';
import ExportModal from './components/modals/ExportModal';
import SettingsModal from './components/modals/SettingsModal';
import DeployModal from './components/modals/DeployModal';
import StorageDebugMenu from './components/modals/StorageDebugMenu';

const DEFAULT_MOODS = ['🔥', '🚀', '🙂', '😐', '😫'];

// --- Main Application ---

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
  const [editorLayout, setEditorLayout] = useState<'list' | 'grid'>('list');
  const [currentEntry, setCurrentEntry] = useState<Partial<Entry>>({});
  const [activeTab, setActiveTab] = useState<'entries' | 'questions'>('entries');
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [locationParts, setLocationParts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Dynamic App Name Logic
  const appName = data.settings?.userName || 'Grind Napló';

  // ... (useEffect hooks for init, theme, viewMode, save - same as before) ...
  useEffect(() => {
    const init = async () => {
        setIsAppLoading(true);
        const local = StorageService.loadData();
        if (local.settings?.theme) setCurrentTheme(local.settings.theme);
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
        if (local.settings?.cloud?.enabled && local.settings.cloud.url) {
            setSyncStatus('syncing');
            try {
                const cloudData = await StorageService.cloudLoad(local.settings.cloud);
                if (cloudData) {
                    const mergedData = { ...cloudData, settings: { ...local.settings, ...cloudData.settings } };
                    setData(mergedData);
                    setSyncStatus('success');
                    setLastSyncTime(Date.now());
                    setSystemMessage("");
                } else {
                    setData(local);
                    setSyncStatus('idle');
                }
            } catch (e) {
                setSyncStatus('error');
                setSystemMessage("Felhő szinkronizációs hiba!");
                setData(local);
            }
        } else {
            setData(local);
        }
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
    StorageService.saveData(data);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if(isAppLoading) return;
    if (serverMode) {
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
    } else if (data.settings?.cloud?.enabled && data.settings.cloud.url) {
        setSyncStatus('syncing');
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await StorageService.cloudSave(data, data.settings!.cloud!);
                setSyncStatus('success');
                setLastSyncTime(Date.now());
                setSystemMessage("");
                setTimeout(() => setSyncStatus('idle'), 2000);
            } catch (e) {
                setSyncStatus('error');
                setSystemMessage("Felhő mentési hiba!");
            }
        }, 2000);
    }
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [data, serverMode]);

  // --- Helpers ---

  // Helper to get current list of entries based on view/category/search
  const getFilteredEntries = () => {
      let entries = data.entries;

      // Privacy Filter: If not admin, exclude private posts
      if (!isAdmin) {
          entries = entries.filter(e => !e.isPrivate);
      }

      if (globalView === 'atlas' || globalView === 'gallery') {
          return entries; // Show all for global views
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
      
      // Calendar filtering is usually strict to the viewed month, but here we just return all matching category rules
      // and sort by timestamp descending.
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

  const insertTextTag = (tag: string, closeTag?: string) => {
      if (!textAreaRef.current) return;
      const textarea = textAreaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = currentEntry.freeTextContent || '';
      const selected = text.substring(start, end);
      
      let insertion = '';
      if (closeTag) {
          insertion = `${tag}${selected}${closeTag}`;
      } else {
          // Self closing or special logic
          insertion = tag;
      }

      // Handle Link special case
      if (tag === '<a href="') {
          const url = prompt("Add meg a linket:", "https://");
          if (url) {
              insertion = `<a href="${url}" target="_blank">${selected || 'link'}</a>`;
          } else {
              return; // Cancel
          }
      }

      const newText = text.substring(0, start) + insertion + text.substring(end);
      setCurrentEntry({ ...currentEntry, freeTextContent: newText });
      
      // Restore cursor/selection
      setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + insertion.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
  };

  // --- Handlers ---
  
  // (handleStorageModeSwitch, handleLogin, handleLogout, handleImport... same as before)
  const handleStorageModeSwitch = async (mode: 'server' | 'cloud' | 'local') => {
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
      else if (mode === 'cloud') {
          if (!data.settings?.cloud?.url) throw new Error("Nincs beállítva felhő URL");
          setServerMode(false);
          try {
              const cloudData = await StorageService.cloudLoad(data.settings.cloud);
              if (cloudData) {
                  setData(prev => ({...cloudData, settings: {...prev.settings, ...cloudData.settings}}));
                  setSystemMessage("");
              } else {
                  throw new Error("Üres válasz a felhőből");
              }
          } catch(e: any) {
              setSystemMessage(e.message || "Felhő hiba");
              throw e;
          }
      }
      else {
          setServerMode(false);
          setData(prev => {
              if (prev.settings?.cloud) return { ...prev, settings: { ...prev.settings, cloud: { ...prev.settings.cloud, enabled: false } } };
              return prev;
          });
          setSystemMessage("Offline Mód Aktív");
      }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAppLoading) return;
    const currentPassword = data.settings?.adminPassword || DEMO_PASSWORD;
    if (passwordInput === currentPassword) {
      setIsAdmin(true);
      setShowAuthModal(false);
      setPasswordInput("");
    } else {
      alert("Hibás jelszó!");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsEditing(false);
    setActiveTab('entries');
    setShowMobileMenu(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedData = await StorageService.importFromJson(file);
        if (confirm("Biztosan felülírod a jelenlegi adatokat?")) {
          setData(importedData);
          if (importedData.settings?.theme) setCurrentTheme(importedData.settings.theme);
        }
      } catch (err) {
        alert("Hiba az importálás során.");
      }
    }
  };

  const startNewEntry = () => {
    const today = new Date();
    // Default for Daily
    // Use local time for label to avoid UTC previous day issues
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const da = today.getDate().toString().padStart(2, '0');
    let label = `${y}-${m}-${da}`; 
    
    if (activeCategory === Category.WEEKLY) {
        // Calculate ISO Week
        const d = new Date(Date.UTC(y, today.getMonth(), today.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
        label = `${d.getUTCFullYear()} W${weekNo.toString().padStart(2, '0')}`; // Added padding
    }
    
    if (activeCategory === Category.MONTHLY) {
        label = `${y}-${m}`;
    }
    
    if (activeCategory === Category.YEARLY) label = `${y}`;

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
      entryMode: 'structured', // Default
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
    
    // Process location parts if available
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

  const getLocationAndWeather = () => {
    if (!navigator.geolocation) { alert("A böngésző nem támogatja a helymeghatározást."); return; }
    
    setIsFetchingWeather(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const { latitude, longitude } = position.coords;
            let weatherInfo: WeatherData | undefined = undefined;
            const parts: string[] = [];

            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                if(geoRes.ok) {
                    const geoData = await geoRes.json();
                    const addr = geoData.address;
                    if (addr) {
                        // Detailed parts
                        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
                        if (addr.road) parts.push(addr.road);
                        if (addr.house_number) parts.push(addr.house_number);
                        if (geoData.name && geoData.name !== addr.road) parts.push(geoData.name); // Place name if specific
                    }
                }
            } catch(e) { console.warn("Reverse geocode failed", e); }

            // Set unique parts to state for editing
            setLocationParts([...new Set(parts)].filter(Boolean));

            if (data.settings?.openWeatherMapKey) {
                try {
                    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${data.settings?.openWeatherMapKey}&units=metric&lang=hu`);
                    if (res.ok) {
                        const weatherData = await res.json();
                         weatherInfo = {
                            temp: Math.round(weatherData.main.temp),
                            condition: weatherData.weather[0].description,
                            location: weatherData.name, 
                            icon: weatherData.weather[0].icon
                        };
                    }
                } catch(e) { console.warn("Weather failed", e); }
            }
            
            setCurrentEntry(prev => {
                const newData = { ...prev };
                newData.gps = { lat: latitude, lon: longitude };
                if (weatherInfo) newData.weather = weatherInfo;
                return newData;
            });

        } catch (e) { console.error(e); alert("Hiba a helymeghatározás során."); } 
        finally { setIsFetchingWeather(false); }
    }, (err) => { alert("Hiba: " + err.message); setIsFetchingWeather(false); }, { enableHighAccuracy: true });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 1024 * 1024 * 5) { alert("Túl nagy fájl (max 5MB)."); return; }
          
          if (serverMode) {
              try {
                  const url = await StorageService.uploadImage(file);
                  setCurrentEntry(prev => ({ ...prev, photo: url }));
              } catch (err: any) {
                  console.error(err);
                  alert("Hiba a feltöltés során: " + err.message);
              }
          } else {
              const reader = new FileReader();
              reader.onloadend = () => setCurrentEntry(prev => ({ ...prev, photo: reader.result as string }));
              reader.readAsDataURL(file);
          }
      }
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

  // --- Views ---

  const renderEntryForm = () => {
    const entryQuestionIds = Object.keys(currentEntry.responses || {}) as string[];
    const availableQuestions = data.questions.filter(q => q.category === activeCategory && !entryQuestionIds.includes(q.id));
    const activeMoods = data.settings?.moods && data.settings.moods.length > 0 ? data.settings.moods : DEFAULT_MOODS;

    const addQuestionToEntry = (questionId: string) => {
        if (!questionId) return;
        setCurrentEntry(prev => ({ ...prev, responses: { ...prev.responses, [questionId]: "" } }));
    };

    const removeQuestionFromEntry = (questionId: string) => {
        const newResponses = { ...currentEntry.responses };
        delete newResponses[questionId];
        setCurrentEntry(prev => ({ ...prev, responses: newResponses }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) return;

        let newTimestamp = currentEntry.timestamp || Date.now();
        let newLabel = currentEntry.dateLabel || val;

        if (activeCategory === Category.DAILY) {
            newLabel = val.split('T')[0];
            newTimestamp = new Date(val).getTime();
        } else if (activeCategory === Category.WEEKLY) {
            newLabel = val.replace('-W', ' W'); // "2023 W42"
            const [y, w] = val.split('-W');
            const simpleDate = new Date(parseInt(y), 0, (parseInt(w) - 1) * 7 + 4); 
            newTimestamp = simpleDate.getTime();
        } else if (activeCategory === Category.MONTHLY) {
            newLabel = val;
            newTimestamp = new Date(val).getTime();
        } else if (activeCategory === Category.YEARLY) {
            newLabel = val;
            newTimestamp = new Date(parseInt(val), 0, 1).getTime();
        }

        setCurrentEntry(prev => ({
            ...prev,
            timestamp: newTimestamp,
            dateLabel: newLabel
        }));
    };

    const getDateInputValue = () => {
        if (!currentEntry.timestamp && !currentEntry.dateLabel) return "";
        
        if (activeCategory === Category.DAILY) {
            const d = new Date(currentEntry.timestamp || Date.now());
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
        }
        if (activeCategory === Category.WEEKLY) {
            // "2023 W42" -> "2023-W42"
            if (currentEntry.dateLabel?.includes(' W')) {
                return currentEntry.dateLabel.replace(' W', '-W');
            }
            return currentEntry.dateLabel || "";
        }
        if (activeCategory === Category.MONTHLY) {
            return currentEntry.dateLabel || "";
        }
        if (activeCategory === Category.YEARLY) {
            return currentEntry.dateLabel || "";
        }
        return "";
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className={`flex items-center justify-between mb-4 border-b ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-200'} pb-4`}>
            <h2 className={`text-xl font-bold ${themeClasses.accent} flex items-center gap-2`}>
                <PenTool className="w-5 h-5 flex-shrink-0" />
                <input 
                    type={activeCategory === Category.DAILY ? 'datetime-local' : activeCategory === Category.WEEKLY ? 'week' : activeCategory === Category.MONTHLY ? 'month' : 'number'}
                    min={activeCategory === Category.YEARLY ? "1900" : undefined}
                    max={activeCategory === Category.YEARLY ? "2100" : undefined}
                    value={getDateInputValue()}
                    onChange={handleDateChange}
                    className={`bg-transparent border-b border-dashed border-current focus:outline-none focus:border-solid ${themeClasses.text} min-w-[140px] md:min-w-[200px] cursor-pointer hover:opacity-80 transition-opacity`}
                />
            </h2>
            <div className="flex gap-2">
                 {currentEntry.entryMode === 'structured' && (
                     <div className={`rounded-lg p-1 border flex mr-2 ${currentTheme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                        <button onClick={() => setEditorLayout('list')} className={`p-1.5 rounded ${editorLayout === 'list' ? 'bg-white/10 shadow' : 'opacity-50'}`}><List className="w-4 h-4" /></button>
                        <button onClick={() => setEditorLayout('grid')} className={`p-1.5 rounded ${editorLayout === 'grid' ? 'bg-white/10 shadow' : 'opacity-50'}`}><GridIcon className="w-4 h-4" /></button>
                     </div>
                 )}
                <Button variant="ghost" themeClasses={themeClasses} onClick={() => setIsEditing(false)}>
                    <X className="w-5 h-5" /> Mégse
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={`block text-xs font-medium mb-1 uppercase ${themeClasses.subtext}`}>Cím</label>
                <Input 
                    themeClasses={themeClasses}
                    value={currentEntry.title || ''} 
                    onChange={(e: any) => setCurrentEntry({...currentEntry, title: e.target.value})} 
                    placeholder="Adj címet..."
                />
            </div>
            <div>
                 <label className={`block text-xs font-medium mb-1 uppercase ${themeClasses.subtext}`}>Hangulat</label>
                 <div className="grid grid-cols-5 gap-1">
                     {activeMoods.map((m, idx) => (
                         <button 
                            key={idx} 
                            onClick={() => setCurrentEntry({...currentEntry, mood: m})}
                            className={`text-xl p-2 rounded-lg transition-colors flex items-center justify-center ${currentEntry.mood === m ? 'bg-black/10 ring-1' : 'hover:bg-black/5'}`}
                         >
                             {m}
                         </button>
                     ))}
                 </div>
            </div>
        </div>

        {/* Mode Toggle */}
        <div className={`flex rounded-lg p-1 border mb-4 ${currentTheme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
            <button 
                onClick={() => setCurrentEntry(prev => ({ ...prev, entryMode: 'structured' }))}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${currentEntry.entryMode !== 'free' ? 'bg-white shadow text-black' : 'opacity-50 hover:opacity-80'}`}
            >
                Kérdések (Grind)
            </button>
            <button 
                onClick={() => setCurrentEntry(prev => ({ ...prev, entryMode: 'free' }))}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${currentEntry.entryMode === 'free' ? 'bg-white shadow text-black' : 'opacity-50 hover:opacity-80'}`}
            >
                Szabad Napló
            </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
             <Button type="button" variant="secondary" themeClasses={themeClasses} onClick={getLocationAndWeather} disabled={isFetchingWeather} size="sm">
                 {isFetchingWeather ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                 Helyszín & Időjárás
             </Button>
             <Button type="button" variant="secondary" themeClasses={themeClasses} onClick={() => fileInputRef.current?.click()} size="sm">
                 <ImageIcon className="w-4 h-4" /> {currentEntry.photo ? 'Fotó cseréje' : 'Fotó hozzáadása'}
             </Button>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        </div>

        {/* Removable Location Parts */}
        {(locationParts.length > 0 || currentEntry.location) && (
            <div className="flex items-center gap-2 mb-2">
                <div className="flex flex-wrap gap-2 flex-1">
                    {locationParts.map((part, idx) => (
                        <div key={idx} className={`flex items-center gap-2 pl-3 pr-2 py-1 rounded-full text-xs font-medium border bg-blue-500/10 border-blue-500/20 text-blue-500`}>
                            <span>{part}</span>
                            <button 
                                onClick={() => setLocationParts(p => p.filter((_, i) => i !== idx))}
                                className="hover:text-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {currentEntry.location && !locationParts.length && (
                        <div className={`flex items-center gap-2 pl-3 pr-2 py-1 rounded-full text-xs font-medium border ${themeClasses.card}`}>
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            <span>{currentEntry.location}</span>
                            <button 
                                onClick={() => setCurrentEntry(p => ({...p, location: undefined}))}
                                className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"
                                title="Helyszín törlése"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Location Privacy Toggle */}
                {(locationParts.length > 0 || currentEntry.location) && (
                    <button 
                        onClick={() => setCurrentEntry(p => ({...p, isLocationPrivate: !p.isLocationPrivate}))}
                        className={`p-2 rounded-full border transition-all ${currentEntry.isLocationPrivate ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-black/5 border-transparent opacity-50 hover:opacity-100'}`}
                        title={currentEntry.isLocationPrivate ? "Helyszín privát (Térképen nem látszik)" : "Helyszín publikus"}
                    >
                        {currentEntry.isLocationPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
        )}

        {/* Existing Weather display */}
        <div className="flex flex-wrap gap-2 mb-4">
            {currentEntry.weather && (
                <div className={`flex items-center gap-2 pl-3 pr-2 py-1 rounded-full text-xs font-medium border ${themeClasses.card}`}>
                    <ThermometerSun className="w-4 h-4 text-orange-400" />
                    {currentEntry.weather.icon && (
                        <img src={`https://openweathermap.org/img/wn/${currentEntry.weather.icon}.png`} alt="weather icon" className="w-6 h-6" />
                    )}
                    <span>{currentEntry.weather.temp}°C, {currentEntry.weather.condition}</span>
                    <button 
                         onClick={() => setCurrentEntry(p => ({...p, weather: undefined}))}
                         className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"
                         title="Időjárás törlése"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>

        {currentEntry.photo && (
            <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border">
                <img src={currentEntry.photo} alt="Attached" className="w-full h-full object-cover" />
                <button onClick={() => setCurrentEntry({...currentEntry, photo: undefined})} className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        <div className="space-y-4">
             {currentEntry.entryMode === 'free' ? (
                 <div className={`border rounded-lg overflow-hidden ${themeClasses.card}`}>
                     {/* Toolbar */}
                     <div className="flex gap-1 p-2 border-b border-current border-opacity-10 bg-black/5">
                         <button onClick={() => insertTextTag('<b>', '</b>')} className="p-1.5 hover:bg-black/10 rounded" title="Félkövér"><Bold className="w-4 h-4" /></button>
                         <button onClick={() => insertTextTag('<i>', '</i>')} className="p-1.5 hover:bg-black/10 rounded" title="Dőlt"><Italic className="w-4 h-4" /></button>
                         <button onClick={() => insertTextTag('<u>', '</u>')} className="p-1.5 hover:bg-black/10 rounded" title="Aláhúzott"><Underline className="w-4 h-4" /></button>
                         <div className="w-px bg-current opacity-20 mx-1"></div>
                         <button onClick={() => insertTextTag('<a href="')} className="p-1.5 hover:bg-black/10 rounded" title="Link"><LinkIcon className="w-4 h-4" /></button>
                     </div>
                     <textarea 
                        ref={textAreaRef}
                        className={`w-full p-4 min-h-[300px] focus:outline-none bg-transparent ${themeClasses.text}`}
                        value={currentEntry.freeTextContent || ''}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, freeTextContent: e.target.value }))}
                        placeholder="Írd ide a gondolataidat..."
                     />
                 </div>
             ) : (
                 <>
                    {availableQuestions.length > 0 && (
                        <div className={`flex gap-2 p-3 rounded-lg border ${themeClasses.card}`}>
                            <select 
                                className={`flex-1 bg-transparent text-sm focus:outline-none ${themeClasses.text}`}
                                onChange={(e) => { addQuestionToEntry(e.target.value); e.target.value = ""; }}
                            >
                                <option value="">+ Kérdés hozzáadása...</option>
                                {availableQuestions.map(q => <option key={q.id} value={q.id}>{q.text}</option>)}
                            </select>
                        </div>
                    )}

                    <div className={`gap-4 ${editorLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-4'}`}>
                        {entryQuestionIds.map((qId: string) => {
                            const q = data.questions.find(quest => quest.id === qId);
                            if (!q) return null;
                            return (
                                <div key={qId} className={`space-y-2 p-3 rounded-lg border bg-black/5 ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-200'}`}>
                                    <div className="flex justify-between items-start gap-2">
                                        <label className={`block text-sm font-medium leading-snug ${themeClasses.accent}`}>{q.text}</label>
                                        <button onClick={() => removeQuestionFromEntry(qId)} className="opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
                                    </div>
                                    <textarea 
                                        className={`w-full rounded-lg p-3 min-h-[80px] focus:ring-2 focus:outline-none ${themeClasses.input}`}
                                        value={currentEntry.responses?.[qId] || ''}
                                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, responses: { ...prev.responses, [qId]: e.target.value } }))}
                                        placeholder="Írj ide..."
                                    />
                                </div>
                            );
                        })}
                    </div>
                 </>
             )}
        </div>

        <div className={`flex gap-4 pt-4 border-t sticky bottom-0 backdrop-blur py-2 z-10 ${currentTheme === 'dark' ? 'border-zinc-800 bg-zinc-950/90' : 'border-slate-200 bg-white/90'}`}>
          <div className="flex-1 flex gap-2">
              {/* Privacy Toggle */}
              <button 
                onClick={() => setCurrentEntry(p => ({...p, isPrivate: !p.isPrivate}))}
                className={`px-3 rounded-lg border flex items-center justify-center transition-all ${currentEntry.isPrivate ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-current opacity-30 hover:opacity-80'}`}
                title={currentEntry.isPrivate ? "Privát bejegyzés (Csak admin látja)" : "Publikus bejegyzés"}
              >
                  {currentEntry.isPrivate ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </button>
              <Button onClick={saveEntry} themeClasses={themeClasses} className="flex-1">
                <Save className="w-4 h-4" /> Mentés
              </Button>
          </div>
        </div>
      </div>
    );
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
        {/* Modals */}
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
        {showStorageMenu && <StorageDebugMenu onClose={() => setShowStorageMenu(false)} onSwitchMode={handleStorageModeSwitch} serverMode={serverMode} cloudConfig={data.settings?.cloud} lastError={systemMessage} themeClasses={themeClasses} />}

        {selectedEntry && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedEntry(null)}>
                <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl relative bg-zinc-900 border border-zinc-800 shadow-2xl" onClick={e => e.stopPropagation()}>
                   {/* Entry Detail Content */}
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
                                    {selectedEntry.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedEntry.location}</span>}
                                    {selectedEntry.weather && <span className="flex items-center gap-1"><ThermometerSun className="w-3 h-3" /> {selectedEntry.weather.temp}°C</span>}
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
                                            <p className="whitespace-pre-wrap">{ans as string}</p>
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

        {/* Navigation Bar */}
        <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${themeClasses.nav}`}>
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                         <span className="font-bold text-white">G</span>
                     </div>
                     <span className="font-bold text-lg hidden md:block tracking-tight">{appName}</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-1 bg-black/5 p-1 rounded-lg border border-black/5">
                    {[Category.DAILY, Category.WEEKLY, Category.MONTHLY, Category.YEARLY].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setGlobalView('none'); setActiveTab('entries'); }}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeCategory === cat && globalView === 'none' ? 'bg-white shadow-sm text-black scale-105' : 'opacity-60 hover:opacity-100'}`}
                        >
                            {CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setGlobalView('atlas')} className={`p-2 rounded-lg transition-all ${globalView === 'atlas' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`} title="Térkép">
                        <MapIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setGlobalView('gallery')} className={`p-2 rounded-lg transition-all ${globalView === 'gallery' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`} title="Galéria">
                        <Images className="w-5 h-5" />
                    </button>
                    
                    <div className="h-6 w-px bg-current opacity-10 mx-1"></div>
                    
                    {isAdmin && (
                        <>
                            <button onClick={() => setShowDeployModal(true)} className="p-2 opacity-50 hover:opacity-100" title="Telepítés"><Server className="w-5 h-5" /></button>
                            <button onClick={() => setShowSettingsModal(true)} className="p-2 opacity-50 hover:opacity-100" title="Beállítások"><Settings className="w-5 h-5" /></button>
                        </>
                    )}
                    
                    {isAdmin ? (
                        <button onClick={handleLogout} className="p-2 opacity-50 hover:opacity-100 text-red-500" title="Kijelentkezés"><LogOut className="w-5 h-5" /></button>
                    ) : (
                        <button onClick={() => setShowAuthModal(true)} className="p-2 opacity-50 hover:opacity-100" title="Admin belépés"><Lock className="w-5 h-5" /></button>
                    )}
                    <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 opacity-50"><Menu className="w-5 h-5" /></button>
                </div>
            </div>
            
            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="md:hidden border-t p-4 space-y-2 animate-fade-in bg-inherit">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {[Category.DAILY, Category.WEEKLY, Category.MONTHLY, Category.YEARLY].map(cat => (
                            <button key={cat} onClick={() => { setActiveCategory(cat); setGlobalView('none'); setActiveTab('entries'); setShowMobileMenu(false); }} className={`p-2 rounded border text-center text-sm ${activeCategory === cat && globalView === 'none' ? themeClasses.accent + ' border-current' : 'border-transparent bg-black/5'}`}>
                                {CATEGORY_LABELS[cat]}
                            </button>
                        ))}
                    </div>
                    {isAdmin && (
                        <>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { setShowExportModal(true); setShowMobileMenu(false); }} className="w-full justify-start"><Download className="w-4 h-4" /> Export / Import</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { setShowDeployModal(true); setShowMobileMenu(false); }} className="w-full justify-start"><Server className="w-4 h-4" /> Telepítés</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { setShowSettingsModal(true); setShowMobileMenu(false); }} className="w-full justify-start"><Settings className="w-4 h-4" /> Beállítások</Button>
                        </>
                    )}
                </div>
            )}
        </nav>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full p-4 pb-24">
            {isAppLoading ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                    <p>Betöltés...</p>
                </div>
            ) : isEditing ? (
                renderEntryForm()
            ) : globalView === 'atlas' ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Globe className="w-5 h-5" /> Világtérkép</h2>
                    <AtlasView entries={data.entries} activeCategory={activeCategory} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} showAll={true} />
                </div>
            ) : globalView === 'gallery' ? (
                <div className="space-y-4">
                     <h2 className="text-xl font-bold flex items-center gap-2"><Images className="w-5 h-5" /> Fotógaléria</h2>
                     <GalleryView entries={data.entries} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} renderActionButtons={renderActionButtons} />
                </div>
            ) : (
                <>
                    {/* View Controls */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                             {isAdmin && (
                                <div className="flex bg-black/5 p-1 rounded-lg border border-black/5 mr-2">
                                    <button onClick={() => setActiveTab('entries')} className={`px-3 py-1 rounded text-xs font-bold ${activeTab === 'entries' ? 'bg-white shadow text-black' : 'opacity-50'}`}>Bejegyzések</button>
                                    <button onClick={() => setActiveTab('questions')} className={`px-3 py-1 rounded text-xs font-bold ${activeTab === 'questions' ? 'bg-white shadow text-black' : 'opacity-50'}`}>Kérdések</button>
                                </div>
                             )}
                             {activeTab === 'entries' && (
                                <div className="flex bg-black/5 p-1 rounded-lg border border-black/5">
                                    <button onClick={() => handleViewModeChange('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow text-black' : 'opacity-50'}`} title="Grid"><Layout className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('timeline')} className={`p-1.5 rounded ${viewMode === 'timeline' ? 'bg-white shadow text-black' : 'opacity-50'}`} title="Timeline"><List className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('calendar')} className={`p-1.5 rounded ${viewMode === 'calendar' ? 'bg-white shadow text-black' : 'opacity-50'}`} title="Naptár"><Calendar className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('atlas')} className={`p-1.5 rounded ${viewMode === 'atlas' ? 'bg-white shadow text-black' : 'opacity-50'}`} title="Térkép"><MapIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('gallery')} className={`p-1.5 rounded ${viewMode === 'gallery' ? 'bg-white shadow text-black' : 'opacity-50'}`} title="Galéria"><Images className="w-4 h-4" /></button>
                                </div>
                             )}
                         </div>

                         {/* Search */}
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
                        /* Entries Rendering */
                        <div className="animate-fade-in">
                            {viewMode === 'grid' && (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {getFilteredEntries().map(e => (
                                        <Card key={e.id} themeClasses={themeClasses} className="group hover:border-emerald-500/50 transition-colors flex flex-col relative">
                                             {e.photo && (
                                                 <div className="h-32 overflow-hidden relative cursor-pointer" onClick={() => setSelectedEntry(e)}>
                                                     <img src={e.photo} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                 </div>
                                             )}
                                             <div className="p-5 flex-1 flex flex-col" onClick={() => setSelectedEntry(e)}>
                                                 <div className="flex justify-between items-start mb-2">
                                                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${CATEGORY_COLORS[e.category]} text-white`}>{CATEGORY_LABELS[e.category]}</span>
                                                     {e.mood && <span className="text-lg">{e.mood}</span>}
                                                 </div>
                                                 <h3 className="font-bold text-lg mb-2 leading-tight group-hover:text-emerald-500 transition-colors cursor-pointer">{e.title || e.dateLabel}</h3>
                                                 <div className="text-sm opacity-60 mb-4 line-clamp-3 flex-1">
                                                     {e.entryMode === 'free' ? e.freeTextContent : Object.values(e.responses).filter(Boolean).join(' • ')}
                                                 </div>
                                                 <div className="flex items-center justify-between pt-4 border-t border-current border-opacity-10 mt-auto">
                                                     <div className="text-xs opacity-50 flex flex-col">
                                                         <span>{new Date(e.timestamp).toLocaleDateString()}</span>
                                                         {e.location && <span>{e.location}</span>}
                                                     </div>
                                                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                         {renderActionButtons(e)}
                                                     </div>
                                                 </div>
                                             </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {viewMode === 'timeline' && (
                                <div className="relative border-l-2 border-emerald-500/20 ml-3 space-y-8 py-2">
                                    {getFilteredEntries().map(e => (
                                        <div key={e.id} className="relative pl-8 group">
                                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-zinc-900 ${CATEGORY_COLORS[e.category]}`}></div>
                                            <div className={`p-4 rounded-lg border transition-all ${themeClasses.card} hover:border-emerald-500/50 cursor-pointer`} onClick={() => setSelectedEntry(e)}>
                                                 <div className="flex justify-between items-start">
                                                     <div>
                                                         <span className="text-xs font-mono opacity-50 mb-1 block">{new Date(e.timestamp).toLocaleString()}</span>
                                                         <h3 className="font-bold text-lg">{e.title || e.dateLabel}</h3>
                                                     </div>
                                                     {e.mood && <div className="text-2xl">{e.mood}</div>}
                                                 </div>
                                                 <div className="mt-2 text-sm opacity-80 line-clamp-2">
                                                     {e.entryMode === 'free' ? e.freeTextContent : Object.values(e.responses).filter(Boolean).join(' • ')}
                                                 </div>
                                                 <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                                     {renderActionButtons(e)}
                                                 </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {viewMode === 'atlas' && (
                                <AtlasView entries={getFilteredEntries()} activeCategory={activeCategory} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} />
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

                            {getFilteredEntries().length === 0 && viewMode !== 'calendar' && (
                                <div className="text-center py-20 opacity-40">
                                    <Book className="w-12 h-12 mx-auto mb-4" />
                                    <p>Nincs megjeleníthető bejegyzés.</p>
                                    {isAdmin && <p className="text-sm mt-2">Kattints a + gombra új bejegyzéshez.</p>}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </main>

        {/* Floating Action Button */}
        {isAdmin && !isEditing && (
            <button 
                onClick={startNewEntry}
                className="fixed bottom-8 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-50"
            >
                <Plus className="w-6 h-6" />
            </button>
        )}

        <StatusBar 
            serverMode={serverMode} 
            syncStatus={syncStatus} 
            lastSyncTime={lastSyncTime} 
            systemMessage={systemMessage} 
            themeClasses={themeClasses}
            cloudEnabled={!!data.settings?.cloud?.enabled}
            onOpenDebug={() => setShowStorageMenu(true)}
        />
    </div>
  );
}