
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Book, Lock, Unlock, PenTool, Download, Upload, 
  Plus, Trash2, Save, X, ChevronRight, Layout, RefreshCw,
  Image as ImageIcon, Cloud, Calendar, List, Grid as GridIcon,
  Smile, Settings, Info, Server, MapPin, Eye, EyeOff, Palette, Search, ChevronLeft, Map as MapIcon,
  ThermometerSun, Menu, Code, LogOut, CheckCircle2, AlertCircle, CloudLightning, HardDrive, CalendarClock,
  Wifi, WifiOff, Database, Activity, ChevronUp, Terminal, Copy, FileText, FileCode, User as UserIcon,
  Globe, Images, Layers, Shield, ShieldAlert, Clock, Bold, Italic, Underline, Link as LinkIcon, AlignLeft,
  Trophy, PieChart, Dices,
  Droplets, Moon, Sun, DollarSign, Briefcase, Heart, Brain, Music, Leaf, Coffee, Utensils, Zap, Award, Target, Flag, Bike, Dumbbell, Footprints, Bed, ShowerHead, Timer, Watch, Smartphone, Laptop, Gamepad2, ShoppingCart, Home, Car, Plane, Brush, Camera, Headphones, Gift, Star, Frown, Users, Phone, Mail, Edit2, Hash
} from 'lucide-react';
import { AppData, Category, Entry, WeatherData, ThemeOption, CloudConfig, CategoryConfig, PublicConfig, WeatherIconPack, EmojiStyle } from './types';
import { CATEGORY_LABELS, DEMO_PASSWORD, INITIAL_DATA, DEFAULT_QUESTIONS, CATEGORY_COLORS, CATEGORY_BORDER_COLORS } from './constants';
import * as StorageService from './services/storage';
import { getTranslation } from './services/i18n';
import { THEMES, getHolidayTheme, HOLIDAY_THEMES, generateCustomTheme } from './constants/theme';
import { stringToColor, stringToBgColor } from './utils/colors';

// Components
import Navbar from './components/layout/Navbar';
import StatusBar from './components/layout/StatusBar';
import DashboardView from './components/views/DashboardView';
import EntryList from './components/views/EntryList';
import CalendarView from './components/views/CalendarView';
import AtlasView from './components/views/AtlasView';
import GalleryView from './components/views/GalleryView';
import StatsView from './components/views/StatsView';
import StreakView from './components/views/StreakView';
import TagManager from './components/views/TagManager';
import QuestionManager from './components/views/QuestionManager';
import HabitManager from './components/views/HabitManager';
import EntryEditor from './components/forms/EntryEditor';
import { Button, Card, Input } from './components/ui';
import WeatherRenderer from './components/ui/WeatherRenderer'; 
import EmojiRenderer from './components/ui/EmojiRenderer';

// Modals
import SettingsModal from './components/modals/SettingsModal';
import ExportModal from './components/modals/ExportModal';
import DeployModal from './components/modals/DeployModal';
import StorageDebugMenu from './components/modals/StorageDebugMenu';
import ThemeEditorModal from './components/modals/ThemeEditorModal';

// Helper for Icon Rendering
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    const iconMap: Record<string, any> = {
        Activity, Book, Droplets, Moon, Sun, DollarSign, Briefcase, Heart, Brain, Music, PenTool, Code, Leaf, Coffee, Utensils, Zap, Award, Target, Flag, Bike, Dumbbell, Footprints, Bed, ShowerHead, Timer, Watch, Smartphone, Laptop, Gamepad2, ShoppingCart, Home, Car, Plane, Brush, Camera, Headphones, Gift, Star, Smile, Frown, Users, Phone, Mail
    };
    const IconComponent = iconMap[name] || Activity;
    return <IconComponent className={className} />;
};

