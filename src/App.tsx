
import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Lock, Unlock, PenTool, Download, Upload, 
  Plus, Trash2, Save, X, ChevronRight, Layout, RefreshCw,
  Image as ImageIcon, Cloud, Calendar, List, Grid as GridIcon,
  Smile, Settings, Info, Server, MapPin, Eye, EyeOff, Palette, Search, ChevronLeft, Map as MapIcon,
  ThermometerSun, Menu, Code, LogOut, CheckCircle2, AlertCircle, CloudLightning, HardDrive,
  Wifi, WifiOff, Database, Activity, ChevronUp, Terminal, Copy, FileText, FileCode, User,
  Globe, Layers, Shield, ShieldAlert, Clock, Bold, Italic, Underline, Link as LinkIcon, AlignLeft,
  Recycle, Hash, PieChart, CalendarClock, Filter, Edit2, BookOpen, Images
} from 'lucide-react';
import { AppData, Category, Entry, WeatherData, ThemeOption, CategoryConfig, PublicConfig, Template, WeatherIconPack, EmojiStyle, AppSettings, Habit } from './types';
import { CATEGORY_LABELS, DEMO_PASSWORD, INITIAL_DATA, DEFAULT_QUESTIONS, CATEGORY_COLORS, CATEGORY_BORDER_COLORS, DEFAULT_HABITS } from './constants';
import { THEMES, generateCustomTheme, getHolidayTheme, HOLIDAY_THEMES } from './constants/theme';
import * as StorageService from './services/storage';
import { getTranslation, Language } from './services/i18n';

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
import HabitManager from './components/views/HabitManager'; // New
import StatsView from './components/views/StatsView';
import TagManager from './components/views/TagManager';
import StreakView from './components/views/StreakView';
import WeatherRenderer from './components/ui/WeatherRenderer'; 
import EmojiRenderer from './components/ui/EmojiRenderer';

// Modals
import ExportModal from './components/modals/ExportModal';
import SettingsModal from './components/modals/SettingsModal';
import DeployModal from './components/modals/DeployModal';
import ThemeEditorModal from './components/modals/ThemeEditorModal';
import StorageDebugMenu from './components/modals/StorageDebugMenu';

