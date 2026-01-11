import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Lock, Unlock, PenTool, Download, Upload, 
  Plus, Trash2, Save, X, ChevronRight, Layout, RefreshCw,
  Image as ImageIcon, Cloud, Calendar, List, Grid as GridIcon,
  Smile, Settings, Info, Server, MapPin, Eye, EyeOff, Palette, Search, ChevronLeft, Map as MapIcon,
  ThermometerSun, Menu, Code, LogOut, CheckCircle2, AlertCircle, CloudLightning, HardDrive,
  Wifi, WifiOff, Database, Activity, ChevronUp, Terminal, Copy, FileText, FileCode, User,
  Globe, Images, Layers, Shield, ShieldAlert, Clock, Bold, Italic, Underline, Link as LinkIcon, AlignLeft
} from 'lucide-react';
import { AppData, Category, Entry, WeatherData, ThemeOption, CloudConfig, CategoryConfig, PublicConfig } from './types';
import { CATEGORY_LABELS, DEMO_PASSWORD, INITIAL_DATA, DEFAULT_QUESTIONS, CATEGORY_COLORS, CATEGORY_BORDER_COLORS } from './constants';
import * as StorageService from './services/storage';

// --- Theme Configurations ---

const THEMES = {
    dark: {
        bg: 'bg-zinc-950',
        text: 'text-zinc-100',
        card: 'bg-zinc-900 border-zinc-800',
        input: 'bg-zinc-950 border-zinc-700 focus:ring-emerald-500 text-zinc-100',
        nav: 'bg-zinc-900 border-zinc-800', // Slightly lighter for contrast
        accent: 'text-emerald-500',
        primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        secondaryBtn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700',
        subtext: 'text-zinc-400',
        statusBar: 'bg-zinc-900 border-zinc-800 text-zinc-400'
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
        subtext: 'text-slate-500',
        statusBar: 'bg-white border-slate-200 text-slate-600'
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
        subtext: 'text-[#86198f]', // Fuchsia 800
        statusBar: 'bg-[#fdf4ff] border-[#f0abfc] text-[#86198f]'
    }
};

// --- Helper Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline', 
  size?: 'sm' | 'md' | 'lg',
  themeClasses?: any 
}> = ({ className, variant = 'primary', size = 'md', themeClasses, ...props }) => {
  const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
  };

  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: themeClasses?.primaryBtn || "bg-emerald-600 text-white",
    secondary: themeClasses?.secondaryBtn || "bg-zinc-800 text-zinc-100",
    danger: "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100",
    outline: "bg-transparent border"
  };
  return <button className={`${baseStyle} ${sizeClasses[size]} ${variants[variant] || variants.primary} ${className || ''}`} {...props} />;
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

// --- Sub-Components ---

