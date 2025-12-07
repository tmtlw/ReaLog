import React, { useRef, useState } from 'react';
import { 
  PenTool, X, List, Grid as GridIcon, RefreshCw, MapPin, 
  Image as ImageIcon, ThermometerSun, Bold, Italic, Underline, 
  Link as LinkIcon, Lock, Unlock, Save, Eye, EyeOff
} from 'lucide-react';
import { Entry, Category, WeatherData, AppSettings, Question } from '../../types';
import { Button, Input } from '../ui';
import { DEFAULT_MOODS } from '../../constants';
import * as StorageService from '../../services/storage';

interface EntryEditorProps {
    currentEntry: Partial<Entry>;
    onChange: (entry: Partial<Entry>) => void;
    onSave: () => void;
    onCancel: () => void;
    activeCategory: Category;
    questions: Question[];
    settings: AppSettings | undefined;
    themeClasses: any;
    currentTheme: string;
    locationParts: string[];
    setLocationParts: React.Dispatch<React.SetStateAction<string[]>>;
    serverMode: boolean;
}

const EntryEditor: React.FC<EntryEditorProps> = ({
    currentEntry, onChange, onSave, onCancel, activeCategory, questions, settings, themeClasses, currentTheme,
    locationParts, setLocationParts, serverMode
}) => {
    const [editorLayout, setEditorLayout] = useState<'list' | 'grid'>('list');
    const [isFetchingWeather, setIsFetchingWeather] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const entryQuestionIds = Object.keys(currentEntry.responses || {});
    const availableQuestions = questions.filter(q => q.category === activeCategory && !entryQuestionIds.includes(q.id));
    const activeMoods = settings?.moods && settings.moods.length > 0 ? settings.moods : DEFAULT_MOODS;

    const addQuestionToEntry = (questionId: string) => {
        if (!questionId) return;
        onChange({ ...currentEntry, responses: { ...currentEntry.responses, [questionId]: "" } });
    };

    const removeQuestionFromEntry = (questionId: string) => {
        const newResponses = { ...currentEntry.responses };
        delete newResponses[questionId];
        onChange({ ...currentEntry, responses: newResponses });
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
            newLabel = val.replace('-W', ' W'); 
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

        onChange({
            ...currentEntry,
            timestamp: newTimestamp,
            dateLabel: newLabel
        });
    };

    const getDateInputValue = () => {
        if (!currentEntry.timestamp && !currentEntry.dateLabel) return "";
        
        if (activeCategory === Category.DAILY) {
            const d = new Date(currentEntry.timestamp || Date.now());
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
        }
        if (activeCategory === Category.WEEKLY) {
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
            insertion = tag;
        }
  
        if (tag === '<a href="') {
            const url = prompt("Add meg a linket:", "https://");
            if (url) {
                insertion = `<a href="${url}" target="_blank">${selected || 'link'}</a>`;
            } else {
                return;
            }
        }
  
        const newText = text.substring(0, start) + insertion + text.substring(end);
        onChange({ ...currentEntry, freeTextContent: newText });
        
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + insertion.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
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
                            if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
                            if (addr.road) parts.push(addr.road);
                            if (addr.house_number) parts.push(addr.house_number);
                            if (geoData.name && geoData.name !== addr.road) parts.push(geoData.name); 
                        }
                    }
                } catch(e) { console.warn("Reverse geocode failed", e); }
    
                setLocationParts([...new Set(parts)].filter(Boolean));
    
                if (settings?.openWeatherMapKey) {
                    try {
                        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${settings?.openWeatherMapKey}&units=metric&lang=hu`);
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
                
                const newData = { ...currentEntry };
                newData.gps = { lat: latitude, lon: longitude };
                if (weatherInfo) newData.weather = weatherInfo;
                onChange(newData);
    
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
                    onChange({ ...currentEntry, photo: url });
                } catch (err: any) {
                    console.error(err);
                    alert("Hiba a feltöltés során: " + err.message);
                }
            } else {
                const reader = new FileReader();
                reader.onloadend = () => onChange({ ...currentEntry, photo: reader.result as string });
                reader.readAsDataURL(file);
            }
        }
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
                <Button variant="ghost" themeClasses={themeClasses} onClick={onCancel}>
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
                    onChange={(e: any) => onChange({...currentEntry, title: e.target.value})} 
                    placeholder="Adj címet..."
                />
            </div>
            <div>
                 <label className={`block text-xs font-medium mb-1 uppercase ${themeClasses.subtext}`}>Hangulat</label>
                 <div className="grid grid-cols-5 gap-1">
                     {activeMoods.map((m, idx) => (
                         <button 
                            key={idx} 
                            onClick={() => onChange({...currentEntry, mood: m})}
                            className={`text-xl p-2 rounded-lg transition-colors flex items-center justify-center ${currentEntry.mood === m ? 'bg-black/10 ring-1' : 'hover:bg-black/5'}`}
                         >
                             {m}
                         </button>
                     ))}
                 </div>
            </div>
        </div>

        <div className={`flex rounded-lg p-1 border mb-4 ${currentTheme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
            <button 
                onClick={() => onChange({ ...currentEntry, entryMode: 'structured' })}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${currentEntry.entryMode !== 'free' ? 'bg-white shadow text-black' : 'opacity-50 hover:opacity-80'}`}
            >
                Kérdések (Grind)
            </button>
            <button 
                onClick={() => onChange({ ...currentEntry, entryMode: 'free' })}
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
                                onClick={() => onChange({...currentEntry, location: undefined})}
                                className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"
                                title="Helyszín törlése"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
                
                {(locationParts.length > 0 || currentEntry.location) && (
                    <button 
                        onClick={() => onChange({...currentEntry, isLocationPrivate: !currentEntry.isLocationPrivate})}
                        className={`p-2 rounded-full border transition-all ${currentEntry.isLocationPrivate ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-black/5 border-transparent opacity-50 hover:opacity-100'}`}
                        title={currentEntry.isLocationPrivate ? "Helyszín privát (Térképen nem látszik)" : "Helyszín publikus"}
                    >
                        {currentEntry.isLocationPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
            {currentEntry.weather && (
                <div className={`flex items-center gap-2 pl-3 pr-2 py-1 rounded-full text-xs font-medium border ${themeClasses.card}`}>
                    <ThermometerSun className="w-4 h-4 text-orange-400" />
                    {currentEntry.weather.icon && (
                        <img src={`https://openweathermap.org/img/wn/${currentEntry.weather.icon}.png`} alt="weather icon" className="w-6 h-6" />
                    )}
                    <span>{currentEntry.weather.temp}°C, {currentEntry.weather.condition}</span>
                    <button 
                         onClick={() => onChange({...currentEntry, weather: undefined})}
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
                <button onClick={() => onChange({...currentEntry, photo: undefined})} className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        <div className="space-y-4">
             {currentEntry.entryMode === 'free' ? (
                 <div className={`border rounded-lg overflow-hidden ${themeClasses.card}`}>
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
                        onChange={(e) => onChange({ ...currentEntry, freeTextContent: e.target.value })}
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
                            const q = questions.find(quest => quest.id === qId);
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
                                        onChange={(e) => onChange({ ...currentEntry, responses: { ...currentEntry.responses, [qId]: e.target.value } })}
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
              <button 
                onClick={() => onChange({...currentEntry, isPrivate: !currentEntry.isPrivate})}
                className={`px-3 rounded-lg border flex items-center justify-center transition-all ${currentEntry.isPrivate ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-current opacity-30 hover:opacity-80'}`}
                title={currentEntry.isPrivate ? "Privát bejegyzés (Csak admin látja)" : "Publikus bejegyzés"}
              >
                  {currentEntry.isPrivate ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </button>
              <Button onClick={onSave} themeClasses={themeClasses} className="flex-1">
                <Save className="w-4 h-4" /> Mentés
              </Button>
          </div>
        </div>
      </div>
    );
};

export default EntryEditor;