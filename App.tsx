import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Lock, Unlock, PenTool, Download, Upload, 
  Plus, Trash2, Save, BrainCircuit, X, ChevronRight, Layout, RefreshCw,
  Image as ImageIcon, Cloud, Calendar, List, Grid as GridIcon,
  Smile, Settings, Info, Server, MapPin, Eye, Palette
} from 'lucide-react';
import { AppData, Category, Entry, WeatherData, ThemeOption } from './types';
import { CATEGORY_LABELS, DEMO_PASSWORD, INITIAL_DATA, DEFAULT_QUESTIONS } from './constants';
import * as StorageService from './services/storage';
import * as GeminiService from './services/gemini';

// --- Theme Configurations ---

const THEMES = {
    dark: {
        bg: 'bg-zinc-950',
        text: 'text-zinc-100',
        card: 'bg-zinc-900 border-zinc-800',
        input: 'bg-zinc-950 border-zinc-700 focus:ring-emerald-500',
        nav: 'bg-zinc-950/90 border-zinc-800',
        accent: 'text-emerald-500',
        primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        secondaryBtn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700',
        subtext: 'text-zinc-400'
    },
    light: {
        bg: 'bg-slate-50',
        text: 'text-slate-900',
        card: 'bg-white border-slate-200 shadow-sm',
        input: 'bg-white border-slate-300 focus:ring-emerald-500 text-slate-900',
        nav: 'bg-white/90 border-slate-200',
        accent: 'text-emerald-600',
        primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        secondaryBtn: 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300',
        subtext: 'text-slate-500'
    },
    lavender: {
        bg: 'bg-[#fdf4ff]', // Fuchsia 50
        text: 'text-[#4a044e]', // Fuchsia 950
        card: 'bg-white border-[#e879f9]/30 shadow-sm',
        input: 'bg-white border-[#d8b4fe] focus:ring-[#c026d3] text-[#4a044e]',
        nav: 'bg-white/90 border-[#f0abfc]',
        accent: 'text-[#c026d3]', // Fuchsia 600
        primaryBtn: 'bg-[#c026d3] hover:bg-[#a21caf] text-white',
        secondaryBtn: 'bg-white hover:bg-[#fae8ff] text-[#86198f] border-[#e879f9]',
        subtext: 'text-[#86198f]' // Fuchsia 800
    }
};