const StorageDebugMenu: React.FC<{
    onClose: () => void;
    onSwitchMode: (mode: 'server' | 'cloud' | 'local') => Promise<void>;
    serverMode: boolean;
    cloudConfig: CloudConfig | undefined;
    lastError: string;
    themeClasses: any;
}> = ({ onClose, onSwitchMode, serverMode, cloudConfig, lastError, themeClasses }) => {
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState("");

    const handleSwitch = async (mode: 'server' | 'cloud' | 'local') => {
        setLoading(true);
        setTestResult("");
        try {
            await onSwitchMode(mode);
        } catch (e: any) {
            setTestResult(e.message || "Hiba történt");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 left-2 z-[110] animate-fade-in origin-bottom-left">
            <div className={`rounded-lg shadow-xl border p-4 w-72 backdrop-blur-md ${themeClasses.card} ${themeClasses.text}`}>
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                    <h4 className="font-bold text-xs uppercase flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> Tároló Diagnosztika
                    </h4>
                    <button onClick={onClose}><X className="w-3 h-3" /></button>
                </div>

                <div className="space-y-2">
                    <button 
                        onClick={() => handleSwitch('server')}
                        disabled={loading}
                        className={`w-full text-left p-2 rounded text-xs flex items-center justify-between transition-colors ${serverMode ? 'bg-emerald-500/20 border border-emerald-500/50' : 'hover:bg-black/5 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2"><Server className="w-3 h-3" /> Saját Szerver (Node / PHP)</span>
                        {serverMode && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </button>

                    <button 
                        onClick={() => handleSwitch('cloud')}
                        disabled={loading || !cloudConfig?.url}
                        className={`w-full text-left p-2 rounded text-xs flex items-center justify-between transition-colors ${!serverMode && cloudConfig?.enabled ? 'bg-blue-500/20 border border-blue-500/50' : 'hover:bg-black/5 border border-transparent'} ${!cloudConfig?.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span className="flex items-center gap-2"><CloudLightning className="w-3 h-3" /> Külső Felhő (API)</span>
                        {!serverMode && cloudConfig?.enabled && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                    </button>

                    <button 
                        onClick={() => handleSwitch('local')}
                        disabled={loading}
                        className={`w-full text-left p-2 rounded text-xs flex items-center justify-between transition-colors ${!serverMode && !cloudConfig?.enabled ? 'bg-zinc-500/20 border border-zinc-500/50' : 'hover:bg-black/5 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2"><HardDrive className="w-3 h-3" /> Csak Helyi (Offline)</span>
                        {!serverMode && !cloudConfig?.enabled && <CheckCircle2 className="w-3 h-3 opacity-50" />}
                    </button>
                </div>

                {(lastError || testResult) && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-mono text-red-400 break-all">
                        {testResult || lastError}
                    </div>
                )}
                
                {loading && <div className="mt-2 text-center text-[10px] opacity-50 animate-pulse">Kapcsolódás...</div>}
            </div>
        </div>
    );
};

const StatusBar: React.FC<{
    serverMode: boolean;
    syncStatus: 'idle' | 'syncing' | 'error' | 'success';
    lastSyncTime: number | null;
    systemMessage: string;
    themeClasses: any;
    cloudEnabled: boolean;
    onOpenDebug: () => void;
}> = ({ serverMode, syncStatus, lastSyncTime, systemMessage, themeClasses, cloudEnabled, onOpenDebug }) => {
    const getServerStatus = () => {
        if (serverMode) return { icon: <Server className="w-3 h-3 text-emerald-500" />, text: "Szerver: Online" };
        if (cloudEnabled) return { icon: <CloudLightning className="w-3 h-3 text-blue-500" />, text: "Felhő: Aktív" };
        return { icon: <HardDrive className="w-3 h-3 opacity-50" />, text: "Helyi Tároló" };
    };

    const getSyncStatus = () => {
        if (syncStatus === 'syncing') return { icon: <RefreshCw className="w-3 h-3 animate-spin text-yellow-500" />, text: "Mentés..." };
        if (syncStatus === 'error') return { icon: <AlertCircle className="w-3 h-3 text-red-500" />, text: "Mentési Hiba!" };
        if (syncStatus === 'success') return { icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />, text: "Mentve" };
        return { icon: <Database className="w-3 h-3 opacity-50" />, text: "Kész" };
    };

    const getSystemStatus = () => {
        if (systemMessage) return { icon: <Activity className="w-3 h-3 text-red-500" />, text: systemMessage, isError: true };
        const time = lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : "--:--";
        return { icon: <Activity className="w-3 h-3 opacity-50" />, text: `Rendszer OK (${time})`, isError: false };
    };

    const server = getServerStatus();
    const sync = getSyncStatus();
    const system = getSystemStatus();

    return (
        <div className={`fixed bottom-0 left-0 right-0 h-6 border-t flex items-center text-[10px] font-mono z-[100] select-none ${themeClasses.statusBar}`}>
            <div 
                onClick={onOpenDebug}
                className="flex-1 flex items-center justify-start px-3 gap-2 border-r border-current border-opacity-10 h-full overflow-hidden whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors relative group"
                title="Kattints a tárolási mód váltásához és hibakereséshez"
            >
                {server.icon}
                <span className="opacity-90 font-semibold">{server.text}</span>
                <ChevronUp className="w-2 h-2 ml-auto opacity-30 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1 flex items-center justify-center px-3 gap-2 border-r border-current border-opacity-10 h-full overflow-hidden whitespace-nowrap">
                {sync.icon}
                <span className="opacity-90 font-semibold">{sync.text}</span>
            </div>
            <div className={`flex-1 flex items-center justify-end px-3 gap-2 h-full overflow-hidden whitespace-nowrap ${system.isError ? 'bg-red-500/10 text-red-500' : ''}`}>
                <span className="opacity-80 truncate">{system.text}</span>
                {system.icon}
            </div>
        </div>
    );
};

const AtlasView: React.FC<{
  entries: Entry[];
  activeCategory: Category;
  onSelectEntry: (e: Entry) => void;
  themeClasses: any;
  showAll?: boolean;
}> = ({ entries, activeCategory, onSelectEntry, themeClasses, showAll }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) {
             mapInstanceRef.current.remove();
             mapInstanceRef.current = null;
        }

        // @ts-ignore
        if (typeof L === 'undefined') return;

        // @ts-ignore
        const map = L.map(mapContainerRef.current).setView([47.1625, 19.5033], 7);
        
        // @ts-ignore
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
           attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Filter out entries with private location
        const entriesWithGps = (showAll 
            ? entries.filter(e => e.gps)
            : entries).filter(e => !e.isLocationPrivate); 
        
        if (entriesWithGps.length > 0) {
           const bounds: any[] = [];
           for (const e of entriesWithGps) {
               if (e.gps) {
                   const colorClass = CATEGORY_COLORS[e.category];
                   // @ts-ignore
                   const customIcon = L.divIcon({
                       className: 'custom-map-marker', 
                       html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${colorClass}" style="transform: translate(-25%, -25%);"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>`,
                       iconSize: [24, 24],
                       iconAnchor: [12, 12]
                   });

                   // @ts-ignore
                   const marker = L.marker([e.gps.lat, e.gps.lon], { icon: customIcon }).addTo(map);
                   marker.bindPopup(`<b>${e.title || e.dateLabel}</b><br>${e.location || ''}<br>${e.mood || ''}`);
                   marker.on('click', () => onSelectEntry(e));
                   bounds.push([e.gps.lat, e.gps.lon]);
               }
           }
           if (bounds.length > 0) {
               // @ts-ignore
               map.fitBounds(bounds, { padding: [50, 50] });
           }
        }

        mapInstanceRef.current = map;
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        }
    }, [activeCategory, entries, showAll]); 

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden border relative z-0 animate-fade-in" ref={mapContainerRef}></div>
    );
};