export default function App() {
  // --- CORE DATA STATE ---
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // --- UI STATE ---
  const [activeCategory, setActiveCategory] = useState<Category>(Category.DAILY);
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>('dark');
  const [themeClasses, setThemeClasses] = useState(THEMES.dark);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'calendar' | 'atlas' | 'gallery'>('grid');
  const [globalView, setGlobalView] = useState<'none' | 'atlas' | 'gallery' | 'tags' | 'onThisDay' | 'trash' | 'stats' | 'streak'>('none');
  const [activeTab, setActiveTab] = useState<'entries' | 'questions' | 'habits'>('entries');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [logoEmoji, setLogoEmoji] = useState<string | null>(null);
  
  // --- INFINITE SCROLL STATE ---
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // --- SEARCH & FILTER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  // Intelligent Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterMood, setFilterMood] = useState("");
  const [filterHasPhoto, setFilterHasPhoto] = useState(false);

  // --- EDITOR & MODAL STATE ---
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null); 
  const [isEditing, setIsEditing] = useState(false); 
  const [draftEntry, setDraftEntry] = useState<Partial<Entry>>({}); 
  const [isDirty, setIsDirty] = useState(false); 
  const [locationParts, setLocationParts] = useState<string[]>([]); 
  
  // --- TAG MANAGER STATE ---
  const [showTagManager, setShowTagManager] = useState(false);

  // --- MODALS STATE ---
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'views' | 'public' | 'account' | 'about' | 'data'>('account');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [showStorageMenu, setShowStorageMenu] = useState(false);

  // --- SERVER / SYNC STATE ---
  const [serverMode, setServerMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success' | 'auto_syncing' | 'auto_success'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [systemMessage, setSystemMessage] = useState<string>("");
  
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- I18N ---
  const currentLang: Language = data.settings?.language || 'hu';
  const t = (key: string, params?: any) => {
      let text = getTranslation(currentLang, key);
      if (params) {
          Object.keys(params).forEach(k => {
              text = text.replace(`{${k}}`, params[k]);
          });
      }
      return text;
  };
  const getCatLabel = (cat: Category) => t(`category.${cat.toLowerCase()}`);
  
  // Dynamic App Name Logic
  const [appName, setAppName] = useState('ReaLog');

  // --- DERIVED STATE ---
  const showStats = data.settings?.enableStats !== false; 
  const showGamification = data.settings?.enableGamification !== false; 
  const showHabits = data.settings?.enableHabits !== false;
  const weatherPack: WeatherIconPack = data.settings?.weatherIconPack || 'outline'; 
  const emojiStyle: EmojiStyle = data.settings?.emojiStyle || 'native'; 

  // Calculate Streak (logic same as before)
  const getStreakInfo = () => {
      const dates = data.entries
          .filter(e => !e.isTrashed && e.timestamp <= Date.now())
          .map(e => new Date(e.timestamp).setHours(0,0,0,0))
          .sort((a,b) => b-a);
      
      const uniqueDates = [...new Set(dates)];
      if (uniqueDates.length === 0) return { current: 0, longest: 0 };

      // Current Streak
      const today = new Date().setHours(0,0,0,0);
      const yesterday = today - 86400000;
      let streak = 0;
      
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          streak = 1;
          let prevDate = uniqueDates[0] as number;
          for (let i = 1; i < uniqueDates.length; i++) {
              const currentDate = uniqueDates[i] as number;
              if (prevDate - currentDate === 86400000) { 
                  streak++;
                  prevDate = currentDate;
              } else {
                  break;
              }
          }
      }

      // Longest Streak
      let longest = 0;
      let currentSeq = 1;
      const sortedAsc = [...uniqueDates].sort((a,b) => a-b);
      
      if(sortedAsc.length > 0) longest = 1;

      for (let i = 1; i < sortedAsc.length; i++) {
          if ((sortedAsc[i] as number) - (sortedAsc[i-1] as number) === 86400000) {
              currentSeq++;
          } else {
              if (currentSeq > longest) longest = currentSeq;
              currentSeq = 1;
          }
      }
      if (currentSeq > longest) longest = currentSeq;

      return { current: streak, longest };
  };
  
  const streakInfo = getStreakInfo();

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
        setIsAppLoading(true);
        const local = StorageService.loadData();
        if (local.settings?.theme) setCurrentTheme(local.settings.theme);
        
        if (StorageService.checkAuthSession()) {
            setIsAdmin(true);
        }

        StorageService.setupBackgroundSync(
            () => { setSyncStatus('syncing'); setSystemMessage("Szinkronizálás..."); },
            (success) => {
                if(success) {
                    setSyncStatus('success'); 
                    setSystemMessage("");
                    setLastSyncTime(Date.now());
                    setTimeout(() => setSyncStatus('idle'), 2000);
                } else {
                    setSyncStatus('error');
                    setSystemMessage(t('server.offline_mode'));
                }
            }
        );

        const status = await StorageService.checkServerStatus();
        if (status.online) {
            setServerMode(true);
            setSyncStatus('syncing');
            const serverData = await StorageService.serverLoad();
            if (serverData) {
                // Merge data if needed
                const mergedData = { 
                    ...serverData, 
                    settings: { ...local.settings, ...serverData.settings },
                    // Ensure habits are present even if server data is old/empty
                    habits: (serverData.habits && serverData.habits.length > 0) ? serverData.habits : (local.habits || DEFAULT_HABITS)
                };
                setData(mergedData);
                setSyncStatus('success');
                setLastSyncTime(Date.now());
                setIsAppLoading(false);
                return;
            } else {
                setSystemMessage(t('server.api_not_found'));
            }
        }
        
        // Ensure local data has habits
        if (!local.habits || local.habits.length === 0) {
            local.habits = DEFAULT_HABITS;
        }
        setData(local);
        setIsAppLoading(false);
    }
    init();
  }, []);

  // Theme Application Logic
  useEffect(() => {
      const activeHolidayId = data.settings?.activeHoliday;
      let holiday = null;
      if (activeHolidayId) {
          holiday = HOLIDAY_THEMES.find(h => h.id === activeHolidayId);
      } else {
          holiday = getHolidayTheme(new Date());
      }

      setLogoEmoji(holiday ? holiday.emoji : null);

      if (holiday) {
          setThemeClasses(holiday.colors);
          document.body.className = holiday.colors.bg;
          setAppName(holiday.getDisplayDate(new Date().getFullYear()));
          return;
      }

      setAppName(data.settings?.userName ? `${data.settings.userName}Log` : 'ReaLog');
      
      let targetTheme = currentTheme;
      if (currentTheme === 'system') targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

      if (targetTheme === 'custom') {
          if (data.settings?.customTheme) {
              const customClasses = generateCustomTheme(
                  data.settings.customTheme.base, 
                  data.settings.customTheme.accent as any
              );
              setThemeClasses(customClasses);
              document.body.className = customClasses.bg;
          } else {
              setThemeClasses(THEMES.dark);
              document.body.className = THEMES.dark.bg;
          }
      } else {
          // @ts-ignore
          const classes = THEMES[targetTheme] || THEMES.dark;
          setThemeClasses(classes);
          document.body.className = classes.bg;
      }
  }, [currentTheme, data.settings?.customTheme, data.settings?.activeHoliday]); 

  // Typography Injection
  useEffect(() => {
      const { fontFamily, fontSize, customFontName, customFontData } = data.settings?.typography || {};
      
      let styleTag = document.getElementById('app-typography') as HTMLStyleElement;
      if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = 'app-typography';
          document.head.appendChild(styleTag);
      }

      let css = '';
      if (fontSize) css += `:root { font-size: ${fontSize}px; } `;
      
      if (data.settings?.offlineFonts) {
          css += `@font-face { font-family: 'OpenMoji'; src: url('fonts/OpenMoji-Color.woff2') format('woff2'); } `;
      }

      if (fontFamily) {
          const finalFamily = (fontFamily === 'Custom' && customFontName) ? customFontName : fontFamily;
          if (fontFamily === 'Custom' && customFontName && customFontData) {
              const src = customFontData.startsWith('fonts/') 
                  ? `url('${customFontData}')` 
                  : `url('${customFontData}')`;
              
              css += `@font-face { font-family: '${customFontName}'; src: ${src} format('woff2'); } `;
          } else if (fontFamily !== 'Custom') {
              const linkId = 'google-font-link';
              let link = document.getElementById(linkId) as HTMLLinkElement;
              if (!link) {
                  link = document.createElement('link');
                  link.id = linkId;
                  link.rel = 'stylesheet';
                  document.head.appendChild(link);
              }
              link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
          }
          css += `body, button, input, textarea, select { font-family: '${finalFamily}', sans-serif !important; } `;
      }
      styleTag.textContent = css;
  }, [data.settings?.typography, data.settings?.emojiStyle, data.settings?.offlineFonts]);

  // --- SAVE & PERSISTENCE ---
  useEffect(() => {
    StorageService.saveData(data); // Always save local
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if(isAppLoading) return;

    if (serverMode && isAdmin) {
        const isAuto = syncStatus === 'auto_syncing';
        if (!isAuto) setSyncStatus('syncing');

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await StorageService.serverSave(data);
                if (response && response.message && response.message !== 'success') {
                     setSystemMessage(`PHP: ${response.message}`);
                }
                setSyncStatus(isAuto ? 'auto_success' : 'success');
                setLastSyncTime(Date.now());
                if (!systemMessage.startsWith("PHP")) setSystemMessage("");
                setTimeout(() => setSyncStatus('idle'), 2000);
            } catch (e: any) {
                if (e.message.includes('Offline')) {
                    setSystemMessage(t('server.offline_mode'));
                    setSyncStatus('idle'); 
                } else {
                    setSyncStatus('error');
                    setSystemMessage(`${t('status.save_error')} ${e.message || ''}`);
                }
            }
        }, 1000);
    }
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [data, serverMode, isAdmin]);

  // --- AUTO SAVE ---
  useEffect(() => {
      if (isEditing && draftEntry.id) {
          if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
          autoSaveIntervalRef.current = setInterval(() => performAutoSave(), 60000);
      } else {
          if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
      }
      return () => { if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current); };
  }, [isEditing, draftEntry]); 

  // --- INFINITE SCROLL ---
  useEffect(() => {
      setVisibleCount(12);
  }, [activeCategory, globalView, searchQuery, filterStart, filterEnd, filterMood, filterHasPhoto]);

  const filteredEntriesAll = React.useMemo(() => {
      let entries = data.entries;
      if (!isAdmin) entries = entries.filter(e => !e.isPrivate);

      if (globalView === 'trash') {
          return entries.filter(e => e.isTrashed).sort((a, b) => b.timestamp - a.timestamp);
      }

      entries = entries.filter(e => !e.isTrashed);

      if (globalView === 'stats' || globalView === 'streak' || globalView === 'atlas' || globalView === 'gallery') {
          return entries; 
      }

      if (globalView === 'onThisDay') {
          const today = new Date();
          return entries.filter(e => {
              const d = new Date(e.timestamp);
              return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
          }).sort((a, b) => b.timestamp - a.timestamp);
      }

      if (globalView === 'tags') {
          if (searchQuery.startsWith('#')) {
              const tag = searchQuery.substring(1).toLowerCase();
              return entries.filter(e => e.tags?.some(t => t.toLowerCase() === tag)).sort((a, b) => b.timestamp - a.timestamp);
          }
          return entries; 
      }

      const config = data.settings?.categoryConfigs?.[activeCategory] || ({} as Partial<CategoryConfig>);
      const allowedCategories = [activeCategory];
      if (config.includeDaily) allowedCategories.push(Category.DAILY);
      if (config.includeWeekly) allowedCategories.push(Category.WEEKLY);
      if (config.includeMonthly) allowedCategories.push(Category.MONTHLY);

      entries = entries.filter(e => allowedCategories.includes(e.category));
      
      if (filterStart) {
          const startTs = new Date(filterStart).getTime();
          entries = entries.filter(e => e.timestamp >= startTs);
      }
      if (filterEnd) {
          const endTs = new Date(filterEnd).getTime() + 86400000;
          entries = entries.filter(e => e.timestamp <= endTs);
      }
      if (filterMood) {
          entries = entries.filter(e => e.mood === filterMood);
      }
      if (filterHasPhoto) {
          entries = entries.filter(e => (e.photos && e.photos.length > 0) || e.photo);
      }

      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          entries = entries.filter(e => 
              (e.title?.toLowerCase().includes(q)) ||
              (e.location?.toLowerCase().includes(q)) ||
              (Object.values(e.responses).some((r: string) => r.toLowerCase().includes(q))) ||
              (e.freeTextContent?.toLowerCase().includes(q)) ||
              (e.tags?.some(t => t.toLowerCase().includes(q.replace('#', ''))))
          );
      }
      return entries.sort((a, b) => b.timestamp - a.timestamp);
  }, [data.entries, activeCategory, globalView, isAdmin, searchQuery, filterStart, filterEnd, filterMood, filterHasPhoto]);

  useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
              setVisibleCount(prev => prev + 12);
          }
      }, { rootMargin: '100px' });

      if (loadMoreRef.current) {
          observer.observe(loadMoreRef.current);
      }

      return () => observer.disconnect();
  }, [filteredEntriesAll.length, loadMoreRef.current]);

  const visibleEntries = React.useMemo(() => {
      if (globalView === 'atlas' || (globalView === 'none' && viewMode === 'calendar')) {
          return filteredEntriesAll;
      }
      return filteredEntriesAll.slice(0, visibleCount);
  }, [filteredEntriesAll, visibleCount, globalView, viewMode]);


  const performAutoSave = () => {
      if (!draftEntry.id) return;
      setSyncStatus('auto_syncing');
      setData(prev => ({
          ...prev,
          entries: prev.entries.map(e => e.id === draftEntry.id ? { ...e, ...draftEntry } as Entry : e)
      }));
  };

  // --- ACTIONS ---

  const resetEditor = () => {
      setIsEditing(false);
      setIsDirty(false);
      setDraftEntry({});
      setLocationParts([]);
  };

  const attemptNavigation = (action: () => void) => {
      if (isEditing && draftEntry.id) {
          performAutoSave();
          resetEditor();
      }
      action();
  };

  const handleModalNav = (direction: 'next' | 'prev') => {
      if (!selectedEntry) return;
      const filtered = filteredEntriesAll;
      const currentIndex = filtered.findIndex(e => e.id === selectedEntry.id);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'next' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex >= 0 && targetIndex < filtered.length) {
          setSelectedEntry(filtered[targetIndex]);
      }
  };

  const saveTemplate = (name: string, questions: string[], isDefault: boolean = false) => {
      const newTemplate: Template = { id: crypto.randomUUID(), name, questions, category: activeCategory, isDefault };
      let newTemplates = [...(data.templates || [])];
      if (isDefault) {
          newTemplates = newTemplates.map(t => t.category === activeCategory ? { ...t, isDefault: false } : t);
      }
      setData(prev => ({ ...prev, templates: [...newTemplates, newTemplate] }));
      alert(t('templates.saved'));
  };

  const deleteTemplate = (id: string) => {
      if(confirm(t('common.confirm_action'))) {
          setData(prev => ({ ...prev, templates: (prev.templates || []).filter(t => t.id !== id) }));
      }
  };

  // --- ENTRY MANAGEMENT ---

  const startNewEntry = () => {
    const today = new Date();
    let label = today.toISOString().slice(0, 10);
    
    if (activeCategory === Category.WEEKLY) {
        const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
        label = `${d.getUTCFullYear()} W${weekNo}`;
    }
    if (activeCategory === Category.MONTHLY) label = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    if (activeCategory === Category.YEARLY) label = `${today.getFullYear()}`;

    const activeQuestions = data.questions.filter(q => q.category === activeCategory && q.isActive);
    const initialResponses: Record<string, string> = {};
    const defaultTemplate = data.templates?.find(t => t.isDefault && t.category === activeCategory);

    if (defaultTemplate) {
        defaultTemplate.questions.forEach(qText => {
            const q = data.questions.find(qx => qx.text === qText && qx.category === activeCategory);
            if (q) initialResponses[q.id] = "";
        });
    } else {
        activeQuestions.slice(0, 6).forEach(q => initialResponses[q.id] = "");
    }

    const newEntry: Entry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      category: activeCategory,
      dateLabel: label,
      title: '',
      responses: initialResponses,
      entryMode: 'structured',
      freeTextContent: '',
      isPrivate: true, 
      isLocationPrivate: false,
      tags: [],
      isDraft: true,
      isTrashed: false,
      photos: [],
      habitValues: {} // Explicit initialization
    };

    setSyncStatus('auto_syncing');
    setData(prev => ({
        ...prev,
        entries: [newEntry, ...prev.entries]
    }));

    setDraftEntry(newEntry);
    setLocationParts([]);
    setIsEditing(true);
    setIsDirty(false);
    setShowMobileMenu(false);
  };

  const editEntry = (entry: Entry) => {
      if(isEditing && draftEntry.id) performAutoSave();
      const entryCopy = JSON.parse(JSON.stringify(entry));
      if (!entryCopy.photos) entryCopy.photos = entryCopy.photo ? [entryCopy.photo] : [];
      setDraftEntry(entryCopy);
      setLocationParts(entry.location ? entry.location.split(', ') : []);
      setIsEditing(true);
      setIsDirty(false);
      setSelectedEntry(null);
  };

  const saveEntry = () => {
    if (!draftEntry.id) return;
    setSyncStatus('syncing');
    const finalEntry = { ...draftEntry } as Entry;
    if (!finalEntry.title?.trim()) finalEntry.title = finalEntry.dateLabel;
    
    if (locationParts.length > 0) {
        finalEntry.location = locationParts.join(', ');
    } else {
        finalEntry.location = undefined; 
    }

    const allText = [
        finalEntry.title || '',
        finalEntry.freeTextContent || '',
        ...Object.values(finalEntry.responses || {})
    ].join(' ');
    const tags = allText.match(/#[\w\u00C0-\u00FF]+/g)?.map(t => t.substring(1)) || [];
    finalEntry.tags = [...new Set(tags)];
    
    finalEntry.isDraft = false; 

    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === finalEntry.id ? finalEntry : e)
    }));
    resetEditor();
  };

  const softDeleteEntry = (id: string | undefined) => {
      if(!id) return;
      if(window.confirm(t('common.confirm_delete'))) {
          setSyncStatus('syncing');
          setData(prev => ({
              ...prev,
              entries: prev.entries.map(e => e.id === id ? { ...e, isTrashed: true } : e)
          }));
          resetEditor();
          setSelectedEntry(null);
      }
  };

  const restoreEntry = (id: string) => {
      setSyncStatus('syncing');
      setData(prev => ({
          ...prev,
          entries: prev.entries.map(e => e.id === id ? { ...e, isTrashed: false } : e)
      }));
  };

  const hardDeleteEntry = (id: string) => {
      if(window.confirm(t('common.confirm_perm_delete'))) {
          setSyncStatus('syncing');
          setData(prev => ({
              ...prev,
              entries: prev.entries.filter(e => e.id !== id)
          }));
          setSelectedEntry(null);
      }
  };

  const emptyTrash = () => {
      if(window.confirm(t('common.confirm_empty_trash'))) {
          setSyncStatus('syncing');
          setData(prev => ({
              ...prev,
              entries: prev.entries.filter(e => !e.isTrashed)
          }));
      }
  };

  const handleEditorChange = (updates: Partial<Entry>) => {
      setDraftEntry(prev => ({ ...prev, ...updates }));
      setIsDirty(true);
  };

  const handleEditorCancel = () => {
      if (draftEntry.isDraft) {
           setData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== draftEntry.id) }));
      }
      resetEditor();
  };

  const handleLogout = () => {
    attemptNavigation(() => {
        StorageService.clearAuthSession();
        setIsAdmin(false);
        setActiveTab('entries');
        setGlobalView('none');
        setShowMobileMenu(false);
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPassword = data.settings?.adminPassword || DEMO_PASSWORD;
    if (passwordInput === currentPassword) {
      setIsAdmin(true);
      StorageService.saveAuthSession();
      setShowAuthModal(false);
      setPasswordInput("");
    } else {
      alert(t('app.wrong_password'));
    }
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

        if (window.confirm(t('app.import_confirm'))) {
           if (importedData) {
              if (importedData.entries) {
                  importedData.entries = importedData.entries.map(e => ({
                      ...e,
                      photos: e.photos || (e.photo ? [e.photo] : []),
                      tags: e.tags || []
                  }));
              }
              setData(importedData);
              if (importedData.settings?.theme) setCurrentTheme(importedData.settings.theme);
           } else if (importedEntries.length > 0) {
              const normalizedEntries = importedEntries.map(e => ({
                  ...e,
                  photos: e.photos || (e.photo ? [e.photo] : []),
                  tags: e.tags || []
              }));
              setData(prev => ({ ...prev, entries: [...normalizedEntries, ...prev.entries] }));
           }
        }
      } catch (err) {
        alert(t('app.import_error'));
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

  const renderActionButtons = (e: Entry): React.ReactNode => {
      if (globalView === 'trash') {
          return (
              <>
                  <button onClick={(ev) => { ev.stopPropagation(); restoreEntry(e.id); }} className="p-1 hover:text-emerald-500" title={t('common.restore')}><Recycle className="w-4 h-4" /></button>
                  <button onClick={(ev) => { ev.stopPropagation(); hardDeleteEntry(e.id); }} className="p-1 hover:text-red-500" title={t('common.perm_delete')}><Trash2 className="w-4 h-4" /></button>
              </>
          );
      }
      return (
          <>
              <button onClick={(ev) => { ev.stopPropagation(); setSelectedEntry(e); }} className="p-1 hover:text-blue-500"><Eye className="w-4 h-4" /></button>
              {isAdmin && (
                  <>
                      <button onClick={(ev) => { ev.stopPropagation(); editEntry(e); }} className="p-1 hover:text-yellow-500"><PenTool className="w-4 h-4" /></button>
                      <button onClick={(ev) => { ev.stopPropagation(); softDeleteEntry(e.id); }} className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </>
              )}
          </>
      );
  };

  const renderTagCloud = () => {
      if (showTagManager) {
          return (
              <div className="space-y-6">
                  <TagManager 
                      entries={data.entries}
                      onUpdateEntries={(updatedEntries) => {
                          setSyncStatus('syncing');
                          setData(prev => ({ ...prev, entries: updatedEntries }));
                      }}
                      onBack={() => setShowTagManager(false)}
                      themeClasses={themeClasses}
                      t={t}
                  />
              </div>
          );
      }

      const tagCounts: Record<string, number> = {};
      const sourceEntries = searchQuery.startsWith('#') ? data.entries.filter(e => (!e.isPrivate || isAdmin) && !e.isTrashed) : filteredEntriesAll;

      sourceEntries.forEach(e => {
          e.tags?.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
      });

      const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

      return (
          <div className="space-y-6">
              <div className={`p-6 rounded-xl border ${themeClasses.card}`}>
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2"><Hash className="w-5 h-5 text-emerald-500" /> {t('app.cloud_tags')}</h3>
                      {isAdmin && (
                          <Button size="sm" variant="secondary" onClick={() => setShowTagManager(true)} themeClasses={themeClasses}>
                              <Edit2 className="w-4 h-4" /> {t('tags.manage_btn')}
                          </Button>
                      )}
                  </div>
                  
                  {sortedTags.length === 0 ? (
                      <p className="opacity-50 text-sm">{t('app.no_tags')}</p>
                  ) : (
                      <div className="flex flex-wrap gap-2">
                          {sortedTags.map(([tag, count]) => (
                              <button 
                                key={tag}
                                onClick={() => setSearchQuery(searchQuery === `#${tag}` ? '' : `#${tag}`)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${searchQuery === `#${tag}` ? 'bg-emerald-500 text-white' : 'bg-black/5 hover:bg-emerald-500/20 hover:text-emerald-500'}`}
                              >
                                  #{tag} <span className="opacity-50 ml-1 text-xs">{count}</span>
                              </button>
                          ))}
                      </div>
                  )}
              </div>

              {searchQuery.startsWith('#') && (
                  <div className="animate-fade-in">
                      <h4 className="font-bold mb-4 opacity-70">{t('app.entries_with_tag')} <span className="text-emerald-500">{searchQuery}</span></h4>
                      <EntryList 
                        viewMode="grid" 
                        entries={visibleEntries} 
                        onSelectEntry={setSelectedEntry}
                        renderActionButtons={renderActionButtons}
                        themeClasses={themeClasses}
                        isAdmin={isAdmin}
                        t={t}
                        gridLayout={data.settings?.gridLayout}
                        weatherPack={weatherPack} 
                        emojiStyle={emojiStyle}
                      />
                      {visibleCount < filteredEntriesAll.length && (
                          <div ref={loadMoreRef} className="h-20 flex items-center justify-center opacity-50">
                              <RefreshCw className="w-6 h-6 animate-spin" />
                          </div>
                      )}
                  </div>
              )}
          </div>
      );
  };

  const mainImage = selectedEntry ? (selectedEntry.photos && selectedEntry.photos.length > 0 ? selectedEntry.photos[0] : selectedEntry.photo) : null;
  const galleryImages = selectedEntry?.photos || (selectedEntry?.photo ? [selectedEntry.photo] : []);
  const availableMoods = Array.from(new Set(data.entries.map(e => e.mood).filter(Boolean)));

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
                        <h2 className="text-2xl font-bold">{t('app.admin_login')}</h2>
                        <p className={`text-sm mt-2 ${themeClasses.subtext}`}>{t('app.login_subtitle')}</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input 
                            themeClasses={themeClasses} 
                            type="password" 
                            value={passwordInput} 
                            onChange={(e: any) => setPasswordInput(e.target.value)} 
                            placeholder={t('app.password')} 
                            autoFocus
                        />
                        <Button type="submit" themeClasses={themeClasses} className="w-full">{t('app.login_btn')}</Button>
                    </form>
                </Card>
            </div>
        )}

        {fullscreenImage && (
            <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setFullscreenImage(null)}>
                <img src={fullscreenImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Fullscreen" />
                <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-8 h-8" /></button>
            </div>
        )}

        {showExportModal && <ExportModal onClose={() => attemptNavigation(() => setShowExportModal(false))} data={data} onImport={handleImport} themeClasses={themeClasses} currentTheme={currentTheme} t={t} />}
        {showSettingsModal && <SettingsModal onClose={() => attemptNavigation(() => setShowSettingsModal(false))} data={data} setData={setData} themeClasses={themeClasses} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} t={t} initialTab={settingsInitialTab} />}
        {showDeployModal && <DeployModal onClose={() => attemptNavigation(() => setShowDeployModal(false))} themeClasses={themeClasses} t={t} />}
        {showThemeEditor && <ThemeEditorModal onClose={() => attemptNavigation(() => setShowThemeEditor(false))} data={data} setData={setData} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} themeClasses={themeClasses} t={t} />}
        
        {showStorageMenu && <StorageDebugMenu onClose={() => attemptNavigation(() => setShowStorageMenu(false))} onSwitchMode={async (m) => {
             if(m === 'server') await StorageService.checkServerStatus(); 
             setServerMode(m === 'server');
        }} serverMode={serverMode} lastError={systemMessage} themeClasses={themeClasses} t={t} />}

        {selectedEntry && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedEntry(null)}>
                <div 
                    className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl relative shadow-2xl border ${themeClasses.bg} ${themeClasses.text} ${themeClasses.card}`} 
                    onClick={e => e.stopPropagation()}
                >
                   <div className={`sticky top-0 z-10 flex justify-between items-center p-4 border-b border-current border-opacity-10 backdrop-blur ${themeClasses.bg}/90`}>
                        <div className="flex gap-2">
                             <Button size="sm" variant="secondary" themeClasses={themeClasses} onClick={() => {
                                 const filtered = filteredEntriesAll; 
                                 const idx = filtered.findIndex(e => e.id === selectedEntry.id);
                                 if (idx !== -1 && idx < filtered.length - 1) setSelectedEntry(filtered[idx + 1]);
                             }}><ChevronLeft className="w-4 h-4" /></Button>
                             <Button size="sm" variant="secondary" themeClasses={themeClasses} onClick={() => {
                                 const filtered = filteredEntriesAll; 
                                 const idx = filtered.findIndex(e => e.id === selectedEntry.id);
                                 if (idx > 0) setSelectedEntry(filtered[idx - 1]);
                             }}><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                        <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-black/5 rounded-full"><X className="w-5 h-5" /></button>
                   </div>
                   <div className="p-6 md:p-8 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${CATEGORY_COLORS[selectedEntry.category]} text-white`}>{getCatLabel(selectedEntry.category)}</span>
                                <h2 className="text-2xl md:text-3xl font-bold leading-tight">{selectedEntry.title || selectedEntry.dateLabel}</h2>
                                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm opacity-60">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(selectedEntry.timestamp).toLocaleDateString()}</span>
                                    
                                    {(selectedEntry.location && (!selectedEntry.isLocationPrivate || isAdmin)) && (
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedEntry.location}</span>
                                    )}
                                    
                                    {selectedEntry.weather && (
                                        <span className="flex items-center gap-1">
                                            <WeatherRenderer data={selectedEntry.weather} pack={weatherPack} className="w-4 h-4" />
                                            {selectedEntry.weather.temp}°C, {selectedEntry.weather.condition}
                                        </span>
                                    )}
                                </div>
                                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {selectedEntry.tags.map(t => (
                                            <span key={t} className={`text-xs font-bold ${themeClasses.accent}`}>#{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedEntry.mood && <EmojiRenderer emoji={selectedEntry.mood} style={emojiStyle} className="text-4xl" />}
                        </div>

                        {selectedEntry.photo && (
                            <div className="rounded-xl overflow-hidden border border-current border-opacity-10">
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
                                        <div key={qId} className={`border-l-2 pl-4 py-1 ${themeClasses.card.includes('border') ? 'border-emerald-500/50' : 'border-current'}`}>
                                            <h4 className={`font-bold text-sm mb-1 ${themeClasses.accent}`}>{q.text}</h4>
                                            <p className="whitespace-pre-wrap">{ans as React.ReactNode}</p>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Habits Display in Modal */}
                        {selectedEntry.habitValues && Object.keys(selectedEntry.habitValues).length > 0 && (
                            <div className="pt-6 border-t border-current border-opacity-10">
                                <h4 className={`text-xs font-bold uppercase mb-3 flex items-center gap-2 ${themeClasses.accent}`}>
                                    <Activity className="w-3 h-3" /> {t('editor.habits_title')}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(selectedEntry.habitValues).map(([id, val]) => {
                                        // Find habit definition
                                        const habitDef = data.habits?.find(h => h.id === id);
                                        if (!habitDef || (typeof val === 'boolean' && !val)) return null;
                                        
                                        return (
                                            <div key={id} className={`px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}>
                                                {habitDef.type === 'boolean' ? <CheckCircle2 className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                                                <span>{habitDef.title}</span>
                                                {habitDef.type === 'value' && (
                                                    <span className="font-bold ml-1 bg-white/10 px-1.5 rounded">{val} {habitDef.unit}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {galleryImages.length > 0 && (
                            <div className="pt-8 border-t border-current border-opacity-10">
                                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.accent}`}><ImageIcon className="w-5 h-5" /> {t('app.photo_gallery')}</h3>
                                <div className="columns-2 md:columns-3 gap-2 space-y-2">
                                    {galleryImages.map((src, i) => (
                                        <div key={i} className="break-inside-avoid">
                                            <img 
                                                src={src} 
                                                alt={`Gallery ${i}`} 
                                                className="w-full rounded-lg border border-current border-opacity-10 hover:opacity-90 transition-opacity cursor-pointer" 
                                                onClick={() => setFullscreenImage(src)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Interactive Map at Bottom */}
                        {selectedEntry.gps && !selectedEntry.isLocationPrivate && (
                            <div className="pt-8 border-t border-current border-opacity-10">
                                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.accent}`}><MapIcon className="w-5 h-5" /> {t('nav.map')}</h3>
                                <div className="h-64 md:h-80 w-full rounded-lg overflow-hidden border border-current border-opacity-10">
                                    <AtlasView 
                                        entries={[{...selectedEntry} as Entry]} 
                                        activeCategory={activeCategory} 
                                        onSelectEntry={() => {}} 
                                        themeClasses={themeClasses} 
                                        showAll={true}
                                        emojiStyle={emojiStyle} 
                                    />
                                </div>
                            </div>
                        )}
                   </div>
                   <div className={`p-4 border-t border-current border-opacity-10 flex justify-end gap-2 ${themeClasses.bg}`}>
                       {isAdmin && (
                           <>
                               {globalView === 'trash' ? (
                                   <>
                                     <Button variant="ghost" size="sm" onClick={() => restoreEntry(selectedEntry.id)}>{t('common.restore')}</Button>
                                     <Button variant="danger" size="sm" onClick={() => hardDeleteEntry(selectedEntry.id)}>{t('common.perm_delete')}</Button>
                                   </>
                               ) : (
                                   <>
                                     <Button variant="danger" size="sm" onClick={(e) => { softDeleteEntry(selectedEntry.id); }}>{t('common.delete')}</Button>
                                     <Button variant="primary" size="sm" onClick={() => editEntry(selectedEntry)}>{t('common.edit')}</Button>
                                   </>
                               )}
                           </>
                       )}
                   </div>
                </div>
            </div>
        )}

        <Navbar 
            appName={appName}
            activeCategory={activeCategory}
            setActiveCategory={(cat) => attemptNavigation(() => { setActiveCategory(cat); setGlobalView('none'); setActiveTab('entries'); })}
            globalView={globalView}
            setGlobalView={(v) => attemptNavigation(() => setGlobalView(v))}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
            onOpenExport={() => attemptNavigation(() => setShowExportModal(true))}
            onOpenDeploy={() => attemptNavigation(() => setShowDeployModal(true))}
            onOpenSettings={(tab) => attemptNavigation(() => { setSettingsInitialTab(tab || 'account'); setShowSettingsModal(true); })}
            onOpenThemeEditor={() => attemptNavigation(() => setShowThemeEditor(true))}
            onLogout={handleLogout}
            onOpenAuth={() => setShowAuthModal(true)}
            themeClasses={themeClasses}
            showMobileMenu={showMobileMenu}
            setShowMobileMenu={setShowMobileMenu}
            t={t}
            showStats={showStats && isAdmin}
            showGamification={showGamification && isAdmin}
            currentStreak={streakInfo.current}
            logoEmoji={logoEmoji}
        />

        <main className="flex-1 max-w-6xl mx-auto w-full p-4 pb-24">
            {isAppLoading ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                    <p>{t('common.loading')}</p>
                </div>
            ) : isEditing ? (
                // Use the Component instead of inline function
                <EntryEditor 
                    entry={draftEntry}
                    onChange={handleEditorChange}
                    onSave={saveEntry}
                    onCancel={handleEditorCancel}
                    onDelete={() => softDeleteEntry(draftEntry.id)}
                    activeCategory={activeCategory}
                    questions={data.questions}
                    habits={showHabits ? (data.habits || []) : []} // Ensure habits array
                    settings={data.settings}
                    templates={data.templates}
                    onSaveTemplate={saveTemplate}
                    onDeleteTemplate={deleteTemplate}
                    onUpdateSettings={(newSettings) => setData(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }))}
                    themeClasses={themeClasses}
                    currentTheme={currentTheme}
                    serverMode={serverMode}
                    t={t}
                    currentLang={currentLang}
                    locationParts={locationParts}
                    setLocationParts={setLocationParts}
                    entries={data.entries}
                />
            ) : globalView === 'atlas' ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Globe className="w-5 h-5" /> {t('app.world_map')}</h2>
                    <AtlasView entries={visibleEntries} activeCategory={activeCategory} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} showAll={true} isAdmin={isAdmin} t={t} emojiStyle={emojiStyle} />
                </div>
            ) : globalView === 'gallery' ? (
                <div className="space-y-4">
                     <h2 className="text-xl font-bold flex items-center gap-2"><Images className="w-5 h-5" /> {t('app.photo_gallery')}</h2>
                     <GalleryView entries={visibleEntries} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} renderActionButtons={renderActionButtons} t={t} />
                     {visibleCount < filteredEntriesAll.length && (
                          <div ref={loadMoreRef} className="h-20 flex items-center justify-center opacity-50">
                              <RefreshCw className="w-6 h-6 animate-spin" />
                          </div>
                     )}
                </div>
            ) : globalView === 'stats' ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><PieChart className="w-5 h-5 text-emerald-500" /> {t('stats.title')}</h2>
                    <StatsView 
                        entries={filteredEntriesAll} 
                        themeClasses={themeClasses} 
                        t={t} 
                        savedLayout={data.settings?.statsLayout}
                        onSaveLayout={(order) => setData(prev => ({ ...prev, settings: { ...prev.settings, statsLayout: order } }))}
                        weatherPack={weatherPack}
                        emojiStyle={emojiStyle}
                    />
                </div>
            ) : globalView === 'streak' ? (
                <StreakView 
                    entries={data.entries} 
                    currentStreak={streakInfo.current} 
                    longestStreak={streakInfo.longest} 
                    themeClasses={themeClasses} 
                    t={t} 
                />
            ) : globalView === 'tags' ? (
                renderTagCloud()
            ) : globalView === 'onThisDay' ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-emerald-500" /> 
                        {t('app.on_this_day_title')} ({new Date().toLocaleDateString(currentLang === 'hu' ? 'hu-HU' : 'en-US', { month: 'long', day: 'numeric' })})
                    </h2>
                    <EntryList 
                        viewMode="grid" 
                        entries={visibleEntries}
                        onSelectEntry={setSelectedEntry}
                        renderActionButtons={renderActionButtons}
                        themeClasses={themeClasses}
                        isAdmin={isAdmin}
                        t={t}
                        gridLayout={data.settings?.gridLayout}
                        weatherPack={weatherPack} 
                        emojiStyle={emojiStyle}
                    />
                    {visibleCount < filteredEntriesAll.length && (
                          <div ref={loadMoreRef} className="h-20 flex items-center justify-center opacity-50">
                              <RefreshCw className="w-6 h-6 animate-spin" />
                          </div>
                    )}
                </div>
            ) : globalView === 'trash' ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
                            <Trash2 className="w-5 h-5" /> 
                            {t('common.trash')}
                        </h2>
                        {filteredEntriesAll.length > 0 && (
                            <Button variant="danger" size="sm" onClick={emptyTrash} themeClasses={themeClasses}>
                                <Trash2 className="w-4 h-4" /> {t('common.empty_trash_btn')}
                            </Button>
                        )}
                    </div>
                    {filteredEntriesAll.length === 0 ? (
                        <p className="text-center opacity-50 py-10">{t('common.empty_trash')}</p>
                    ) : (
                        <>
                            <EntryList 
                                viewMode="grid" 
                                entries={visibleEntries}
                                onSelectEntry={setSelectedEntry}
                                renderActionButtons={renderActionButtons}
                                themeClasses={themeClasses}
                                isAdmin={isAdmin}
                                t={t}
                                weatherPack={weatherPack} 
                                emojiStyle={emojiStyle}
                            />
                            {visibleCount < filteredEntriesAll.length && (
                                <div ref={loadMoreRef} className="h-20 flex items-center justify-center opacity-50">
                                    <RefreshCw className="w-6 h-6 animate-spin" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-4 mb-6">
                         {/* Controls Row */}
                         <div className="flex flex-wrap items-center gap-4 justify-between">
                             <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                                 {isAdmin && (
                                    <div className="flex bg-black/5 p-1 rounded-lg border border-black/5 mr-2">
                                        <button onClick={() => setActiveTab('entries')} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${activeTab === 'entries' ? themeClasses.primaryBtn : 'opacity-50 hover:opacity-100'}`}>{t('app.entries_tab')}</button>
                                        <button onClick={() => setActiveTab('questions')} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${activeTab === 'questions' ? themeClasses.primaryBtn : 'opacity-50 hover:opacity-100'}`}>{t('app.questions_tab')}</button>
                                        {/* New Habit Tab */}
                                        {showHabits && (
                                            <button onClick={() => setActiveTab('habits')} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${activeTab === 'habits' ? themeClasses.primaryBtn : 'opacity-50 hover:opacity-100'}`}>{t('nav.habits')}</button>
                                        )}
                                    </div>
                                 )}
                                 {activeTab === 'entries' && (
                                    <div className="flex bg-black/5 p-1 rounded-lg border border-black/5">
                                        <button onClick={() => handleViewModeChange('grid')} className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? themeClasses.primaryBtn : 'opacity-50 hover:opacity-100'}`} title="Grid"><Layout className="w-4 h-4" /></button>
                                        <button onClick={() => handleViewModeChange('timeline')} className={`p-1.5 rounded transition-colors ${viewMode === 'timeline' ? themeClasses.primaryBtn : 'opacity-50 hover:opacity-100'}`} title="Timeline"><List className="w-4 h-4" /></button>
                                        <button onClick={() => handleViewModeChange('calendar')} className={`p-1.5 rounded transition-colors ${viewMode === 'calendar' ? themeClasses.primaryBtn : 'opacity-50 hover:opacity-100'}`} title="Calendar"><Calendar className="w-4 h-4" /></button>
                                        <button onClick={() => handleViewModeChange('atlas')} className={`p-1.5 rounded transition-colors ${viewMode === 'atlas' ? themeClasses.primaryBtn : 'opacity-50 hover:opacity-100'}`} title="Map"><MapIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleViewModeChange('gallery')} className={`p-1.5 rounded transition-colors ${viewMode === 'gallery' ? themeClasses.primaryBtn : 'opacity-50 hover:opacity-100'}`} title="Gallery"><Images className="w-4 h-4" /></button>
                                    </div>
                                 )}
                             </div>

                             <div className="flex items-center gap-2 w-full md:w-auto">
                                 <div className="relative flex-1 md:w-64">
                                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                                     <input 
                                        className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-transparent border focus:ring-2 focus:outline-none ${themeClasses.input}`}
                                        placeholder={t('common.search')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                     />
                                 </div>
                                 <button 
                                    onClick={() => setShowFilters(!showFilters)} 
                                    className={`p-2 rounded-lg border transition-all ${showFilters ? themeClasses.accent + ' bg-black/5 border-current' : 'border-transparent bg-black/5 hover:bg-black/10'}`}
                                    title={t('filters.title')}
                                 >
                                    <Filter className="w-5 h-5" />
                                 </button>
                             </div>
                         </div>

                         {/* Intelligent Filters Panel */}
                         {showFilters && (
                             <div className={`p-4 rounded-lg border animate-fade-in grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${themeClasses.card}`}>
                                 <div className="flex flex-col gap-1">
                                     <label className={`text-[10px] font-bold uppercase ${themeClasses.subtext}`}>{t('filters.date_start')}</label>
                                     <Input type="date" themeClasses={themeClasses} value={filterStart} onChange={(e: any) => setFilterStart(e.target.value)} />
                                 </div>
                                 <div className="flex flex-col gap-1">
                                     <label className={`text-[10px] font-bold uppercase ${themeClasses.subtext}`}>{t('filters.date_end')}</label>
                                     <Input type="date" themeClasses={themeClasses} value={filterEnd} onChange={(e: any) => setFilterEnd(e.target.value)} />
                                 </div>
                                 <div className="flex flex-col gap-1">
                                     <label className={`text-[10px] font-bold uppercase ${themeClasses.subtext}`}>{t('filters.mood')}</label>
                                     <select 
                                        className={`w-full rounded-lg px-4 py-2 border bg-transparent focus:outline-none ${themeClasses.input}`}
                                        value={filterMood}
                                        onChange={(e) => setFilterMood(e.target.value)}
                                     >
                                         <option value="">-</option>
                                         {availableMoods.map(m => (
                                             <option key={m} value={m}>{m}</option>
                                         ))}
                                     </select>
                                 </div>
                                 <div className="flex items-end gap-2">
                                     <button 
                                        onClick={() => setFilterHasPhoto(!filterHasPhoto)}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 ${filterHasPhoto ? themeClasses.accent + ' border-current' : 'border-transparent bg-black/5'}`}
                                     >
                                         <ImageIcon className="w-4 h-4" /> {t('filters.has_photo')}
                                     </button>
                                     <button 
                                        onClick={() => { setFilterStart(""); setFilterEnd(""); setFilterMood(""); setFilterHasPhoto(false); setSearchQuery(""); }}
                                        className="p-2 rounded-lg bg-black/5 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                        title={t('filters.clear')}
                                     >
                                         <X className="w-4 h-4" />
                                     </button>
                                 </div>
                             </div>
                         )}
                    </div>

                    {activeTab === 'questions' ? (
                        <QuestionManager 
                            questions={data.questions} 
                            activeCategory={activeCategory} 
                            onAdd={(txt, subCat) => setData(p => ({...p, questions: [...p.questions, {id:crypto.randomUUID(), text:txt, category:activeCategory, subCategory: subCat, isActive:true}]}))} 
                            onToggle={(id) => setData(p => ({...p, questions: p.questions.map(q => q.id===id?{...q,isActive:!q.isActive}:q)}))} 
                            onDelete={(id) => setData(p => ({...p, questions: p.questions.filter(q => q.id!==id)}))} 
                            themeClasses={themeClasses}
                            t={t} 
                        />
                    ) : activeTab === 'habits' ? (
                        <HabitManager 
                            habits={data.habits || []}
                            activeCategory={activeCategory}
                            onAdd={(newHabit) => setData(p => ({...p, habits: [...(p.habits || []), newHabit]}))}
                            onEdit={(updated) => setData(p => ({...p, habits: (p.habits || []).map(h => h.id === updated.id ? updated : h)}))}
                            onToggle={(id) => setData(p => ({...p, habits: (p.habits || []).map(h => h.id===id ? {...h, isActive: !h.isActive} : h)}))}
                            onDelete={(id) => setData(p => ({...p, habits: (p.habits || []).filter(h => h.id !== id)}))}
                            themeClasses={themeClasses}
                            t={t}
                        />
                    ) : (
                        <div className="animate-fade-in">
                            {(viewMode === 'grid' || viewMode === 'timeline') && (
                                <>
                                    <EntryList 
                                        viewMode={viewMode}
                                        entries={visibleEntries}
                                        onSelectEntry={setSelectedEntry}
                                        renderActionButtons={renderActionButtons}
                                        themeClasses={themeClasses}
                                        isAdmin={isAdmin}
                                        t={t}
                                        gridLayout={data.settings?.gridLayout}
                                        weatherPack={weatherPack} 
                                        emojiStyle={emojiStyle}
                                    />
                                    {/* Sentinel for Infinite Scroll */}
                                    {visibleCount < filteredEntriesAll.length && (
                                        <div ref={loadMoreRef} className="h-20 flex items-center justify-center opacity-50">
                                            <RefreshCw className="w-6 h-6 animate-spin" />
                                        </div>
                                    )}
                                </>
                            )}

                            {viewMode === 'atlas' && (
                                <AtlasView entries={visibleEntries} activeCategory={activeCategory} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} showAll={true} isAdmin={isAdmin} t={t} emojiStyle={emojiStyle} />
                            )}
                            
                            {viewMode === 'gallery' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2"><Images className="w-5 h-5" /> {t('app.photo_gallery')}</h2>
                                    <GalleryView entries={visibleEntries} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} renderActionButtons={renderActionButtons} t={t} />
                                    {/* Sentinel for Infinite Scroll */}
                                    {visibleCount < filteredEntriesAll.length && (
                                        <div ref={loadMoreRef} className="h-20 flex items-center justify-center opacity-50">
                                            <RefreshCw className="w-6 h-6 animate-spin" />
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {viewMode === 'calendar' && (
                                <CalendarView 
                                    entries={filteredEntriesAll} // Calendar needs all for navigation, no infinite scroll
                                    currentDate={calendarDate} 
                                    onDateChange={setCalendarDate} 
                                    onSelectEntry={setSelectedEntry} 
                                    themeClasses={themeClasses}
                                    t={t}
                                />
                            )}
                        </div>
                    )}
                </>
            )}
        </main>

        {isAdmin && !isEditing && globalView !== 'trash' && globalView !== 'streak' && globalView !== 'stats' && (
            <button 
                onClick={startNewEntry}
                className="fixed bottom-8 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-50"
                title={t('app.new_entry')}
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
                cloudEnabled={false}
                onOpenDebug={() => attemptNavigation(() => setShowStorageMenu(true))}
                t={t}
            />
        )}
    </div>
  );
}