// --- Helper Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline', themeClasses?: any }> = 
  ({ className, variant = 'primary', themeClasses, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Use theme classes if provided, otherwise fallback (though we should always provide them in context)
  const variants = {
    primary: themeClasses?.primaryBtn || "bg-emerald-600 text-white",
    secondary: themeClasses?.secondaryBtn || "bg-zinc-800 text-zinc-100",
    danger: "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100",
    outline: "bg-transparent border"
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className || ''}`} {...props} />;
};

const Card: React.FC<{ children: React.ReactNode; className?: string; themeClasses?: any }> = ({ children, className, themeClasses }) => (
  <div className={`rounded-xl overflow-hidden border ${themeClasses?.card} ${className || ''}`}>
    {children}
  </div>
);

const Input = ({ themeClasses, ...props }: any) => (
    <input 
        className={`w-full rounded-lg px-4 py-2 focus:ring-2 focus:outline-none transition-all placeholder-opacity-50 ${themeClasses?.input}`}
        {...props}
    />
);

const MOODS = ['🔥', '🚀', '🙂', '😐', '😫', '😡', '💀', '🎉'];

// --- Modal Definitions ---

const ExportModal: React.FC<{ 
    onClose: () => void, 
    data: AppData, 
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    themeClasses: any,
    currentTheme: ThemeOption 
}> = ({ onClose, data, onImport, themeClasses, currentTheme }) => {
    const handleExport = (format: 'json' | 'txt' | 'html') => {
        StorageService.exportData(data, format, {});
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <Card themeClasses={themeClasses} className="w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Download className="w-5 h-5" /> Adatkezelés</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className={`block text-xs font-bold uppercase mb-2 ${themeClasses.subtext}`}>Exportálás</label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('json')}>JSON</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('txt')}>TXT</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('html')}>HTML</Button>
                        </div>
                        <p className={`text-xs mt-2 ${themeClasses.subtext}`}>A JSON formátum alkalmas biztonsági mentésre és visszaállításra.</p>
                    </div>

                    <div className={`border-t pt-6 ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-200'}`}>
                        <label className={`block text-xs font-bold uppercase mb-2 ${themeClasses.subtext}`}>Importálás / Visszaállítás</label>
                        <div className="relative group">
                            <input type="file" onChange={onImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".json" />
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors group-hover:bg-black/5 ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-300'}`}>
                                <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                <span className="text-sm font-medium">Kattints a JSON fájl feltöltéséhez</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const DeployModal: React.FC<{ onClose: () => void, themeClasses: any }> = ({ onClose, themeClasses }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
        <Card themeClasses={themeClasses} className="w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Server className="w-5 h-5" /> Telepítés</h3>
            <div className="space-y-4 text-sm leading-relaxed">
                <p>Ez az alkalmazás <strong>100%-ban kliens oldali</strong>, így bárhol hosztolható statikus oldalként (pl. Netlify, Vercel, GitHub Pages).</p>
                
                <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                    <h4 className="font-bold text-emerald-600 mb-1">Vercel Telepítés:</h4>
                    <ol className="list-decimal list-inside space-y-1 opacity-80">
                        <li>Telepítsd a projektet: <code>npm install</code></li>
                        <li>Buildeld le: <code>npm run build</code></li>
                        <li>Töltsd fel a <code>build</code> mappát, vagy csatold a GitHub repót.</li>
                    </ol>
                </div>

                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <h4 className="font-bold text-blue-600 mb-1">Fontos:</h4>
                    <p className="opacity-80">A <code>process.env.API_KEY</code> környezeti változót állítsd be a szolgáltatónál a Gemini API kulcsoddal!</p>
                </div>
            </div>
        </Card>
    </div>
);

// --- Main Application ---

export default function App() {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [activeCategory, setActiveCategory] = useState<Category>(Category.DAILY);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>('dark');
  const [themeClasses, setThemeClasses] = useState(THEMES.dark);

  // UI State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null); // For Full View
  const [passwordInput, setPasswordInput] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editorLayout, setEditorLayout] = useState<'list' | 'grid'>('list');
  const [currentEntry, setCurrentEntry] = useState<Partial<Entry>>({});
  const [activeTab, setActiveTab] = useState<'entries' | 'questions'>('entries');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data
  useEffect(() => {
    const loaded = StorageService.loadData();
    setData(loaded);
    if (loaded.settings?.theme) {
        setCurrentTheme(loaded.settings.theme);
    }
  }, []);

  // Theme Logic
  useEffect(() => {
      let target = currentTheme;
      if (currentTheme === 'system') {
          target = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      setThemeClasses(THEMES[target as keyof typeof THEMES] || THEMES.dark);
      
      // Update body background
      document.body.className = (THEMES[target as keyof typeof THEMES] || THEMES.dark).bg;
  }, [currentTheme]);

  // Save data
  useEffect(() => {
    StorageService.saveData(data);
  }, [data]);

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === DEMO_PASSWORD) {
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
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedData = await StorageService.importFromJson(file);
        if (confirm("Biztosan felülírod a jelenlegi adatokat az importált fájllal?")) {
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
      responses: initialResponses
    });
    setIsEditing(true);
  };

  const saveEntry = () => {
    if (!currentEntry.id || !currentEntry.dateLabel) return;
    const newEntry = currentEntry as Entry;
    if (!newEntry.title?.trim()) newEntry.title = newEntry.dateLabel;

    setData(prev => ({
      ...prev,
      entries: [newEntry, ...prev.entries.filter(e => e.id !== newEntry.id)]
    }));
    setIsEditing(false);
    setCurrentEntry({});
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

  const fetchWeather = () => {
    if (!navigator.geolocation) { alert("A böngésző nem támogatja a helymeghatározást."); return; }
    if (!data.settings?.openWeatherMapKey) {
        alert("Kérlek állítsd be az OpenWeatherMap API kulcsot a beállításokban!");
        setShowSettingsModal(true);
        return;
    }
    setIsFetchingWeather(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${data.settings?.openWeatherMapKey}&units=metric&lang=hu`);
            if (!res.ok) throw new Error("Weather API Error");
            const weatherData = await res.json();
            const locationName = weatherData.name || "Ismeretlen helyszín";

            setCurrentEntry(prev => ({
                ...prev,
                location: locationName,
                gps: { lat: latitude, lon: longitude },
                weather: {
                    temp: Math.round(weatherData.main.temp),
                    condition: weatherData.weather[0].description,
                    location: locationName,
                    icon: weatherData.weather[0].icon
                }
            }));
        } catch (e) { console.error(e); alert("Hiba az időjárás lekérésekor."); } 
        finally { setIsFetchingWeather(false); }
    }, (err) => { alert("Hiba: " + err.message); setIsFetchingWeather(false); });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 1024 * 1024 * 3) { alert("Túl nagy fájl (max 3MB)."); return; }
          const reader = new FileReader();
          reader.onloadend = () => setCurrentEntry(prev => ({ ...prev, photo: reader.result as string }));
          reader.readAsDataURL(file);
      }
  };

  const runAnalysis = async () => {
    if (!currentEntry.responses) return;
    setIsAnalyzing(true);
    const questions = data.questions.filter(q => q.category === activeCategory);
    let fullText = "";
    questions.forEach(q => {
       const ans = currentEntry.responses?.[q.id];
       if (ans) fullText += `Kérdés: ${q.text}\nVálasz: ${ans}\n\n`;
    });
    const result = await GeminiService.analyzeEntry(fullText, CATEGORY_LABELS[activeCategory]);
    setCurrentEntry(prev => ({ ...prev, aiAnalysis: result }));
    setIsAnalyzing(false);
  };

  // --- Views ---

  const renderEntryForm = () => {
    const entryQuestionIds = Object.keys(currentEntry.responses || {});
    const availableQuestions = data.questions.filter(q => q.category === activeCategory && !entryQuestionIds.includes(q.id));

    const addQuestionToEntry = (questionId: string) => {
        if (!questionId) return;
        setCurrentEntry(prev => ({ ...prev, responses: { ...prev.responses, [questionId]: "" } }));
    };

    const removeQuestionFromEntry = (questionId: string) => {
        const newResponses = { ...currentEntry.responses };
        delete newResponses[questionId];
        setCurrentEntry(prev => ({ ...prev, responses: newResponses }));
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className={`flex items-center justify-between mb-4 border-b ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-200'} pb-4`}>
            <h2 className={`text-xl font-bold ${themeClasses.accent} flex items-center gap-2`}>
                <PenTool className="w-5 h-5" /> 
                {currentEntry.dateLabel}
            </h2>
            <div className="flex gap-2">
                 <div className={`rounded-lg p-1 border flex mr-2 ${currentTheme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                    <button onClick={() => setEditorLayout('list')} className={`p-1.5 rounded ${editorLayout === 'list' ? 'bg-white/10 shadow' : 'opacity-50'}`}><List className="w-4 h-4" /></button>
                    <button onClick={() => setEditorLayout('grid')} className={`p-1.5 rounded ${editorLayout === 'grid' ? 'bg-white/10 shadow' : 'opacity-50'}`}><GridIcon className="w-4 h-4" /></button>
                 </div>
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
                 <div className="flex gap-1 overflow-x-auto pb-1">
                     {MOODS.map(m => (
                         <button 
                            key={m} 
                            onClick={() => setCurrentEntry({...currentEntry, mood: m})}
                            className={`text-xl p-2 rounded-lg transition-colors ${currentEntry.mood === m ? 'bg-black/10 ring-1' : 'hover:bg-black/5'}`}
                         >
                             {m}
                         </button>
                     ))}
                 </div>
            </div>
        </div>

        <div className="flex flex-wrap gap-2">
             <Button type="button" variant="secondary" themeClasses={themeClasses} onClick={fetchWeather} disabled={isFetchingWeather} size="sm">
                 {isFetchingWeather ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                 {currentEntry.location ? currentEntry.location : 'Helyszín & Időjárás'}
             </Button>
             <Button type="button" variant="secondary" themeClasses={themeClasses} onClick={() => fileInputRef.current?.click()} size="sm">
                 <ImageIcon className="w-4 h-4" /> {currentEntry.photo ? 'Fotó cseréje' : 'Fotó hozzáadása'}
             </Button>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        </div>

        {currentEntry.location && (
            <div className={`text-xs flex items-center gap-1 ${themeClasses.subtext}`}>
                <MapPin className="w-3 h-3" /> {currentEntry.location} 
                {currentEntry.weather && ` • ${currentEntry.weather.temp}°C ${currentEntry.weather.condition}`}
            </div>
        )}

        {currentEntry.photo && (
            <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border">
                <img src={currentEntry.photo} alt="Attached" className="w-full h-full object-cover" />
                <button onClick={() => setCurrentEntry({...currentEntry, photo: undefined})} className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        {/* Dynamic Questions */}
        <div className="space-y-4">
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
                {entryQuestionIds.map(qId => {
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
        </div>

        <div className={`flex gap-4 pt-4 border-t sticky bottom-0 backdrop-blur py-2 z-10 ${currentTheme === 'dark' ? 'border-zinc-800 bg-zinc-950/90' : 'border-slate-200 bg-white/90'}`}>
          <Button onClick={saveEntry} themeClasses={themeClasses} className="flex-1">
            <Save className="w-4 h-4" /> Mentés
          </Button>
          <Button variant="secondary" themeClasses={themeClasses} onClick={runAnalysis} disabled={isAnalyzing}>
             {isAnalyzing ? 'Elemzés...' : <><BrainCircuit className="w-4 h-4" /> AI Elemzés</>}
          </Button>
        </div>
      </div>
    );
  };

  const renderEntries = () => {
    const entries = data.entries.filter(e => e.category === activeCategory).sort((a, b) => b.timestamp - a.timestamp);

    if (entries.length === 0) return <div className="text-center py-20 opacity-50 border-2 border-dashed rounded-xl">Még nincs bejegyzés.</div>;

    if (viewMode === 'timeline') {
        return (
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-current before:opacity-20">
                {entries.map(entry => (
                    <div key={entry.id} className="relative cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                        <div className={`absolute -left-[29px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${themeClasses.bg} ${themeClasses.accent.replace('text', 'border')}`}>
                            <div className={`w-2 h-2 rounded-full ${themeClasses.accent.replace('text', 'bg')}`} />
                        </div>
                        
                        <Card themeClasses={themeClasses} className="p-4 hover:shadow-md transition-all">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <span className={`text-xs font-mono mb-1 block ${themeClasses.accent}`}>{new Date(entry.timestamp).toLocaleDateString()}</span>
                                     <h3 className="text-lg font-bold">{entry.title || entry.dateLabel}</h3>
                                     {entry.location && (
                                         <div className={`flex items-center gap-1 text-xs mt-1 ${themeClasses.subtext}`}>
                                            <MapPin className="w-3 h-3" /> {entry.location}
                                            {entry.weather && ` • ${entry.weather.temp}°C`}
                                         </div>
                                     )}
                                 </div>
                                 <div className="flex gap-2 text-xl">{entry.mood}</div>
                             </div>
                             {entry.photo && <img src={entry.photo} className="mt-3 w-full h-32 object-cover rounded" alt="cover" />}
                             <p className={`text-sm mt-2 line-clamp-3 ${themeClasses.subtext}`}>{Object.values(entry.responses)[0]}</p>
                             {isAdmin && (
                                <div className="mt-3 flex gap-2">
                                    <Button variant="secondary" themeClasses={themeClasses} className="px-2 py-1 text-xs" onClick={(e) => { e.stopPropagation(); setCurrentEntry(entry); setIsEditing(true); }}>Szerkesztés</Button>
                                    <Button variant="danger" className="px-2 py-1 text-xs" onClick={(e) => deleteEntry(entry.id, e)}>Törlés</Button>
                                </div>
                             )}
                        </Card>
                    </div>
                ))}
            </div>
        )
    }

    // Grid View
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map(entry => (
          <Card key={entry.id} themeClasses={themeClasses} className="group hover:ring-1 hover:ring-current transition-all flex flex-col h-full">
            <div onClick={() => setSelectedEntry(entry)} className="cursor-pointer flex-1 flex flex-col">
                {entry.photo && (
                    <div className="h-40 w-full overflow-hidden border-b border-white/10">
                        <img src={entry.photo} alt="Entry" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div>
                    <div className={`text-xs mb-1 flex items-center gap-2 ${themeClasses.subtext}`}>
                        <Calendar className="w-3 h-3" /> {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <h3 className="text-lg font-bold leading-tight">{entry.title || entry.dateLabel}</h3>
                    </div>
                    <div className="text-2xl">{entry.mood}</div>
                </div>
                
                {entry.location && (
                    <div className="flex items-center gap-2 text-xs opacity-70 mb-4 bg-black/5 p-2 rounded w-fit">
                        <MapPin className="w-3 h-3" /> {entry.location}
                    </div>
                )}

                <div className="space-y-3 flex-1">
                    {Object.entries(entry.responses).slice(0, 2).map(([qId, answer]) => {
                        const question = data.questions.find(q => q.id === qId);
                        return (
                            <div key={qId}>
                                <p className={`text-[10px] font-bold uppercase truncate ${themeClasses.accent}`}>{question?.text || "..."}</p>
                                <p className={`text-sm line-clamp-2 ${themeClasses.subtext}`}>{answer}</p>
                            </div>
                        )
                    })}
                </div>
                </div>
            </div>

            {isAdmin && (
                <div className={`p-4 mt-auto border-t flex justify-end gap-2 ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-200'}`}>
                    <Button variant="secondary" themeClasses={themeClasses} className="h-8 px-3 py-0 text-xs" onClick={(e) => { e.stopPropagation(); setCurrentEntry(entry); setIsEditing(true); }}>
                        Szerkesztés
                    </Button>
                    <Button variant="danger" className="h-8 w-8 p-0" onClick={(e) => deleteEntry(entry.id, e)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderQuestionManager = () => {
    const questions = data.questions.filter(q => q.category === activeCategory);
    const addQuestion = () => {
        const text = prompt("Új kérdés szövege:");
        if (text) {
          setData(prev => ({
            ...prev,
            questions: [...prev.questions, { id: crypto.randomUUID(), text, category: activeCategory, isActive: true }]
          }));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Kérdések kezelése</h3>
                <Button onClick={addQuestion} themeClasses={themeClasses} size="sm"><Plus className="w-4 h-4" /> Új Kérdés</Button>
            </div>
            <div className="space-y-3">
                {questions.map(q => (
                    <div key={q.id} className={`flex items-center justify-between p-4 rounded-lg border ${themeClasses.card}`}>
                        <span className={`text-sm flex-1 mr-4 ${q.isActive ? '' : 'line-through opacity-50'}`}>{q.text}</span>
                        <div className="flex gap-2">
                            <button onClick={() => toggleQuestionStatus(q.id)} className={`text-xs px-3 py-1 rounded font-medium ${q.isActive ? themeClasses.accent + ' bg-black/5' : 'opacity-50 border'}`}>
                                {q.isActive ? 'Aktív' : 'Inaktív'}
                            </button>
                            <button onClick={() => setData(prev => ({ ...prev, questions: prev.questions.filter(x => x.id !== q.id) }))} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
  }

  // --- Main Render ---

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Sidebar */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t md:top-0 md:bottom-auto md:w-64 md:border-r md:border-t-0 md:h-screen flex md:flex-col justify-between p-4 transition-all ${themeClasses.nav}`}>
        <div className="hidden md:block">
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg text-white ${themeClasses.primaryBtn}`}>
                    <Book className="w-5 h-5" />
                </div>
                <h1 className="font-bold text-xl tracking-tight">Grind Napló</h1>
            </div>
            <div className="space-y-1">
                {(Object.keys(Category) as Array<keyof typeof Category>).map(cat => (
                    <button key={cat} onClick={() => { setActiveCategory(Category[cat]); setActiveTab('entries'); setIsEditing(false); }}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${activeCategory === Category[cat] ? themeClasses.secondaryBtn : 'opacity-60 hover:opacity-100'}`}>
                        {CATEGORY_LABELS[Category[cat]]}
                        {activeCategory === Category[cat] && <ChevronRight className={`w-4 h-4 ${themeClasses.accent}`} />}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex md:hidden w-full justify-around">
            {(Object.keys(Category) as Array<keyof typeof Category>).map(cat => (
                 <button key={cat} onClick={() => { setActiveCategory(Category[cat]); setActiveTab('entries'); setIsEditing(false); }}
                    className={`flex flex-col items-center gap-1 p-2 rounded ${activeCategory === Category[cat] ? themeClasses.accent : 'opacity-50'}`}>
                    <span className="text-xs font-bold">{CATEGORY_LABELS[Category[cat]].substring(0,1)}</span>
                 </button>
            ))}
        </div>
        <div className="hidden md:block space-y-3 pt-4 border-t border-current border-opacity-10">
            {isAdmin ? (
                <>
                    <Button variant="secondary" themeClasses={themeClasses} className="w-full justify-start text-xs" onClick={() => setShowExportModal(true)}><Download className="w-4 h-4" /> Export / Import</Button>
                    <Button variant="secondary" themeClasses={themeClasses} className="w-full justify-start text-xs" onClick={() => setShowSettingsModal(true)}><Settings className="w-4 h-4" /> Beállítások</Button>
                    <Button variant="secondary" themeClasses={themeClasses} className="w-full justify-start text-xs" onClick={() => setActiveTab(activeTab === 'questions' ? 'entries' : 'questions')}><Layout className="w-4 h-4" /> {activeTab === 'questions' ? 'Bejegyzések' : 'Kérdések'}</Button>
                    <Button variant="ghost" className="w-full justify-start text-xs opacity-60" onClick={() => setShowDeployModal(true)}><Server className="w-4 h-4" /> Telepítés</Button>
                    <Button variant="danger" className="w-full justify-start text-xs" onClick={handleLogout}><Lock className="w-4 h-4" /> Kilépés</Button>
                </>
            ) : (
                <Button variant="primary" themeClasses={themeClasses} className="w-full" onClick={() => setShowAuthModal(true)}><Unlock className="w-4 h-4" /> Admin</Button>
            )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto transition-all">
        <div className="md:hidden flex justify-between items-center mb-6">
             <h1 className="font-bold text-lg">{CATEGORY_LABELS[activeCategory]}</h1>
             <div className="flex gap-2">
                {isAdmin && <Button variant="ghost" themeClasses={themeClasses} onClick={() => setShowExportModal(true)}><Download className="w-5 h-5" /></Button>}
                <Button variant="ghost" themeClasses={themeClasses} onClick={() => isAdmin ? handleLogout() : setShowAuthModal(true)}>{isAdmin ? <Lock className="w-5 h-5 text-red-400" /> : <Unlock className="w-5 h-5" />}</Button>
             </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
               <h2 className="text-3xl font-bold hidden md:block tracking-tight">{CATEGORY_LABELS[activeCategory]}</h2>
               <p className={`text-sm mt-1 ${themeClasses.subtext}`}>{activeTab === 'entries' ? `Rögzítsd a fejlődésed.` : 'Állítsd be a kérdéseidet.'}</p>
            </div>
            {isAdmin && activeTab === 'entries' && !isEditing && (
                <div className="flex gap-2 w-full md:w-auto">
                    <div className={`flex rounded-lg p-1 border ${currentTheme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'}`}>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? themeClasses.accent + ' bg-black/5' : 'opacity-50'}`}><GridIcon className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('timeline')} className={`p-2 rounded ${viewMode === 'timeline' ? themeClasses.accent + ' bg-black/5' : 'opacity-50'}`}><List className="w-4 h-4" /></button>
                    </div>
                    <Button onClick={startNewEntry} themeClasses={themeClasses} className="flex-1 md:flex-none"><Plus className="w-5 h-5" /> Új Bejegyzés</Button>
                </div>
            )}
        </div>

        {isEditing ? <Card themeClasses={themeClasses} className="p-4 md:p-8 shadow-2xl">{renderEntryForm()}</Card> : (activeTab === 'questions' && isAdmin ? renderQuestionManager() : renderEntries())}
      </main>

      {/* --- Modals --- */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card themeClasses={themeClasses} className="w-full max-w-sm p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-center">Admin Hozzáférés</h3>
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input themeClasses={themeClasses} type="password" value={passwordInput} onChange={(e: any) => setPasswordInput(e.target.value)} placeholder="Jelszó" autoFocus className="text-center tracking-widest" />
                    <div className="flex gap-2"><Button type="button" variant="ghost" className="flex-1" onClick={() => setShowAuthModal(false)}>Mégse</Button><Button type="submit" themeClasses={themeClasses} className="flex-1">Belépés</Button></div>
                </form>
            </Card>
        </div>
      )}

      {/* Full View Modal */}
      {selectedEntry && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in overflow-y-auto" onClick={() => setSelectedEntry(null)}>
              <div className="w-full max-w-2xl my-auto" onClick={e => e.stopPropagation()}>
                  <Card themeClasses={themeClasses} className="p-0 shadow-2xl relative">
                      {selectedEntry.photo && <img src={selectedEntry.photo} className="w-full h-64 object-cover" />}
                      <button className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70" onClick={() => setSelectedEntry(null)}><X className="w-5 h-5" /></button>
                      <div className="p-6 md:p-8">
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <span className={`text-sm font-bold ${themeClasses.accent}`}>{new Date(selectedEntry.timestamp).toLocaleDateString()}</span>
                                  <h2 className="text-3xl font-bold mt-1">{selectedEntry.title || selectedEntry.dateLabel}</h2>
                                  {selectedEntry.location && <div className={`flex items-center gap-1 mt-2 text-sm ${themeClasses.subtext}`}><MapPin className="w-4 h-4" /> {selectedEntry.location} {selectedEntry.weather && `(${selectedEntry.weather.temp}°C)`}</div>}
                              </div>
                              <div className="text-4xl">{selectedEntry.mood}</div>
                          </div>
                          <div className="space-y-6">
                              {Object.entries(selectedEntry.responses).map(([qId, ans]) => {
                                  const q = data.questions.find(qu => qu.id === qId);
                                  return (
                                      <div key={qId}>
                                          <h4 className={`text-sm font-bold uppercase mb-1 ${themeClasses.accent}`}>{q?.text}</h4>
                                          <p className={`whitespace-pre-wrap leading-relaxed ${themeClasses.text}`}>{ans}</p>
                                      </div>
                                  )
                              })}
                              {selectedEntry.aiAnalysis && (
                                  <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                                      <h4 className="flex items-center gap-2 text-emerald-600 font-bold mb-2"><BrainCircuit className="w-4 h-4" /> AI Coach</h4>
                                      <p className="text-sm italic">{selectedEntry.aiAnalysis}</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </Card>
              </div>
          </div>
      )}

      {showSettingsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card themeClasses={themeClasses} className="w-full max-w-sm p-6">
                <h3 className="text-lg font-bold mb-4">Beállítások</h3>
                <div className="space-y-4">
                    <div>
                        <label className={`text-xs uppercase font-bold ${themeClasses.subtext}`}>Téma</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {(['light', 'dark', 'lavender', 'system'] as const).map(t => (
                                <button key={t} onClick={() => { setCurrentTheme(t); setData(prev => ({...prev, settings: {...prev.settings, theme: t}}))}} 
                                    className={`p-2 rounded border text-sm capitalize ${currentTheme === t ? themeClasses.accent + ' border-current' : 'border-transparent bg-black/5'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={`text-xs uppercase font-bold ${themeClasses.subtext}`}>OpenWeatherMap API Kulcs</label>
                        <Input themeClasses={themeClasses} value={data.settings?.openWeatherMapKey || ''} onChange={(e: any) => setData(prev => ({ ...prev, settings: { ...prev.settings, openWeatherMapKey: e.target.value } }))} placeholder="api_key_..." />
                    </div>
                    <div className="flex justify-end gap-2 pt-4"><Button onClick={() => setShowSettingsModal(false)} themeClasses={themeClasses}>Bezárás</Button></div>
                </div>
            </Card>
          </div>
      )}

      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} data={data} onImport={handleImport} themeClasses={themeClasses} currentTheme={currentTheme} />}
      {showDeployModal && <DeployModal onClose={() => setShowDeployModal(false)} themeClasses={themeClasses} />}

      {/* FAB */}
      {isAdmin && !isEditing && activeTab === 'entries' && (
          <button onClick={startNewEntry} className={`md:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-40 active:scale-95 ${themeClasses.primaryBtn}`}>
              <Plus className="w-6 h-6" />
          </button>
      )}
    </div>
  );
}