export default function App() {
  // Load data synchronously to prevent layout/font flash
  const [data, setData] = useState<AppData>(() => {
      const local = StorageService.loadData();
      if (local) {
          return {
              ...INITIAL_DATA,
              ...local,
              settings: { ...INITIAL_DATA.settings, ...(local.settings || {}) },
              questions: local.questions || INITIAL_DATA.questions
          };
      }
      return INITIAL_DATA;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      if (data.users && data.users.length > 0) return data.users[0];
      return null;
  });

  const [activeCategory, setActiveCategory] = useState<Category>(Category.DAILY);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(() => {
      // Try to get theme from loaded data
      const local = StorageService.loadData();
      return local?.settings?.theme || 'dark';
  });
  const [themeClasses, setThemeClasses] = useState(THEMES.dark);
  const [logoEmoji, setLogoEmoji] = useState<string | null>(null);
  const [holidayName, setHolidayName] = useState<string | null>(null);

  const [serverMode, setServerMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success' | 'auto_syncing' | 'auto_success'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [showStorageMenu, setShowStorageMenu] = useState(false);
  
  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'views' | 'public' | 'account' | 'about' | 'data' | 'layout'>('account');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Views
  const [globalView, setGlobalView] = useState<'dashboard' | 'none' | 'atlas' | 'gallery' | 'tags' | 'onThisDay' | 'trash' | 'stats' | 'streak'>('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'calendar' | 'atlas' | 'gallery'>('grid');
  const [activeTab, setActiveTab] = useState<'entries' | 'questions' | 'habits'>('entries');
  
  // State
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null); 
  const [passwordInput, setPasswordInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<Entry>>({});
  const [locationParts, setLocationParts] = useState<string[]>([]);
  
  // Refs
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  // Helpers
  const t = (key: string, params?: any) => {
      let str = getTranslation(data.settings?.language || 'hu', key);
      if (params) {
          Object.keys(params).forEach(k => {
              str = str.replace(`{${k}}`, params[k]);
          });
      }
      return str;
  };

  const weatherPack: WeatherIconPack = data.settings?.weatherIconPack || 'outline';
  const emojiStyle: EmojiStyle = data.settings?.emojiStyle || 'native';
  const showHabits = data.settings?.enableHabits !== false;

  // New: Greeting logic
  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 5) return "";
      if (hour < 10) return t('common.good_morning');
      if (hour < 18) return t('common.good_afternoon');
      return t('common.good_evening');
  };

  // --- Initialization ---
  useEffect(() => {
    const init = async () => {
        setIsAppLoading(true);
        const local = StorageService.loadData();
        
        // Theme is already initialized in useState
        
        // Restore Auth
        if (StorageService.checkAuthSession()) {
            setIsAdmin(true);
        }

        const status = await StorageService.checkServerStatus();
        if (status.online) {
            setServerMode(true);
            setSyncStatus('syncing');
            const serverData = await StorageService.serverLoad();
            if (serverData) {
                setData(serverData);
                setSyncStatus('success');
                setLastSyncTime(Date.now());
                setSystemMessage("");
                setIsAppLoading(false);
            } else {
                setSystemMessage(t('server.empty_response'));
                setData(local);
                setIsAppLoading(false);
            }
        } else {
             // Cloud Check
             if (local.settings?.cloud?.enabled && local.settings.cloud.url) {
                 setSyncStatus('syncing');
                 try {
                     const cloudData = await StorageService.cloudLoad(local.settings.cloud);
                     if (cloudData) {
                         setData(cloudData); // Source of truth
                         setSyncStatus('success');
                         setLastSyncTime(Date.now());
                     } else {
                         setData(local);
                     }
                 } catch (e) {
                     setSystemMessage(t('server.network_error'));
                     setData(local);
                 }
             } else {
                 setData(local);
             }
             setIsAppLoading(false);
        }

        // Setup Auto Sync
        StorageService.setupBackgroundSync(
            () => setSyncStatus('auto_syncing'),
            (success) => setSyncStatus(success ? 'auto_success' : 'error')
        );
    };
    init();
  }, []);

  // --- Data Saving ---
  useEffect(() => {
      if (isAdmin) {
          StorageService.saveData(data);
      }
      
      if(isAppLoading) return;
      
      if (serverMode && isAdmin) {
          const timeout = setTimeout(() => {
              setSyncStatus('auto_syncing');
              StorageService.serverSave(data)
                  .then(() => {
                      setSyncStatus('auto_success');
                      setLastSyncTime(Date.now());
                      setSystemMessage("");
                  })
                  .catch(() => setSyncStatus('error'));
          }, 2000);
          return () => clearTimeout(timeout);
      }
  }, [data, serverMode, isAppLoading, isAdmin]);

  // --- Theme Handling ---
  useEffect(() => {
      // 1. Holiday Check
      const holiday = getHolidayTheme(new Date());
      let classes = THEMES.dark;
      let activeEmoji = null;
      let activeName = null;

      // Forced Holiday from settings
      if (data.settings?.activeHoliday) {
          const h = HOLIDAY_THEMES.find(x => x.id === data.settings?.activeHoliday);
          if (h) {
              classes = h.colors;
              activeEmoji = h.emoji;
              activeName = h.name;
              document.title = `${h.emoji} ${data.settings?.userName || 'ReaLog'}`;
          }
      } 
      // Automatic Holiday
      else if (holiday) {
          classes = holiday.colors;
          activeEmoji = holiday.emoji;
          activeName = holiday.name;
          document.title = `${holiday.emoji} ${data.settings?.userName || 'ReaLog'}`;
      }
      // Standard Themes
      else if (currentTheme === 'system') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          classes = isDark ? THEMES.dark : THEMES.light;
      }
      else if (currentTheme === 'custom' && data.settings?.customTheme) {
          const c = data.settings.customTheme;
          classes = generateCustomTheme(c.base, c.accent as any, c.customBg);
      }
      else if (THEMES[currentTheme]) {
          classes = THEMES[currentTheme];
      }

      setThemeClasses(classes);
      setLogoEmoji(activeEmoji);
      setHolidayName(activeName);
      
      document.body.className = classes.bg;
      
      // Inject Fonts (unchanged)
      const fontConfig = data.settings?.typography;
      if (fontConfig) {
          document.body.style.fontFamily = fontConfig.fontFamily === 'Custom' ? `'${fontConfig.customFontName}', sans-serif` : `'${fontConfig.fontFamily}', sans-serif`;
          document.body.style.fontSize = `${fontConfig.fontSize}px`;
          
          if (fontConfig.fontFamily === 'Custom' && fontConfig.customFontData) {
              const styleId = 'custom-font-style';
              let styleTag = document.getElementById(styleId);
              if (!styleTag) {
                  styleTag = document.createElement('style');
                  styleTag.id = styleId;
                  document.head.appendChild(styleTag);
              }
              const src = fontConfig.customFontData.startsWith('data:') 
                  ? `url('${fontConfig.customFontData}')` 
                  : `url('${StorageService.getApiUrl(fontConfig.customFontData)}')`;
              
              styleTag.textContent = `
                  @font_face {
                      font-family: '${fontConfig.customFontName}';
                      src: ${src} format('woff2');
                      font-weight: normal;
                      font-style: normal;
                  }
              `;
          }
      } else {
          document.body.style.fontFamily = '';
          document.body.style.fontSize = '';
      }

  }, [currentTheme, data.settings?.customTheme, data.settings?.activeHoliday, data.settings?.typography]);

  // --- Global Hotkeys ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // Ctrl+S to save (if editing)
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault();
              if (isEditing) {
                  saveEntry();
              }
          }
          // Esc to close modal/editor
          if (e.key === 'Escape') {
              if (selectedEntry) setSelectedEntry(null);
              else if (isEditing && confirm(t('common.confirm_discard_changes'))) setIsEditing(false);
              else if (showSettingsModal) setShowSettingsModal(false);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, currentEntry, selectedEntry, showSettingsModal]);

  // --- Handlers --- (Same as previous + new ones)

  const handleStorageModeSwitch = async (mode: 'server' | 'local') => {
      if (mode === 'server') {
          const status = await StorageService.checkServerStatus();
          if (!status.online) throw new Error(status.message);
          setServerMode(true);
          const sData = await StorageService.serverLoad();
          if (sData) setData(prev => ({...sData, settings: {...prev.settings, ...sData.settings}}));
      } else {
          setServerMode(false);
      }
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const currentPassword = data.settings?.adminPassword || DEMO_PASSWORD;
      if (passwordInput === currentPassword) {
          setIsAdmin(true);
          setShowAuthModal(false);
          setPasswordInput("");
          StorageService.saveAuthSession();
      } else {
          alert(t('app.wrong_password'));
      }
  };

  const handleLogout = () => {
      setIsAdmin(false);
      setIsEditing(false);
      setActiveTab('entries');
      StorageService.clearAuthSession();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      try {
          if (file.name.endsWith('.xml') || file.name.endsWith('.wxr')) {
              const importedEntries = await StorageService.importFromWxr(file);
              if (confirm(t('app.import_confirm'))) {
                  setData(prev => ({
                      ...prev,
                      entries: [...prev.entries, ...importedEntries]
                  }));
              }
          } else {
              const importedData = await StorageService.importFromJson(file);
              if (confirm(t('app.import_confirm'))) {
                  setData(importedData);
              }
          }
      } catch (err) {
          alert(t('app.import_error'));
      }
  };

  const startNewEntry = () => {
      const today = new Date();
      let label = today.toISOString().slice(0, 10);
      if (activeCategory === Category.WEEKLY) label = `${today.getFullYear()} W${Math.ceil((today.getDate() + 6 - today.getDay()) / 7)}`;
      if (activeCategory === Category.MONTHLY) label = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
      if (activeCategory === Category.YEARLY) label = `${today.getFullYear()}`;

      // Initialize responses based on priority: Default Template -> Active Questions -> Random 4
      let selectedQuestions: typeof data.questions = [];

      // 1. Try Default Template
      const defaultTemplate = data.templates?.find(t => t.category === activeCategory && t.isDefault);
      if (defaultTemplate) {
          selectedQuestions = data.questions.filter(q =>
              q.category === activeCategory && defaultTemplate.questions.includes(q.text)
          );
      }

      // 2. If no template applied, try Active Questions
      if (selectedQuestions.length === 0) {
          selectedQuestions = data.questions.filter(q => q.category === activeCategory && q.isActive);
      }

      // 3. Fallback: Random 4
      if (selectedQuestions.length === 0) {
          const allCategoryQuestions = data.questions.filter(q => q.category === activeCategory);
          if (allCategoryQuestions.length > 0) {
              const shuffled = [...allCategoryQuestions].sort(() => 0.5 - Math.random());
              selectedQuestions = shuffled.slice(0, 4);
          }
      }

      const initialResponses: Record<string, string> = {};
      selectedQuestions.forEach(q => initialResponses[q.id] = "");

      setCurrentEntry({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          category: activeCategory,
          dateLabel: label,
          title: '',
          responses: initialResponses, // Populate initial responses
          habitValues: {},
          entryMode: 'structured',
          freeTextContent: '',
          isPrivate: false,
          isDraft: true // Start as draft
      });
      setLocationParts([]);
      setIsEditing(true);
      setShowMobileMenu(false);
  };

  const saveEntry = () => {
      if (!currentEntry.id) return;
      const newEntry = { ...currentEntry, isDraft: false } as Entry;
      if (!newEntry.title?.trim()) newEntry.title = newEntry.dateLabel;
      
      setData(prev => ({
          ...prev,
          entries: [newEntry, ...prev.entries.filter(e => e.id !== newEntry.id)]
      }));
      setIsEditing(false);
      setCurrentEntry({});
      setLocationParts([]);
  };

  const deleteEntry = (id: string) => {
      if (globalView === 'trash') {
          if (confirm(t('common.confirm_perm_delete'))) {
              setData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
          }
      } else {
          if (confirm(t('common.confirm_delete'))) {
              setData(prev => ({ 
                  ...prev, 
                  entries: prev.entries.map(e => e.id === id ? { ...e, isTrashed: true } : e) 
              }));
          }
      }
      setSelectedEntry(null);
  };

  const restoreEntry = (id: string) => {
      setData(prev => ({ 
          ...prev, 
          entries: prev.entries.map(e => e.id === id ? { ...e, isTrashed: false } : e) 
      }));
  };

  const emptyTrash = () => {
      if (confirm(t('common.confirm_empty_trash'))) {
          setData(prev => ({
              ...prev,
              entries: prev.entries.filter(e => !e.isTrashed)
          }));
      }
  };

  // New Features Handlers
  const duplicateEntry = (e: Entry) => {
      const newEntry: Partial<Entry> = {
          ...e,
          id: crypto.randomUUID(),
          timestamp: Date.now(), // Set to now for the new copy
          dateLabel: new Date().toISOString().slice(0, 10), // Update label to today
          isDraft: true,
          title: `${e.title || e.dateLabel} (Másolat)`
      };
      setCurrentEntry(newEntry);
      setLocationParts(e.location ? e.location.split(', ') : []);
      setIsEditing(true);
      setSelectedEntry(null);
  };

  const pickRandomEntry = () => {
      const validEntries = data.entries.filter(e => !e.isTrashed && (!e.isPrivate || isAdmin));
      if (validEntries.length === 0) return;
      const random = validEntries[Math.floor(Math.random() * validEntries.length)];
      setSelectedEntry(random);
  };

  const toggleFavorite = (id: string) => {
      setData(prev => ({
          ...prev,
          entries: prev.entries.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e)
      }));
  };

  const handleViewModeChange = (mode: any) => {
      setViewMode(mode);
      setData(prev => ({
          ...prev,
          settings: {
              ...prev.settings,
              categoryConfigs: {
                  ...prev.settings?.categoryConfigs,
                  [activeCategory]: {
                      ...(prev.settings?.categoryConfigs?.[activeCategory] || { viewMode: 'grid' }),
                      viewMode: mode
                  }
              }
          }
      }));
  };

  // NEW: Single Active Question Logic
  const toggleQuestionStatus = (id: string) => {
      setData(prev => {
          const targetQ = prev.questions.find(q => q.id === id);
          if (!targetQ) return prev;

          // If turning ON, disable others in same category
          const shouldBeActive = !targetQ.isActive;
          
          return {
              ...prev,
              questions: prev.questions.map(q => {
                  if (q.id === id) return { ...q, isActive: shouldBeActive };
                  if (shouldBeActive && q.category === targetQ.category) {
                      return { ...q, isActive: false };
                  }
                  return q;
              })
          };
      });
  };

  // --- Filtering ---
  const filteredEntriesAll = useMemo(() => {
      let entries = data.entries;
      
      if (globalView === 'trash') {
          return entries.filter(e => e.isTrashed);
      } else {
          entries = entries.filter(e => !e.isTrashed);
      }

      if (!isAdmin) {
          entries = entries.filter(e => !e.isPrivate);
      }

      // Filter by user for standard views (keep "old way")
      if (currentUser && globalView !== 'dashboard') {
          entries = entries.filter(e => e.userId === currentUser.id);
      }

      if (globalView === 'atlas' || globalView === 'gallery') {
          // No category filter
      } else if (globalView === 'onThisDay') {
          const today = new Date();
          const md = `${today.getMonth()+1}-${today.getDate()}`;
          entries = entries.filter(e => {
              const d = new Date(e.timestamp);
              return `${d.getMonth()+1}-${d.getDate()}` === md;
          });
      } else if (globalView === 'tags' || globalView === 'stats' || globalView === 'streak') {
          // pass
      } else {
          const config = data.settings?.categoryConfigs?.[activeCategory];
          const allowed = [activeCategory];
          if (config?.includeDaily) allowed.push(Category.DAILY);
          if (config?.includeWeekly) allowed.push(Category.WEEKLY);
          if (config?.includeMonthly) allowed.push(Category.MONTHLY);
          entries = entries.filter(e => allowed.includes(e.category));
      }

      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          entries = entries.filter(e => 
              e.title?.toLowerCase().includes(q) ||
              e.location?.toLowerCase().includes(q) ||
              e.tags?.some(t => t.toLowerCase().includes(q) || `#${t.toLowerCase()}`.includes(q)) ||
              e.freeTextContent?.toLowerCase().includes(q) ||
              Object.values(e.responses).some((r: any) => typeof r === 'string' && r.toLowerCase().includes(q))
          );
      }

      return entries.sort((a, b) => b.timestamp - a.timestamp);
  }, [data.entries, activeCategory, globalView, searchQuery, isAdmin, data.settings, currentUser]);

  // On This Day Logic for Dashboard Card
  const onThisDayEntries = useMemo(() => {
        if (globalView !== 'none') return [];
        const today = new Date();
        const md = `${today.getMonth()+1}-${today.getDate()}`;
        // Filter entries from previous years on this day
        return data.entries.filter(e => {
            const d = new Date(e.timestamp);
            return `${d.getMonth()+1}-${d.getDate()}` === md && d.getFullYear() !== today.getFullYear() && !e.isTrashed && (!e.isPrivate || isAdmin);
        }).sort((a,b) => b.timestamp - a.timestamp);
  }, [data.entries, globalView, isAdmin]);

  const visibleEntries = filteredEntriesAll.slice(0, visibleCount);

  // --- Action Buttons Renderer for List/Gallery ---
  const renderActionButtons = (e: Entry) => (
      <>
          <button 
            onClick={(ev) => { ev.stopPropagation(); toggleFavorite(e.id); }} 
            className={`p-1 hover:text-yellow-500 transition-colors ${e.isFavorite ? 'text-yellow-500' : 'text-current opacity-30 hover:opacity-100'}`}
            title={t('common.favorite')}
          >
              <Star className={`w-4 h-4 ${e.isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          {isAdmin && (
              <>
                  <button onClick={(ev) => { ev.stopPropagation(); duplicateEntry(e); }} className="p-1 hover:text-blue-500 opacity-50 hover:opacity-100" title={t('common.copy')}>
                      <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => { 
                       setCurrentEntry(e); 
                       setLocationParts(e.location ? e.location.split(', ') : []);
                       setIsEditing(true); 
                       setSelectedEntry(null); 
                    }} className="p-1 hover:text-emerald-500 opacity-50 hover:opacity-100" title={t('common.edit')}>
                      <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteEntry(e.id)} className="p-1 hover:text-red-500 opacity-50 hover:opacity-100" title={t('common.delete')}>
                      <Trash2 className="w-4 h-4" />
                  </button>
              </>
          )}
      </>
  );

  // --- Dynamic Modal Renderers ---
  const renderHeader = (e: Entry) => (
      <div className="mb-6">
          <div className="flex justify-between items-start gap-4">
              <div>
                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${themeClasses.primaryBtn} text-white`}>
                      {t(`category.${e.category.toLowerCase()}`)}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight flex items-center gap-2">
                      {e.title || e.dateLabel}
                      {e.isFavorite && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                  </h2>
              </div>
              {e.mood && (
                  <div className="text-4xl leading-none">
                      <EmojiRenderer emoji={e.mood} style={emojiStyle} />
                  </div>
              )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm opacity-60 border-t border-white/10 pt-4">
              <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> 
                  {new Date(e.timestamp).toLocaleDateString()}
              </span>
              {e.location && (
                  <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> 
                      {e.location}
                  </span>
              )}
              {e.weather && (
                  <span className="flex items-center gap-1">
                      <WeatherRenderer data={e.weather} pack={weatherPack} className="w-4 h-4" /> 
                      {e.weather.temp}°C, {e.weather.condition.startsWith('wmo_') ? t('weather.' + e.weather.condition) : e.weather.condition}
                  </span>
              )}
          </div>
      </div>
  );

  const renderMood = (e: Entry) => null; 

  const renderTags = (e: Entry) => (
      e.tags && e.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
              {e.tags.map(tag => {
                  const isDarkTheme = themeClasses.bg.includes('black') || themeClasses.bg.includes('9') || themeClasses.bg.includes('dark');
                  return (
                    <button
                        key={tag}
                        onClick={() => { setSearchQuery(`#${tag}`); setSelectedEntry(null); }}
                        className={`text-xs font-bold px-2 py-1 rounded transition-transform hover:scale-105`}
                        style={{
                            backgroundColor: stringToBgColor(tag, isDarkTheme ? 'dark' : 'light'),
                            color: stringToColor(tag, isDarkTheme ? 'dark' : 'light')
                        }}
                    >
                        #{tag}
                    </button>
                  );
              })}
          </div>
      ) : null
  );

  const renderContent = (e: Entry) => (
      <div className="space-y-6 text-lg leading-relaxed opacity-90 mb-6">
          {e.entryMode === 'free' ? (
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: e.freeTextContent || '' }} />
          ) : (
              Object.entries(e.responses).map(([qId, ans]) => {
                  const q = data.questions.find(qx => qx.id === qId);
                  if (!q || !ans) return null;
                  return (
                      <div key={qId} className="border-l-2 border-emerald-500/50 pl-4 py-1">
                          <h4 className="font-bold text-sm text-emerald-500 mb-1">{q.text}</h4>
                          <div dangerouslySetInnerHTML={{ __html: ans }} />
                      </div>
                  )
              })
          )}
      </div>
  );

  const renderHabits = (e: Entry) => (
      e.habitValues && Object.keys(e.habitValues).length > 0 ? (
          <div className="pt-4 border-t border-current border-opacity-10 mb-6">
              <h4 className={`text-xs font-bold uppercase mb-3 flex items-center gap-2 ${themeClasses.accent}`}>
                  <Activity className="w-3 h-3" /> {t('editor.habits_title')}
              </h4>
              <div className="flex flex-wrap gap-2">
                  {Object.entries(e.habitValues).map(([id, val]) => {
                      const habitDef = data.habits?.find(h => h.id === id);
                      if (!habitDef || (typeof val === 'boolean' && !val)) return null;
                      
                      const IconComp = habitDef?.icon 
                          ? <DynamicIcon name={habitDef.icon} className="w-4 h-4" /> 
                          : (habitDef?.type === 'boolean' ? <CheckCircle2 className="w-4 h-4" /> : <Hash className="w-4 h-4" />);

                      return (
                          <div key={id} className={`px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}>
                              {IconComp}
                              <span>{habitDef?.title}</span>
                              {habitDef?.type === 'value' && (
                                  <span className="font-bold ml-1 bg-white/10 px-1.5 rounded">{val} {habitDef.unit}</span>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>
      ) : null
  );

  const renderGallery = (e: Entry) => {
      const photos = e.photos || (e.photo ? [e.photo] : []);
      if (photos.length === 0) return null;
      return (
          <div className="pt-4 border-t border-current border-opacity-10 mb-6">
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.accent}`}><Images className="w-5 h-5" /> {t('app.photo_gallery')}</h3>
              <div className="columns-2 md:columns-3 gap-2 space-y-2">
                  {photos.map((p, i) => (
                      <div key={i} className="break-inside-avoid">
                          <img src={p} className="w-full h-auto rounded-lg border border-white/10" alt="Entry" />
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const renderMap = (e: Entry) => {
      if (!e.gps) return null;
      
      const sizeMap = {
          small: 'h-32',
          medium: 'h-64',
          large: 'h-96'
      };
      
      const heightClass = sizeMap[data.settings?.entryMapSize || 'medium'];

      return (
          <div className={`w-full rounded-xl overflow-hidden border border-white/10 mb-6 relative ${heightClass}`}>
              <div className="absolute inset-0">
                  <AtlasView 
                      entries={[{...e} as Entry]} 
                      activeCategory={activeCategory} 
                      onSelectEntry={() => {}} 
                      themeClasses={themeClasses} 
                      showAll={true} 
                      emojiStyle={emojiStyle} 
                      fixPosition={true}
                  />
              </div>
          </div>
      );
  }

  const getLayout = () => {
      const base = data.settings?.entryModalLayout || ['header', 'mood', 'tags', 'content', 'habits', 'gallery'];
      if (!base.includes('map')) base.push('map');
      return base;
  };

  // --- Render ---
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text} selection:bg-emerald-500/30 flex flex-col`}>
        {/* Modals */}
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

        {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} data={data} onImport={handleImport} themeClasses={themeClasses} currentTheme={currentTheme} t={t} />}
        {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} data={data} setData={setData} themeClasses={themeClasses} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} t={t} initialTab={settingsTab} />}
        {showDeployModal && <DeployModal onClose={() => setShowDeployModal(false)} themeClasses={themeClasses} t={t} />}
        {showThemeEditor && <ThemeEditorModal onClose={() => setShowThemeEditor(false)} data={data} setData={setData} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} themeClasses={themeClasses} t={t} />}
        {showStorageMenu && <StorageDebugMenu onClose={() => setShowStorageMenu(false)} onSwitchMode={handleStorageModeSwitch} serverMode={serverMode} cloudConfig={data.settings?.cloud} lastError={systemMessage} themeClasses={themeClasses} t={t} />}

        {/* Selected Entry Modal */}
        {selectedEntry && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedEntry(null)}>
                {/* Use themeClasses.card and themeClasses.bg to style the modal */}
                <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl relative shadow-2xl border ${themeClasses.card} ${themeClasses.bg}`} onClick={e => e.stopPropagation()}>
                   {/* Modal Header Controls */}
                   <div className={`sticky top-0 z-10 flex justify-between items-center p-4 border-b border-white/10 backdrop-blur ${themeClasses.bg}/90`}>
                        <div className="flex gap-2">
                             <Button size="sm" variant="secondary" onClick={() => { /* Modal Nav Prev */ }}><ChevronLeft className="w-4 h-4" /></Button>
                             <Button size="sm" variant="secondary" onClick={() => { /* Modal Nav Next */ }}><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                        <div className="flex gap-2">
                            {isAdmin && (
                                <button onClick={() => toggleFavorite(selectedEntry.id)} className={`p-2 rounded-full transition-colors ${selectedEntry.isFavorite ? 'text-yellow-500' : 'text-white/30 hover:text-white'}`}>
                                    <Star className={`w-5 h-5 ${selectedEntry.isFavorite ? 'fill-current' : ''}`} />
                                </button>
                            )}
                            <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                   </div>
                   
                   <div className="p-6 md:p-8">
                        {getLayout().map(part => {
                            let content = null;
                            switch(part) {
                                case 'header': content = renderHeader(selectedEntry); break;
                                case 'mood': content = renderMood(selectedEntry); break;
                                case 'tags': content = renderTags(selectedEntry); break;
                                case 'content': content = renderContent(selectedEntry); break;
                                case 'habits': content = renderHabits(selectedEntry); break;
                                case 'gallery': content = renderGallery(selectedEntry); break;
                                case 'map': content = renderMap(selectedEntry); break;
                            }
                            return content ? <React.Fragment key={part}>{content}</React.Fragment> : null;
                        })}
                   </div>

                   <div className="p-4 border-t border-white/10 bg-black/5 flex justify-end gap-2 sticky bottom-0 z-10">
                       {isAdmin && (
                           <>
                               <Button variant="secondary" size="sm" onClick={() => { duplicateEntry(selectedEntry); }}>{t('common.copy')}</Button>
                               <Button variant="danger" size="sm" onClick={() => { if(selectedEntry) deleteEntry(selectedEntry.id); }}>{globalView === 'trash' ? t('common.perm_delete') : t('common.delete')}</Button>
                               {globalView === 'trash' ? (
                                   <Button variant="primary" size="sm" onClick={() => { if(selectedEntry) restoreEntry(selectedEntry.id); setSelectedEntry(null); }}>{t('common.restore')}</Button>
                               ) : (
                                   <Button variant="primary" size="sm" onClick={() => { 
                                       setCurrentEntry(selectedEntry); 
                                       setLocationParts(selectedEntry.location ? selectedEntry.location.split(', ') : []);
                                       setIsEditing(true); 
                                       setSelectedEntry(null); 
                                    }}>{t('common.edit')}</Button>
                               )}
                           </>
                       )}
                   </div>
                </div>
            </div>
        )}

        <Navbar 
            appName={holidayName || data.settings?.userName || 'ReaLog'}
            activeCategory={activeCategory}
            setActiveCategory={(cat) => { setActiveCategory(cat); setGlobalView('none'); }}
            globalView={globalView}
            setGlobalView={setGlobalView}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
            onOpenExport={() => setShowExportModal(true)}
            onOpenDeploy={() => setShowDeployModal(true)}
            onOpenSettings={(tab) => { if(tab) setSettingsTab(tab); setShowSettingsModal(true); }}
            onOpenThemeEditor={() => setShowThemeEditor(true)}
            onLogout={handleLogout}
            onOpenAuth={() => setShowAuthModal(true)}
            onRandomEntry={pickRandomEntry}
            themeClasses={themeClasses}
            showMobileMenu={showMobileMenu}
            setShowMobileMenu={setShowMobileMenu}
            t={t}
            showStats={data.settings?.enableStats !== false}
            showGamification={data.settings?.enableGamification !== false}
            currentStreak={0} 
            logoEmoji={logoEmoji}
            greeting={getGreeting()} 
            setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 max-w-6xl mx-auto w-full p-4 pb-24">
            {/* On This Day Card */}
            {onThisDayEntries.length > 0 && globalView === 'none' && !isEditing && (
                <div className="mb-6 animate-fade-in">
                    <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center justify-between ${themeClasses.card} bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20`}>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-500">
                                <CalendarClock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{t('nav.on_this_day')}</h3>
                                <p className="text-sm opacity-60">{onThisDayEntries.length} {t('app.entries_found')}</p>
                            </div>
                        </div>
                        <Button onClick={() => setGlobalView('onThisDay')} themeClasses={themeClasses} variant="secondary">
                            {t('common.view')}
                        </Button>
                    </div>
                </div>
            )}

            {isAppLoading ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                    <p>{t('app.initializing')}</p>
                </div>
            ) : isEditing ? (
                <EntryEditor 
                    entry={currentEntry}
                    onChange={setCurrentEntry}
                    onSave={saveEntry}
                    onCancel={() => setIsEditing(false)}
                    onDelete={() => currentEntry.id && deleteEntry(currentEntry.id)}
                    activeCategory={activeCategory}
                    questions={data.questions}
                    habits={data.habits}
                    settings={data.settings}
                    templates={data.templates}
                    onSaveTemplate={(name, qs, def) => setData(prev => ({ ...prev, templates: [...(prev.templates||[]), { id: crypto.randomUUID(), name, questions: qs, isDefault: def, category: activeCategory }] }))}
                    onDeleteTemplate={(id) => setData(prev => ({ ...prev, templates: (prev.templates||[]).filter(t => t.id !== id) }))}
                    themeClasses={themeClasses}
                    currentTheme={currentTheme}
                    serverMode={serverMode}
                    t={t}
                    locationParts={locationParts}
                    setLocationParts={setLocationParts}
                    entries={data.entries}
                    onUpdateSettings={(newSettings) => setData(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }))}
                />
            ) : globalView === 'atlas' ? (
                <AtlasView 
                    entries={filteredEntriesAll} 
                    activeCategory={activeCategory} 
                    onSelectEntry={setSelectedEntry} 
                    themeClasses={themeClasses} 
                    showAll={true} 
                    isAdmin={isAdmin}
                    t={t}
                    emojiStyle={emojiStyle}
                />
            ) : globalView === 'gallery' ? (
                <GalleryView 
                    entries={filteredEntriesAll} 
                    onSelectEntry={setSelectedEntry} 
                    themeClasses={themeClasses} 
                    renderActionButtons={renderActionButtons} // Pass action buttons
                    t={t}
                />
            ) : globalView === 'dashboard' ? (
                <DashboardView
                    data={data}
                    currentUser={currentUser}
                    themeClasses={themeClasses}
                    t={t}
                    onSelectEntry={setSelectedEntry}
                    isAdmin={isAdmin}
                    weatherPack={weatherPack}
                    emojiStyle={emojiStyle}
                />
            ) : globalView === 'stats' ? (
                <StatsView 
                    entries={filteredEntriesAll}
                    themeClasses={themeClasses}
                    t={t}
                    savedLayout={data.settings?.statsLayout}
                    onSaveLayout={(l) => setData(p => ({...p, settings: {...p.settings, statsLayout: l}}))}
                    weatherPack={weatherPack}
                    emojiStyle={emojiStyle}
                />
            ) : globalView === 'streak' ? (
                <StreakView 
                    entries={filteredEntriesAll} 
                    currentStreak={0} 
                    longestStreak={0}
                    themeClasses={themeClasses}
                    t={t}
                />
            ) : globalView === 'tags' ? (
                <TagManager 
                    entries={filteredEntriesAll} 
                    onUpdateEntries={(u) => setData(p => ({...p, entries: p.entries.map(e => {
                        const updated = u.find(up => up.id === e.id);
                        return updated || e;
                    })}))}
                    onBack={() => setGlobalView('none')}
                    onSelectTag={(tag) => { setSearchQuery(`#${tag}`); setGlobalView('none'); }}
                    themeClasses={themeClasses}
                    t={t}
                    isAdmin={isAdmin}
                />
            ) : (
                <>
                    {/* View Controls & Trash Actions */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                             {isAdmin && (
                                <div className="flex bg-black/5 p-1 rounded-lg border border-black/5 mr-2 shrink-0">
                                    <button onClick={() => setActiveTab('entries')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'entries' ? themeClasses.primaryBtn + ' shadow' : 'opacity-50 hover:opacity-100'}`}>{t('app.entries_tab')}</button>
                                    <button onClick={() => setActiveTab('questions')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'questions' ? themeClasses.primaryBtn + ' shadow' : 'opacity-50 hover:opacity-100'}`}>{t('app.questions_tab')}</button>
                                    {showHabits && <button onClick={() => setActiveTab('habits')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'habits' ? themeClasses.primaryBtn + ' shadow' : 'opacity-50 hover:opacity-100'}`}>{t('nav.habits')}</button>}
                                </div>
                             )}
                             {activeTab === 'entries' && (
                                <div className="flex bg-black/5 p-1 rounded-lg border border-black/5 shrink-0">
                                    <button onClick={() => handleViewModeChange('grid')} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? themeClasses.primaryBtn + ' shadow' : 'opacity-50 hover:opacity-100'}`} title="Grid"><Layout className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('timeline')} className={`p-1.5 rounded transition-all ${viewMode === 'timeline' ? themeClasses.primaryBtn + ' shadow' : 'opacity-50 hover:opacity-100'}`} title="Timeline"><List className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('calendar')} className={`p-1.5 rounded transition-all ${viewMode === 'calendar' ? themeClasses.primaryBtn + ' shadow' : 'opacity-50 hover:opacity-100'}`} title="Naptár"><Calendar className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('atlas')} className={`p-1.5 rounded transition-all ${viewMode === 'atlas' ? themeClasses.primaryBtn + ' shadow' : 'opacity-50 hover:opacity-100'}`} title="Térkép"><MapIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleViewModeChange('gallery')} className={`p-1.5 rounded transition-all ${viewMode === 'gallery' ? themeClasses.primaryBtn + ' shadow' : 'opacity-50 hover:opacity-100'}`} title="Galéria"><Images className="w-4 h-4" /></button>
                                </div>
                             )}
                         </div>

                         <div className="flex gap-2 w-full md:w-auto">
                             <div className="relative flex-1 md:w-64">
                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                                 <input 
                                    className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-transparent border focus:ring-2 focus:outline-none transition-all ${themeClasses.input}`}
                                    placeholder={t('common.search')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                 />
                             </div>
                             {globalView === 'trash' && isAdmin ? (
                                 <button 
                                    onClick={emptyTrash}
                                    className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2 text-xs font-bold"
                                    title={t('common.empty_trash')}
                                 >
                                     <Trash2 className="w-4 h-4" /> {t('common.empty_trash_btn')}
                                 </button>
                             ) : null}
                         </div>
                    </div>

                    {activeTab === 'questions' ? (
                        <QuestionManager 
                            questions={data.questions} 
                            activeCategory={activeCategory}
                            onAdd={(txt, sub) => setData(p => ({...p, questions: [...p.questions, { id: crypto.randomUUID(), text: txt, category: activeCategory, subCategory: sub, isActive: true }] }))}
                            onToggle={toggleQuestionStatus}
                            onDelete={(id) => setData(p => ({...p, questions: p.questions.filter(q => q.id !== id) }))}
                            themeClasses={themeClasses}
                            t={t}
                        />
                    ) : activeTab === 'habits' ? (
                        <HabitManager 
                            habits={data.habits || []}
                            activeCategory={activeCategory}
                            onAdd={(h) => setData(p => ({...p, habits: [...(p.habits||[]), h]}))}
                            onEdit={(h) => setData(p => ({...p, habits: (p.habits||[]).map(x => x.id === h.id ? h : x)}))}
                            onToggle={(id) => setData(p => ({...p, habits: (p.habits||[]).map(h => h.id === id ? { ...h, isActive: !h.isActive } : h)}))}
                            onDelete={(id) => setData(p => ({...p, habits: (p.habits||[]).filter(h => h.id !== id)}))}
                            themeClasses={themeClasses}
                            t={t}
                        />
                    ) : (
                        <>
                            <div className="animate-fade-in relative min-h-[50vh]">
                                {viewMode === 'calendar' ? (
                                    <CalendarView 
                                        entries={visibleEntries} 
                                        currentDate={calendarDate} 
                                        onDateChange={setCalendarDate} 
                                        onSelectEntry={setSelectedEntry} 
                                        themeClasses={themeClasses}
                                        t={t}
                                    />
                                ) : viewMode === 'atlas' ? (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="w-5 h-5" /> {t('app.world_map')}</h2>
                                        <AtlasView entries={visibleEntries} activeCategory={activeCategory} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} showAll={true} isAdmin={isAdmin} t={t} emojiStyle={emojiStyle} />
                                    </div>
                                ) : viewMode === 'gallery' ? (
                                    <div className="space-y-4">
                                         <h2 className="text-xl font-bold flex items-center gap-2"><Images className="w-5 h-5" /> {t('app.photo_gallery')}</h2>
                                         <GalleryView entries={visibleEntries} onSelectEntry={setSelectedEntry} themeClasses={themeClasses} renderActionButtons={renderActionButtons} t={t} />
                                    </div>
                                ) : (
                                    <EntryList 
                                        viewMode={viewMode}
                                        entries={visibleEntries}
                                        onSelectEntry={setSelectedEntry}
                                        renderActionButtons={renderActionButtons} // Use the renderer
                                        themeClasses={themeClasses}
                                        isAdmin={isAdmin}
                                        t={t}
                                        gridLayout={data.settings?.gridLayout}
                                        weatherPack={weatherPack} 
                                        emojiStyle={emojiStyle}
                                    />
                                )}

                                {visibleCount < filteredEntriesAll.length && viewMode !== 'calendar' && viewMode !== 'atlas' && viewMode !== 'gallery' && (
                                    <div ref={loadMoreRef} className="h-20 flex items-center justify-center opacity-50">
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </>
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

        <StatusBar 
            serverMode={serverMode} 
            syncStatus={syncStatus} 
            lastSyncTime={lastSyncTime} 
            systemMessage={systemMessage} 
            themeClasses={themeClasses}
            cloudEnabled={!!data.settings?.cloud?.enabled}
            onOpenDebug={() => setShowStorageMenu(true)}
            t={t}
        />
    </div>
  );
}