const GalleryView: React.FC<{
    entries: Entry[];
    onSelectEntry: (e: Entry) => void;
    themeClasses: any;
    renderActionButtons: (e: Entry) => React.ReactNode;
}> = ({ entries, onSelectEntry, themeClasses, renderActionButtons }) => {
    const entriesWithPhotos = entries.filter(e => e.photo);

    if (entriesWithPhotos.length === 0) return <div className="text-center py-20 opacity-50">Nincsenek feltöltött képek.</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
            {entriesWithPhotos.map(e => (
                <div key={e.id} 
                    className={`aspect-square relative group cursor-pointer overflow-hidden rounded-lg border-2 ${CATEGORY_BORDER_COLORS[e.category]} hover:border-emerald-500 transition-colors`} 
                    onClick={() => onSelectEntry(e)}
                >
                    <img src={e.photo} alt={e.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                         <div className="flex justify-between items-end">
                            <div className="overflow-hidden">
                                <span className="text-white text-xs font-bold truncate block">{e.title || e.dateLabel}</span>
                                <span className="text-white/70 text-[10px] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <div className="flex gap-1" onClick={ev => ev.stopPropagation()}>
                                {renderActionButtons(e)}
                            </div>
                         </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const CalendarView: React.FC<{
    entries: Entry[];
    currentDate: Date;
    onDateChange: (d: Date) => void;
    onSelectEntry: (e: Entry) => void;
    themeClasses: any;
}> = ({ entries, currentDate, onDateChange, onSelectEntry, themeClasses }) => {
    // Determine days in month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    
    // Adjust for Monday start (Monday = 0 in our logic, Sunday = 6)
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const changeMonth = (offset: number) => {
        onDateChange(new Date(year, month + offset, 1));
    };

    const today = new Date();
    const isToday = (d: number) => year === today.getFullYear() && month === today.getMonth() && d === today.getDate();

    const getEntriesForDay = (d: number) => {
        return entries.filter(e => {
            const entryDate = new Date(e.timestamp);
            return entryDate.getFullYear() === year && 
                   entryDate.getMonth() === month && 
                   entryDate.getDate() === d;
        });
    };

    return (
        <div className="animate-fade-in">
            {/* Calendar Header */}
            <div className={`flex items-center justify-between mb-4 p-4 rounded-lg border ${themeClasses.card}`}>
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-black/5 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                <div className="font-bold text-lg capitalize">
                    {currentDate.toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-black/5 rounded-full"><ChevronRight className="w-5 h-5" /></button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold opacity-60">
                <div>H</div><div>K</div><div>Sz</div><div>Cs</div><div>P</div><div>Sz</div><div>V</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square opacity-10"></div>
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEntries = getEntriesForDay(day);
                    const current = isToday(day);
                    
                    return (
                        <div 
                            key={day} 
                            className={`aspect-square rounded-lg border relative flex flex-col items-center justify-start pt-2 transition-all cursor-pointer hover:border-emerald-500/50 ${current ? 'bg-emerald-500/10 border-emerald-500' : themeClasses.card}`}
                            onClick={() => {
                                if (dayEntries.length > 0) onSelectEntry(dayEntries[0]);
                            }}
                        >
                            <span className={`text-xs font-bold ${current ? 'text-emerald-500' : 'opacity-70'}`}>{day}</span>
                            
                            <div className="flex flex-wrap gap-1 justify-center mt-1 px-1">
                                {dayEntries.map(e => (
                                    <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[e.category]}`} title={e.title || e.dateLabel}></div>
                                ))}
                            </div>
                            
                            {dayEntries.length > 0 && dayEntries[0].photo && (
                                <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-400 rounded-full opacity-50" title="Van fotó"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const QuestionManager: React.FC<{
    questions: any[];
    activeCategory: Category;
    onAdd: (text: string) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    themeClasses: any;
}> = ({ questions, activeCategory, onAdd, onToggle, onDelete, themeClasses }) => {
    const [newQText, setNewQText] = useState("");

    const handleAdd = () => {
        if (!newQText.trim()) return;
        onAdd(newQText);
        setNewQText("");
    };

    const filteredQuestions = questions.filter(q => q.category === activeCategory);

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Kérdések kezelése</h3>
            </div>
            
            <div className={`flex gap-2 p-4 rounded-lg border mb-6 ${themeClasses.card}`}>
                <Input 
                    themeClasses={themeClasses} 
                    value={newQText} 
                    onChange={(e: any) => setNewQText(e.target.value)} 
                    placeholder="Írj be egy új kérdést..."
                    onKeyDown={(e: any) => e.key === 'Enter' && handleAdd()}
                />
                <Button onClick={handleAdd} themeClasses={themeClasses} disabled={!newQText.trim()}>
                    <Plus className="w-4 h-4" /> Hozzáadás
                </Button>
            </div>

            <div className="space-y-3">
                {filteredQuestions.map((q: any) => (
                    <div key={q.id} className={`flex items-center justify-between p-4 rounded-lg border ${themeClasses.card}`}>
                        <span className={`text-sm flex-1 mr-4 ${q.isActive ? '' : 'line-through opacity-50'}`}>{q.text}</span>
                        <div className="flex gap-2">
                            <button onClick={() => onToggle(q.id)} className={`text-xs px-3 py-1 rounded font-medium ${q.isActive ? themeClasses.accent + ' bg-black/5' : 'opacity-50 border'}`}>
                                {q.isActive ? 'Aktív' : 'Inaktív'}
                            </button>
                            <button onClick={() => onDelete(q.id)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const DEFAULT_MOODS = ['🔥', '🚀', '🙂', '😐', '😫'];

// --- Modal Definitions ---

const ExportModal: React.FC<{ 
    onClose: () => void, 
    data: AppData, 
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    themeClasses: any,
    currentTheme: ThemeOption 
}> = ({ onClose, data, onImport, themeClasses, currentTheme }) => {
    const [range, setRange] = useState<'all'|'custom'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleExport = (format: 'json' | 'txt' | 'html' | 'wxr') => {
        const filter = range === 'custom' ? {
              start: startDate ? new Date(startDate).getTime() : undefined,
              end: endDate ? new Date(endDate).getTime() + 86400000 : undefined 
        } : {};
        StorageService.exportData(data, format, filter);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <Card themeClasses={themeClasses} className="w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Download className="w-5 h-5" /> Adatkezelés</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className={`block text-xs font-bold uppercase mb-2 ${themeClasses.subtext}`}>Időtartam</label>
                        <div className="flex gap-2 mb-3">
                             <Button type="button" variant={range === 'all' ? 'primary' : 'secondary'} themeClasses={themeClasses} onClick={() => setRange('all')} className="flex-1">Összes</Button>
                             <Button type="button" variant={range === 'custom' ? 'primary' : 'secondary'} themeClasses={themeClasses} onClick={() => setRange('custom')} className="flex-1">Egyéni</Button>
                        </div>
                        {range === 'custom' && (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div>
                                    <span className={`text-xs block mb-1 ${themeClasses.subtext}`}>Kezdet</span>
                                    <Input themeClasses={themeClasses} type="date" value={startDate} onChange={(e:any) => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <span className={`text-xs block mb-1 ${themeClasses.subtext}`}>Vége</span>
                                    <Input themeClasses={themeClasses} type="date" value={endDate} onChange={(e:any) => setEndDate(e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className={`block text-xs font-bold uppercase mb-2 ${themeClasses.subtext}`}>Formátum (Helyi)</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('json')}>JSON (Backup)</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('wxr')}>WordPress (WXR)</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('html')}>HTML (Olvasás)</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('txt')}>TXT (Szöveg)</Button>
                        </div>
                    </div>
                    <div className={`border-t pt-6 ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-200'}`}>
                        <label className={`block text-xs font-bold uppercase mb-2 ${themeClasses.subtext}`}>Importálás</label>
                        <div className="relative group">
                            <input type="file" onChange={onImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".json" />
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors group-hover:bg-black/5 ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-300'}`}>
                                <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                <span className="text-sm font-medium">JSON fájl feltöltése</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

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
}

// --- Server Codes (Node.js vs PHP) ---

const SERVER_CODE_JSCRIPT = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ENTRIES_FILE = path.join(__dirname, 'entries.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const QUESTIONS_FILE = path.join(__dirname, 'questions.json');
const IMG_DIR = path.join(__dirname, 'img');

// Képek mappa létrehozása, ha nem létezik
if (!fs.existsSync(IMG_DIR)){
    fs.mkdirSync(IMG_DIR);
}

// Segédfüggvény JSON válasz küldéséhez
const send = (data, status = 200) => {
    // CGI fejlécek: Content-Type + 2 sortörés
    console.log("Content-Type: application/json; charset=utf-8");
    console.log(""); 
    console.log(JSON.stringify(data));
    process.exit(0);
};

try {
    const uri = process.env.REQUEST_URI || '';
    const method = process.env.REQUEST_METHOD || 'GET';
    
    if (uri.includes('/status')) {
        send({ status: 'online', nodeVersion: process.version, type: 'nodejs' });
    }
    else if (uri.includes('/upload') && method === 'POST') {
        send({ error: "Képfeltöltés Node.js alatt extra könyvtárak nélkül korlátozott. Kérlek használj PHP módot." });
    }
    else if (method === 'GET') {
        let entries = [];
        let settings = {};
        let questions = [];

        if (fs.existsSync(ENTRIES_FILE)) {
            try {
                entries = JSON.parse(fs.readFileSync(ENTRIES_FILE, 'utf8'));
            } catch(e) {}
        }
        if (fs.existsSync(SETTINGS_FILE)) {
            try {
                settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
            } catch(e) {}
        }
        if (fs.existsSync(QUESTIONS_FILE)) {
             try {
                questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
            } catch(e) {}
        }
        
        send({ entries, settings, questions });
    }
    else if (method === 'POST') {
        let body = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => body += chunk);
        process.stdin.on('end', () => {
            try {
                const input = JSON.parse(body);
                if (input.questions) {
                    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(input.questions), 'utf8');
                }
                if (input.entries) {
                    fs.writeFileSync(ENTRIES_FILE, JSON.stringify(input.entries), 'utf8');
                }
                if (input.settings) {
                    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(input.settings), 'utf8');
                }
                send({ success: true });
            } catch (e) {
                console.log("Status: 400 Bad Request");
                send({ error: "Érvénytelen JSON vagy írási hiba: " + e.message });
            }
        });
    }
    else {
        console.log("Status: 405 Method Not Allowed");
        send({ error: "A metódus nem engedélyezett" });
    }
} catch (err) {
    console.log("Status: 500 Internal Server Error");
    send({ error: err.message });
}`;

const SERVER_CODE_HTACCESS_NODE = `Options +ExecCGI
AddHandler cgi-script .jscript
DirectoryIndex index.html

<IfModule mod_rewrite.c>
RewriteEngine On

# Ha alkönyvtárban (pl. /naplo/) fut, vedd ki a kommentet az alábbi sorból:
# RewriteBase /naplo/

# 1. API hívások irányítása az api.jscript felé
RewriteRule ^api/(.*)$ api.jscript [L]

# 2. Meglévő fájlok közvetlen kiszolgálása
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# 3. Minden más -> index.html (kliens oldali routing)
RewriteRule ^ index.html [L]
</IfModule>`;

const SERVER_CODE_PHP = `<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$entriesFile = __DIR__ . '/entries.json';
$settingsFile = __DIR__ . '/settings.json';
$questionsFile = __DIR__ . '/questions.json';
$imgDir = __DIR__ . '/img';

// Képek mappa létrehozása, ha nem létezik
if (!file_exists($imgDir)) {
    mkdir($imgDir, 0755, true);
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

if ($method === 'OPTIONS') { exit(0); }

// Státusz ellenőrzés
if (strpos($uri, '/status') !== false) {
    echo json_encode(['status' => 'online', 'type' => 'php', 'version' => phpversion()]);
    exit;
}

// Képfeltöltés
if (strpos($uri, '/upload') !== false && $method === 'POST') {
    if (!isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nincs képfájl mellékelve']);
        exit;
    }
    
    $file = $_FILES['image'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!in_array($ext, $allowed)) {
        http_response_code(400);
        echo json_encode(['error' => 'Érvénytelen fájltípus']);
        exit;
    }
    
    $filename = uniqid() . '.' . $ext;
    $targetPath = $imgDir . '/' . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Relatív útvonal visszaadása
        echo json_encode(['url' => 'img/' . $filename]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Fájl mentése sikertelen']);
    }
    exit;
}

if ($method === 'GET') {
    $entries = [];
    $settings = [];
    $questions = [];

    if (file_exists($entriesFile)) {
        $content = file_get_contents($entriesFile);
        $decoded = json_decode($content, true);
        if ($decoded) $entries = $decoded;
    }
    if (file_exists($settingsFile)) {
        $content = file_get_contents($settingsFile);
        $decoded = json_decode($content, true);
        if ($decoded) $settings = $decoded;
    }
    if (file_exists($questionsFile)) {
        $content = file_get_contents($questionsFile);
        $decoded = json_decode($content, true);
        if ($decoded) $questions = $decoded;
    }

    echo json_encode([
        'entries' => $entries,
        'settings' => $settings,
        'questions' => $questions
    ]);

} elseif ($method === 'POST') {
    $input = file_get_contents('php://input');
    $json = json_decode($input, true);

    if ($json === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Érvénytelen JSON']);
    } else {
        if (isset($json['questions'])) {
            file_put_contents($questionsFile, json_encode($json['questions']));
        }
        if (isset($json['entries'])) {
            file_put_contents($entriesFile, json_encode($json['entries']));
        }
        if (isset($json['settings'])) {
            file_put_contents($settingsFile, json_encode($json['settings']));
        }

        echo json_encode(['success' => true]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'A metódus nem engedélyezett']);
}
?>`;

const SERVER_CODE_HTACCESS_PHP = `<IfModule mod_rewrite.c>
RewriteEngine On

# Ha alkönyvtárban (pl. /naplo/) fut, vedd ki a kommentet az alábbi sorból:
# RewriteBase /naplo/

# API hívások irányítása az api.php felé
RewriteRule ^api/(.*)$ api.php [L,QSA]

# Meglévő fájlok és könyvtárak közvetlen kiszolgálása
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Minden más kérés irányítása az index.html-re (kliens oldali routing)
RewriteRule ^ index.html [L]
</IfModule>`;

const DeployModal: React.FC<{ onClose: () => void, themeClasses: any }> = ({ onClose, themeClasses }) => {
    const [isZipping, setIsZipping] = useState(false);
    const [activeTab, setActiveTab] = useState<'install' | 'files'>('install');
    const [serverType, setServerType] = useState<'nodejs' | 'php'>('php');

    const handleDownloadSource = async () => {
        setIsZipping(true);
        try {
            // @ts-ignore
            if (typeof window.JSZip === 'undefined') {
                alert("JSZip könyvtár nem töltődött be. Kérlek frissítsd az oldalt, vagy ellenőrizd az internetkapcsolatot.");
                setIsZipping(false);
                return;
            }

            // @ts-ignore
            const zip = new window.JSZip();
            const files = [
                'index.html', 'types.ts', 'constants.ts', 'App.tsx', 'index.tsx', 'style.css', 'package.json', 'services/storage.ts', 'metadata.json'
            ];
            
            await Promise.all(files.map(async (f) => {
                try {
                    const res = await fetch(f);
                    if (!res.ok) throw new Error("File not found");
                    const text = await res.text();
                    zip.file(f, text);
                } catch(e) { console.error(`Failed to load ${f}`, e); }
            }));

            // Add the server files manually to zip
            zip.file('api.jscript', SERVER_CODE_JSCRIPT);
            zip.file('api.php', SERVER_CODE_PHP);
            
            // Add separate empty JSON files structure
            zip.file('entries.json', '[]');
            zip.file('settings.json', '{}');
            zip.file('questions.json', JSON.stringify(DEFAULT_QUESTIONS));
            
            // Choose .htaccess based on selected server type (or include both)
            zip.file('.htaccess', serverType === 'php' ? SERVER_CODE_HTACCESS_PHP : SERVER_CODE_HTACCESS_NODE);

            const content = await zip.generateAsync({type:"blob"});
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = "grind-naplo-source.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch(e) {
            console.error(e);
            alert("Hiba a tömörítés során. (Ellenőrizd a konzolt a részletekért)");
        } finally {
            setIsZipping(false);
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Vágólapra másolva!");
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <Card themeClasses={themeClasses} className="w-full max-w-2xl p-0 shadow-2xl relative flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500"><Server className="w-6 h-6" /></div>
                        <div>
                            <h3 className="text-xl font-bold">Grind Napló Telepítése</h3>
                            <p className={`text-xs ${themeClasses.subtext}`}>Verzió 2.6 (Saját Szerver)</p>
                        </div>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                </div>

                <div className="flex border-b border-white/10">
                    <button onClick={() => setActiveTab('install')} className={`flex-1 p-3 text-sm font-bold ${activeTab === 'install' ? 'bg-white/5 text-emerald-500 border-b-2 border-emerald-500' : 'opacity-60'}`}>Útmutató</button>
                    <button onClick={() => setActiveTab('files')} className={`flex-1 p-3 text-sm font-bold ${activeTab === 'files' ? 'bg-white/5 text-emerald-500 border-b-2 border-emerald-500' : 'opacity-60'}`}>Szerver Fájlok</button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {activeTab === 'install' ? (
                        <div className="space-y-6">
                            <div>
                                <h4 className={`text-sm font-bold uppercase mb-2 ${themeClasses.accent}`}>Futtatás saját szerveren</h4>
                                <ol className={`text-sm space-y-2 list-decimal pl-4 ${themeClasses.subtext}`}>
                                    <li>Készíts egy mappát a szerveren (pl. <code>/naplo</code>).</li>
                                    <li>Töltsd le a teljes forráskódot (ZIP) és csomagold ki.</li>
                                    <li>Ellenőrizd, hogy az <code>img</code> mappa létrejön-e, és írható-e (CHMOD 755/777).</li>
                                    <li>
                                        Döntsd el a backend típusát:
                                        <ul className="list-disc pl-4 mt-1 opacity-80">
                                            <li><strong>Node.js:</strong> Használd az <code>api.jscript</code> fájlt (CHMOD 755!) és a hozzá tartozó <code>.htaccess</code>-t.</li>
                                            <li><strong>PHP:</strong> Használd az <code>api.php</code> fájlt és a PHP-hez való <code>.htaccess</code> kódot.</li>
                                        </ul>
                                    </li>
                                    <li>Mentsd el a választott kódokat a "Szerver Fájlok" fülről a megfelelő fájlneveken.</li>
                                </ol>
                                <p className="text-xs mt-2 italic opacity-70">Az adatok mostantól külön fájlokba (<code>entries.json</code>, <code>settings.json</code>) mentődnek a mappán belül.</p>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <Button onClick={handleDownloadSource} themeClasses={themeClasses} className="w-full" disabled={isZipping}>
                                    {isZipping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
                                    {isZipping ? "Csomagolás..." : "Teljes Forráskód Letöltése (.zip)"}
                                </Button>
                                <p className="text-[10px] text-center mt-2 opacity-50">Adatok (bejegyzések) nélkül</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                             {/* Backend Switcher */}
                             <div className="flex justify-center mb-6 bg-black/20 p-1 rounded-lg">
                                 <button 
                                    onClick={() => setServerType('nodejs')}
                                    className={`flex-1 py-1.5 px-4 rounded-md text-xs font-bold transition-all ${serverType === 'nodejs' ? 'bg-emerald-600 text-white shadow' : 'opacity-50 hover:opacity-100'}`}
                                 >
                                     Node.js (CGI)
                                 </button>
                                 <button 
                                    onClick={() => setServerType('php')}
                                    className={`flex-1 py-1.5 px-4 rounded-md text-xs font-bold transition-all ${serverType === 'php' ? 'bg-blue-600 text-white shadow' : 'opacity-50 hover:opacity-100'}`}
                                 >
                                     PHP (Standard)
                                 </button>
                             </div>

                             {serverType === 'nodejs' ? (
                                 <>
                                     {/* API JSCRIPT */}
                                     <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className={`text-sm font-bold uppercase ${themeClasses.accent}`}>api.jscript</label>
                                            <Button size="sm" variant="secondary" themeClasses={themeClasses} onClick={() => copyToClipboard(SERVER_CODE_JSCRIPT)}>
                                                <Copy className="w-3 h-3" /> Másolás
                                            </Button>
                                        </div>
                                        <div className="relative">
                                            <pre className="bg-black/20 p-4 rounded-lg text-[10px] md:text-xs overflow-x-auto border border-white/10 max-h-48 overflow-y-auto">
                                                <code>{SERVER_CODE_JSCRIPT}</code>
                                            </pre>
                                            <div className="absolute top-2 right-2 text-[10px] bg-red-500/20 text-red-400 px-2 rounded">CHMOD 755 kötelező!</div>
                                        </div>
                                     </div>

                                     {/* HTACCESS NODE */}
                                     <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className={`text-sm font-bold uppercase ${themeClasses.accent}`}>.htaccess (Node)</label>
                                            <Button size="sm" variant="secondary" themeClasses={themeClasses} onClick={() => copyToClipboard(SERVER_CODE_HTACCESS_NODE)}>
                                                <Copy className="w-3 h-3" /> Másolás
                                            </Button>
                                        </div>
                                        <pre className="bg-black/20 p-4 rounded-lg text-[10px] md:text-xs overflow-x-auto border border-white/10">
                                            <code>{SERVER_CODE_HTACCESS_NODE}</code>
                                        </pre>
                                     </div>
                                 </>
                             ) : (
                                 <>
                                     {/* API PHP */}
                                     <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold uppercase text-blue-400">api.php</label>
                                            <Button size="sm" variant="secondary" themeClasses={themeClasses} onClick={() => copyToClipboard(SERVER_CODE_PHP)}>
                                                <Copy className="w-3 h-3" /> Másolás
                                            </Button>
                                        </div>
                                        <div className="relative">
                                            <pre className="bg-black/20 p-4 rounded-lg text-[10px] md:text-xs overflow-x-auto border border-white/10 max-h-48 overflow-y-auto">
                                                <code>{SERVER_CODE_PHP}</code>
                                            </pre>
                                        </div>
                                     </div>

                                     {/* HTACCESS PHP */}
                                     <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold uppercase text-blue-400">.htaccess (PHP)</label>
                                            <Button size="sm" variant="secondary" themeClasses={themeClasses} onClick={() => copyToClipboard(SERVER_CODE_HTACCESS_PHP)}>
                                                <Copy className="w-3 h-3" /> Másolás
                                            </Button>
                                        </div>
                                        <pre className="bg-black/20 p-4 rounded-lg text-[10px] md:text-xs overflow-x-auto border border-white/10">
                                            <code>{SERVER_CODE_HTACCESS_PHP}</code>
                                        </pre>
                                     </div>
                                 </>
                             )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

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

  const CalendarView: React.FC<{
    entries: Entry[];
    currentDate: Date;
    onDateChange: (d: Date) => void;
    onSelectEntry: (e: Entry) => void;
    themeClasses: any;
}> = ({ entries, currentDate, onDateChange, onSelectEntry, themeClasses }) => {
    // Determine days in month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    
    // Adjust for Monday start (Monday = 0 in our logic, Sunday = 6)
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const changeMonth = (offset: number) => {
        onDateChange(new Date(year, month + offset, 1));
    };

    const today = new Date();
    const isToday = (d: number) => year === today.getFullYear() && month === today.getMonth() && d === today.getDate();

    const getEntriesForDay = (d: number) => {
        return entries.filter(e => {
            const entryDate = new Date(e.timestamp);
            return entryDate.getFullYear() === year && 
                   entryDate.getMonth() === month && 
                   entryDate.getDate() === d;
        });
    };

    return (
        <div className="animate-fade-in">
            {/* Calendar Header */}
            <div className={`flex items-center justify-between mb-4 p-4 rounded-lg border ${themeClasses.card}`}>
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-black/5 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                <div className="font-bold text-lg capitalize">
                    {currentDate.toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-black/5 rounded-full"><ChevronRight className="w-5 h-5" /></button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold opacity-60">
                <div>H</div><div>K</div><div>Sz</div><div>Cs</div><div>P</div><div>Sz</div><div>V</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square opacity-10"></div>
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEntries = getEntriesForDay(day);
                    const current = isToday(day);
                    
                    return (
                        <div 
                            key={day} 
                            className={`aspect-square rounded-lg border relative flex flex-col items-center justify-start pt-2 transition-all cursor-pointer hover:border-emerald-500/50 ${current ? 'bg-emerald-500/10 border-emerald-500' : themeClasses.card}`}
                            onClick={() => {
                                if (dayEntries.length > 0) onSelectEntry(dayEntries[0]);
                            }}
                        >
                            <span className={`text-xs font-bold ${current ? 'text-emerald-500' : 'opacity-70'}`}>{day}</span>
                            
                            <div className="flex flex-wrap gap-1 justify-center mt-1 px-1">
                                {dayEntries.map(e => (
                                    <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[e.category]}`} title={e.title || e.dateLabel}></div>
                                ))}
                            </div>
                            
                            {dayEntries.length > 0 && dayEntries[0].photo && (
                                <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-400 rounded-full opacity-50" title="Van fotó"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

  // --- Views ---

  const renderEntryForm = () => {
    const entryQuestionIds = Object.keys(currentEntry.responses || {});
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
                                            <p className="whitespace-pre-wrap">{ans}</p>
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