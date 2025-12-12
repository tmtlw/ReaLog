
import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, X, List, Grid as GridIcon, RefreshCw, MapPin, 
  Image as ImageIcon, ThermometerSun, Lock, Unlock, Save, Eye, EyeOff, Trash2, CalendarClock,
  FileText, ChevronLeft, ChevronRight, Plus, Search, AlignLeft, User
} from 'lucide-react';
import { Entry, Category, WeatherData, AppSettings, Question, Template, WeatherIconPack, EmojiStyle, SavedLocation } from '../../types';
import { Button, Input } from '../ui';
import * as StorageService from '../../services/storage';
import TemplateModal from '../modals/TemplateModal';
import LocationPickerModal from '../modals/LocationPickerModal';
import RichTextEditor from '../ui/RichTextEditor';
import WeatherRenderer from '../ui/WeatherRenderer';
import EmojiRenderer from '../ui/EmojiRenderer';
import AtlasView from '../views/AtlasView'; 

const EXTENDED_EMOJIS = {
    "Hangulat": ['🙂', '😃', '😄', '😆', '😅', '😂', '🤣', '😊', '😇', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'],
    "Aktivitás": ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥊', '🥋', '🥅', '⛳', '⛸', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌', '🎯', '🎮', '🎰', '🎲', '🧩', '🧸', '♠', '♥', '♦', '♣', '♟', '🃏', '🀄', '🎴', '🎭', '🖼', '🎨', '🧵', '🧶'],
    "Munka & Suli": ['💼', '🎓', '📚', '💻', '🖥', '🖨', '⌨', '🖱', '🖲', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞', '📽', '🎬', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯', '💡', '🔦', '🏮', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞', '📑', '🔖', '🏷', '💰', '💴', '💵', '💶', '', '💸', '💳', '🧾', '✉', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳', '✏', '✒', '🖋', '🖊', '🖌', '🖍', '📝', '📅', '📆', '🗓', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇', '📏', '📐', '✂', '🗃', '🗄', '🗑', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝', '🔨', '🪒', '⛏', '⚒', '🛠', '🗡', '⚔', '🔫', '🏹', '🛡', '🔧', '🔩', '⚙', '🗜', '⚖', '🔗', '⛓', '🧰', '🧲', '⚗', '🧪', '🧫', '🧬', '🔬', '🔭', '📡', '💉', '💊', '🚪', '🛏', '🛋', '🚽', '🚿', '🛁', '🪒', '🧴', '🧷', '🧹', '🧺', '🧻', '🧼', '🧽', '🧯', '🛒'],
    "Étel & Ital": ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍎', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🍶', '🧉', '🧊', '🥢', '🍽', '🍴', '🥄', '🔪', '🏺'],
    "Természet": ['🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌛', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄', '💥', '🔥', '🌪', '🌈', '☀', '⭐', '☄', '☁', '⛅', '⛈', '🌤', '🌥', '🌦', '🌧', '🌨', '🌩', '🌪', '🌫', '💧', '💦', '☂'],
    "Szimbólumok": ['❤', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮', '✝', '☪', '🕉', '☸', '✡', '🔯', '🕎', '☯', '☦', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛', '🉑', '☢', '☣', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷', '✴', '🆚', '💮', '🉐', '㊙', '㊗', '🈴', '🈵', '🈹', '🈲', '🅰', '🅱', '🆎', '🆑', '🅾', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼', '⁉', '🔅', '🔆', '〽', '⚠', '🚸', '🔱', '⚜', '🔰', '♻', '✅', '🈯', '💹', '❇', '✳', '❎', '🌐', '💠', 'Ⓜ', '🌀', '💤', '🏧', '🚾', '♿', '🅿', '🈳', '🈂', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏', '▶', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀', '🔼', '🔽', '➡', '⬅', '⬆', '⬇', '↗', '↘', '↙', '↖', '↕', '↔', '↪', '↩', '⤴', '⤵', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖', '♾', '💲', '💱', '™', '©', '®', '〰', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔', '☑', '🔘', '⚪', '⚫', '🔴', '🔵', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪', '▫', '◾', '◽', '◼', '◻', '⬛', '⬜', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁‍🗨', '💬', '💭', '🗯', '♠', '♣', '♥', '♦', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
};

interface EntryEditorProps {
    entry: Partial<Entry>;
    onChange: (entry: Partial<Entry>) => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete?: () => void;
    activeCategory: Category;
    questions: Question[];
    settings: AppSettings | undefined;
    templates?: Template[];
    onSaveTemplate?: (name: string, questions: string[], isDefault: boolean) => void;
    onDeleteTemplate?: (id: string) => void;
    onUpdateSettings?: (newSettings: Partial<AppSettings>) => void;
    themeClasses: any;
    currentTheme: string;
    serverMode: boolean;
    t: (key: string) => string;
    currentLang?: string;
    locationParts: string[];
    setLocationParts: React.Dispatch<React.SetStateAction<string[]>>;
    entries: Entry[];
}

const EntryEditor: React.FC<EntryEditorProps> = ({
    entry: currentEntry, onChange, onSave, onCancel, onDelete, activeCategory, questions, settings, 
    templates, onSaveTemplate, onDeleteTemplate, onUpdateSettings, themeClasses, currentTheme,
    serverMode, t, currentLang = 'hu', locationParts, setLocationParts, entries
}) => {
    const [editorLayout, setEditorLayout] = useState<'list' | 'grid'>('grid');
    const [isFetchingWeather, setIsFetchingWeather] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiSearch, setEmojiSearch] = useState("");
    const emojiContainerRef = useRef<HTMLDivElement>(null);
    const [customEmojiSlot, setCustomEmojiSlot] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const datePickerRef = useRef<HTMLInputElement>(null);

    const weatherPack: WeatherIconPack = settings?.weatherIconPack || 'outline';
    const emojiStyle: EmojiStyle = settings?.emojiStyle || 'native';

    const isDark = themeClasses.bg.includes('900') || themeClasses.bg.includes('950') || themeClasses.bg.includes('black');

    const wordCount = React.useMemo(() => {
        const text = (currentEntry.freeTextContent || '') + Object.values(currentEntry.responses || {}).join(' ');
        if (!text.trim()) return 0;
        return text.trim().split(/\s+/).length;
    }, [currentEntry.freeTextContent, currentEntry.responses]);

    const isWordCountLow = settings?.minWordCount && wordCount < settings.minWordCount;
    const progressPercent = settings?.minWordCount ? Math.min(100, (wordCount / settings.minWordCount) * 100) : 0;
    const isGoalMet = progressPercent >= 100;

    useEffect(() => {
        if (currentEntry?.location && locationParts.length === 0) {
            setLocationParts(currentEntry.location.split(', '));
        }
    }, [currentEntry?.id]);

    useEffect(() => {
        if (currentEntry) {
            let updates: Partial<Entry> = {};
            let hasUpdates = false;
            if (currentEntry.photo && (!currentEntry.photos || currentEntry.photos.length === 0)) {
                updates.photos = [currentEntry.photo];
                hasUpdates = true;
            } else if (!currentEntry.photos) {
                updates.photos = [];
                hasUpdates = true;
            }
            if (hasUpdates) {
                onChange({ ...currentEntry, ...updates });
            }
        }
    }, []);

    useEffect(() => {
        if (!currentEntry) return;
        if (locationParts.length > 0) {
            const locString = locationParts.join(', ');
            if (currentEntry.location !== locString) {
                onChange({ ...currentEntry, location: locString });
            }
        } else if (currentEntry.location && locationParts.length === 0) {
             if (isEditing()) {
                 // Clear both location string and GPS if parts are removed
                 onChange({ ...currentEntry, location: undefined, gps: undefined });
             }
        }
    }, [locationParts]);

    const isEditing = () => locationParts.length > 0 || currentEntry.location;

    if (!currentEntry) return null;

    const entryQuestionIds = Object.keys(currentEntry.responses || {});
    const availableQuestions = questions.filter(q => q.category === activeCategory && !entryQuestionIds.includes(q.id));
    
    const moodCounts = entries.reduce((acc, e) => {
        if(e.mood) acc[e.mood] = (acc[e.mood] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const sortedMoods = Object.entries(moodCounts).sort((a,b) => (b[1] as number) - (a[1] as number)).map(x => x[0]);
    const top4Moods = sortedMoods.slice(0, 4);
    const DEFAULT_DEFAULTS = ['🔥', '🚀', '🙂', '😐', '😫'];
    for (const d of DEFAULT_DEFAULTS) {
        if (top4Moods.length < 4 && !top4Moods.includes(d)) top4Moods.push(d);
    }

    useEffect(() => {
        if (currentEntry.mood && !top4Moods.includes(currentEntry.mood)) {
            setCustomEmojiSlot(currentEntry.mood);
        }
    }, [currentEntry.mood]);

    const addQuestionToEntry = (questionId: string) => {
        if (!questionId) return;
        onChange({ ...currentEntry, responses: { ...currentEntry.responses, [questionId]: "" } });
    };

    const removeQuestionFromEntry = (questionId: string) => {
        const newResponses = { ...currentEntry.responses };
        delete newResponses[questionId];
        onChange({ ...currentEntry, responses: newResponses });
    };

    const handleApplyTemplate = (templateQuestions: string[]) => {
        const newResponses: Record<string, string> = {};
        templateQuestions.forEach((qText, index) => {
            const existingQ = questions.find(q => q.text === qText && q.category === activeCategory);
            if (existingQ) {
                newResponses[existingQ.id] = "";
            } else {
                console.warn(`Question "${qText}" not found in global list for this category.`);
            }
        });
        onChange({ ...currentEntry, responses: newResponses });
    };

    const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) return;
        let newTimestamp = Date.now();
        let newLabel = val;
        if (activeCategory === Category.DAILY) {
            newLabel = val.split('T')[0];
            newTimestamp = new Date(val).getTime();
        } else if (activeCategory === Category.WEEKLY) {
            newLabel = val.replace('-W', ' W'); 
            const [y, w] = val.split('-W');
            const year = parseInt(y);
            const week = parseInt(w);
            const simpleDate = new Date(year, 0, (week - 1) * 7 + 4); 
            const dayNum = simpleDate.getDay() || 7; 
            simpleDate.setDate(simpleDate.getDate() + (7 - dayNum)); 
            simpleDate.setHours(23, 59, 59, 999);
            newTimestamp = simpleDate.getTime();
        } else if (activeCategory === Category.MONTHLY) {
            newLabel = val;
            const [y, m] = val.split('-').map(Number);
            const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);
            newTimestamp = endOfMonth.getTime();
        } else if (activeCategory === Category.YEARLY) {
            newLabel = val;
            const y = parseInt(val);
            const endOfYear = new Date(y, 11, 31, 23, 59, 59, 999);
            newTimestamp = endOfYear.getTime();
        }
        onChange({ ...currentEntry, timestamp: newTimestamp, dateLabel: newLabel });
    };

    const handlePickerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        try {
            if (datePickerRef.current) {
                // @ts-ignore
                if (typeof datePickerRef.current.showPicker === 'function') datePickerRef.current.showPicker();
                else datePickerRef.current.click();
            }
        } catch (err) { }
    };

    const getPickerValue = () => {
        if (!currentEntry.timestamp) return "";
        const d = new Date(currentEntry.timestamp);
        const local = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
        if (activeCategory === Category.DAILY) return local.toISOString().slice(0, 16);
        if (activeCategory === Category.WEEKLY) {
             if (currentEntry.dateLabel?.includes(' W')) return currentEntry.dateLabel.replace(' W', '-W');
             return "";
        }
        if (activeCategory === Category.MONTHLY) return local.toISOString().slice(0, 7); 
        if (activeCategory === Category.YEARLY) return local.getFullYear().toString();
        return "";
    };

    const getDisplayDate = () => {
        if (!currentEntry.timestamp) return "";
        const d = new Date(currentEntry.timestamp);
        if (activeCategory === Category.DAILY) {
            return d.toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'});
        }
        return currentEntry.dateLabel || "";
    };

    const fetchWeatherForLocation = async (lat: number, lon: number): Promise<WeatherData | null> => {
        if (!settings?.openWeatherMapKey) return null;
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${settings?.openWeatherMapKey}&units=metric&lang=${currentLang}`);
            if (res.ok) {
                const forecastData = await res.json();
                const todayStr = new Date().toISOString().split('T')[0];
                const todayItems = forecastData.list.filter((item: any) => {
                    const itemDate = new Date(item.dt * 1000);
                    return itemDate.toISOString().split('T')[0] === todayStr;
                });
                const itemsToUse = todayItems.length > 0 ? todayItems : [forecastData.list[0]];
                const maxTemp = Math.round(Math.max(...itemsToUse.map((i: any) => i.main.temp)));
                const mainItem = itemsToUse[Math.floor(itemsToUse.length / 2)] || itemsToUse[0];
                return {
                    temp: maxTemp,
                    condition: mainItem.weather[0].description,
                    location: forecastData.city.name, 
                    icon: mainItem.weather[0].icon
                };
            }
        } catch(e) { console.warn("Weather forecast failed", e); }
        return null;
    };

    const handleLocationSelect = async (lat: number, lon: number, displayName: string) => {
        setIsFetchingWeather(true);
        setLocationParts([displayName]);
        let weatherInfo = await fetchWeatherForLocation(lat, lon);
        const newData = { ...currentEntry };
        newData.gps = { lat, lon };
        newData.location = displayName;
        if (weatherInfo) newData.weather = weatherInfo;
        onChange(newData);
        setIsFetchingWeather(false);
    };

    const handleSaveSavedLocation = (loc: SavedLocation) => {
        if (onUpdateSettings && settings) {
            const currentSaved = settings.savedLocations || [];
            onUpdateSettings({ savedLocations: [...currentSaved, loc] });
        }
    };

    const handleDeleteSavedLocation = (id: string) => {
        if (onUpdateSettings && settings && confirm(t('common.confirm_delete'))) {
            const currentSaved = settings.savedLocations || [];
            onUpdateSettings({ savedLocations: currentSaved.filter(l => l.id !== id) });
        }
    };

    const scrollToCategory = (category: string) => {
        if (!emojiContainerRef.current) return;
        const categoryEl = document.getElementById(`emoji-cat-${category}`);
        if (categoryEl) {
            const containerTop = emojiContainerRef.current.getBoundingClientRect().top;
            const elTop = categoryEl.getBoundingClientRect().top;
            const offset = elTop - containerTop + emojiContainerRef.current.scrollTop;
            emojiContainerRef.current.scrollTo({ top: offset, behavior: 'smooth' });
        }
    };

    const handleMultiplePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsUploading(true);
        const newPhotos: string[] = [];
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 1024 * 1024 * 5) { alert(`${file.name}: ${t('app.file_too_large')}`); continue; }
                if (serverMode) {
                    try { const url = await StorageService.uploadImage(file); newPhotos.push(url); } catch (err: any) { console.error(err); alert(`${file.name}: ${t('app.upload_error')}`); }
                } else {
                    const result = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });
                    newPhotos.push(result);
                }
            }
            const currentPhotos = currentEntry.photos || [];
            const updatedPhotos = [...currentPhotos, ...newPhotos];
            onChange({ ...currentEntry, photos: updatedPhotos, photo: updatedPhotos[0] });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removePhoto = (index: number) => {
        const currentPhotos = [...(currentEntry.photos || [])];
        currentPhotos.splice(index, 1);
        onChange({ ...currentEntry, photos: currentPhotos, photo: currentPhotos.length > 0 ? currentPhotos[0] : undefined });
    };

    const movePhoto = (index: number, direction: 'left' | 'right') => {
        const currentPhotos = [...(currentEntry.photos || [])];
        if (direction === 'left' && index > 0) {
            [currentPhotos[index - 1], currentPhotos[index]] = [currentPhotos[index], currentPhotos[index - 1]];
        } else if (direction === 'right' && index < currentPhotos.length - 1) {
            [currentPhotos[index], currentPhotos[index + 1]] = [currentPhotos[index + 1], currentPhotos[index]];
        }
        onChange({ ...currentEntry, photos: currentPhotos, photo: currentPhotos[0] });
    };

    const handleCancel = () => {
        if (confirm(t('common.confirm_discard_changes'))) {
            onCancel();
        }
    };

    const displayLocationParts = locationParts.length > 0 ? locationParts : (currentEntry.location ? [currentEntry.location] : []);

    return (
        <div className="space-y-6 animate-fade-in pb-24">
        <div className={`flex items-center justify-between mb-4 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'} pb-4`}>
            <div className={`flex items-center gap-2 ${themeClasses.accent}`}>
                <PenTool className="w-5 h-5 flex-shrink-0" />
                <div className="flex items-center gap-2 relative group">
                    <span className={`font-bold text-lg border-b border-dashed border-current ${themeClasses.text}`}>{getDisplayDate()}</span>
                    <div className="relative overflow-hidden p-1 hover:bg-black/10 rounded transition-colors opacity-60 hover:opacity-100 cursor-pointer" onClick={handlePickerClick}>
                        <CalendarClock className="w-4 h-4" />
                        <input 
                            ref={datePickerRef}
                            type={activeCategory === Category.DAILY ? 'datetime-local' : activeCategory === Category.WEEKLY ? 'week' : activeCategory === Category.MONTHLY ? 'month' : 'number'}
                            min={activeCategory === Category.YEARLY ? "1900" : undefined}
                            max={activeCategory === Category.YEARLY ? "2100" : undefined}
                            value={getPickerValue()}
                            onChange={handleNativeDateChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            title="Válassz dátumot"
                        />
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                 {currentEntry.entryMode === 'structured' && (
                     <div className={`hidden md:flex rounded-lg p-1 border mr-2 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                        <button type="button" onClick={() => setEditorLayout('list')} className={`p-1.5 rounded ${editorLayout === 'list' ? 'bg-white/10 shadow' : 'opacity-50'}`}><List className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setEditorLayout('grid')} className={`p-1.5 rounded ${editorLayout === 'grid' ? 'bg-white/10 shadow' : 'opacity-50'}`}><GridIcon className="w-4 h-4" /></button>
                     </div>
                 )}
                <Button type="button" variant="ghost" themeClasses={themeClasses} onClick={handleCancel}>
                    <X className="w-5 h-5" /> {t('editor.cancel')}
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={`block text-xs font-medium mb-1 uppercase ${themeClasses.subtext}`}>{t('editor.title')}</label>
                <Input themeClasses={themeClasses} value={currentEntry.title || ''} onChange={(e: any) => onChange({...currentEntry, title: e.target.value})} placeholder={t('editor.title_placeholder')} />
            </div>
            <div>
                 <label className={`block text-xs font-medium mb-1 uppercase ${themeClasses.subtext}`}>{t('editor.mood')}</label>
                 <div className="grid grid-cols-5 gap-1 relative">
                     {top4Moods.map((m, idx) => (
                         <button 
                            type="button" key={idx} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange({...currentEntry, mood: m}); }}
                            className={`text-xl p-2 rounded-lg transition-colors flex items-center justify-center ${currentEntry.mood === m ? 'bg-black/10 ring-1' : 'hover:bg-black/5'}`}
                         >
                             <EmojiRenderer emoji={m} style={emojiStyle} className="pointer-events-none" />
                         </button>
                     ))}
                     <div className="relative">
                         <button 
                            type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
                            className={`w-full h-full text-xl p-2 rounded-lg transition-colors flex items-center justify-center hover:bg-black/5 border border-dashed border-current border-opacity-30 ${(currentEntry.mood === customEmojiSlot && customEmojiSlot) ? 'bg-black/10 ring-1 border-solid' : ''}`}
                         >
                             {customEmojiSlot ? <EmojiRenderer emoji={customEmojiSlot} style={emojiStyle} className="pointer-events-none" /> : <Plus className="w-4 h-4" />}
                         </button>
                         {showEmojiPicker && (
                             <div className={`absolute top-full right-0 mt-2 rounded-lg shadow-xl border w-72 z-50 max-h-80 flex flex-col ${themeClasses.card} ${themeClasses.bg}`} onClick={(e) => e.stopPropagation()}>
                                 <div className="p-2 border-b border-current border-opacity-10 bg-inherit sticky top-0 z-20">
                                     <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                         {Object.keys(EXTENDED_EMOJIS).map(cat => (
                                             <button key={cat} type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollToCategory(cat); }} className="px-2 py-1 text-[10px] rounded bg-black/5 hover:bg-black/10 whitespace-nowrap">{cat}</button>
                                         ))}
                                     </div>
                                 </div>
                                 <div className="overflow-y-auto p-2" ref={emojiContainerRef}>
                                     {Object.entries(EXTENDED_EMOJIS).map(([category, icons]) => (
                                         <div key={category} id={`emoji-cat-${category}`} className="mb-2 scroll-mt-24">
                                             <div className={`text-[10px] font-bold uppercase mb-1 px-1 opacity-50`}>{category}</div>
                                             <div className="grid grid-cols-7 gap-1">
                                                 {icons.map((m, idx) => (
                                                     <button key={idx} type="button" className="text-lg p-1.5 rounded hover:bg-black/10 flex items-center justify-center" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange({...currentEntry, mood: m}); setCustomEmojiSlot(m); setShowEmojiPicker(false); }}>
                                                         <EmojiRenderer emoji={m} style={emojiStyle} className="pointer-events-none" />
                                                     </button>
                                                 ))}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}
                         {showEmojiPicker && <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)}></div>}
                     </div>
                 </div>
            </div>
        </div>

        <div className={`flex rounded-lg p-1 border mb-4 bg-opacity-20 ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
            <button type="button" onClick={() => onChange({ ...currentEntry, entryMode: 'structured' })} className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${currentEntry.entryMode !== 'free' ? themeClasses.primaryBtn + ' shadow' : 'opacity-60 hover:opacity-100'}`}>{t('editor.mode_structured')}</button>
            <button type="button" onClick={() => onChange({ ...currentEntry, entryMode: 'free' })} className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${currentEntry.entryMode === 'free' ? themeClasses.primaryBtn + ' shadow' : 'opacity-60 hover:opacity-100'}`}>{t('editor.mode_free')}</button>
        </div>

        {/* Layout Split: Left (Info) | Right (Map) */}
        <div className="flex flex-col md:flex-row gap-4 mb-2">
            <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                     <Button type="button" variant="secondary" themeClasses={themeClasses} onClick={() => setShowLocationPicker(true)} disabled={isFetchingWeather} size="sm">
                         {isFetchingWeather ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                         {t('editor.location_weather')}
                     </Button>
                     <Button type="button" variant="secondary" themeClasses={themeClasses} onClick={() => fileInputRef.current?.click()} size="sm" disabled={isUploading}>
                         {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />} 
                         {t('editor.add_photo')}
                     </Button>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleMultiplePhotoUpload} />
                </div>

                {displayLocationParts.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        {displayLocationParts.map((part, idx) => (
                            <div key={idx} className={`flex items-center gap-2 pl-3 pr-2 py-1 rounded-full text-xs font-medium border bg-blue-500/10 border-blue-500/20 text-blue-500`}>
                                <span>{part}</span>
                                <button type="button" onClick={() => setLocationParts(p => p.filter((_, i) => i !== idx))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => onChange({...currentEntry, isLocationPrivate: !currentEntry.isLocationPrivate})} className={`p-2 rounded-full border transition-all ${currentEntry.isLocationPrivate ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-black/5 border-transparent opacity-50 hover:opacity-100'}`} title={currentEntry.isLocationPrivate ? t('editor.location_private') : t('editor.location_public')}>
                            {currentEntry.isLocationPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                )}

                {currentEntry.location && !locationParts.length && (
                    <div className={`flex items-center gap-2 pl-3 pr-2 py-1 rounded-full text-xs font-medium border ${themeClasses.card}`}>
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        <span>{currentEntry.location}</span>
                        <button 
                            onClick={() => onChange({...currentEntry, location: undefined, gps: undefined})} 
                            className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"
                            title={t('editor.delete_location')}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {currentEntry.weather && (
                    <div className="flex flex-wrap gap-2">
                        <div className={`flex items-center gap-2 pl-3 pr-2 py-1 rounded-full text-xs font-medium border ${themeClasses.card}`}>
                            <WeatherRenderer data={currentEntry.weather} pack={weatherPack} className="w-4 h-4" />
                            <span>{currentEntry.weather.temp}°C, {currentEntry.weather.condition}</span>
                            <button type="button" onClick={() => onChange({...currentEntry, weather: undefined})} className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors" title={t('editor.delete_weather')}><X className="w-3 h-3" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Static Map Preview on the Right (max 50% width on md) */}
            {currentEntry.gps && (
                <div className="w-full md:w-1/3 min-h-[120px] h-32 md:h-auto rounded-lg overflow-hidden border border-current border-opacity-10 relative">
                    <div className="absolute inset-0">
                        <AtlasView 
                            entries={[{...currentEntry} as Entry]} 
                            activeCategory={activeCategory} 
                            onSelectEntry={() => setShowLocationPicker(true)} 
                            themeClasses={themeClasses} 
                            showAll={true} 
                            emojiStyle={emojiStyle} 
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                </div>
            )}
        </div>

        {/* Photo Gallery */}
        {currentEntry.photos && currentEntry.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {currentEntry.photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border group">
                        <img src={photo} alt={`Attached ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {idx > 0 && <button type="button" onClick={() => movePhoto(idx, 'left')} className="p-1 bg-white/20 rounded hover:bg-white/40 text-white"><ChevronLeft className="w-4 h-4" /></button>}
                            <button type="button" onClick={() => removePhoto(idx)} className="p-1 bg-red-500/80 rounded hover:bg-red-500 text-white"><Trash2 className="w-4 h-4" /></button>
                            {idx < (currentEntry.photos?.length || 0) - 1 && <button type="button" onClick={() => movePhoto(idx, 'right')} className="p-1 bg-white/20 rounded hover:bg-white/40 text-white"><ChevronRight className="w-4 h-4" /></button>}
                        </div>
                        <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 rounded">{idx + 1}</div>
                    </div>
                ))}
            </div>
        )}

        <div className="space-y-4">
             {currentEntry.entryMode === 'free' ? (
                 <RichTextEditor value={currentEntry.freeTextContent || ''} onChange={(val) => onChange({ ...currentEntry, freeTextContent: val })} themeClasses={themeClasses} placeholder={t('editor.free_text_placeholder')} minHeight="300px" />
             ) : (
                 <>
                    <div className="flex gap-2">
                        {availableQuestions.length > 0 && (
                            <div className={`flex-1 flex gap-2 p-3 rounded-lg border ${themeClasses.card}`}>
                                <select className={`flex-1 bg-transparent text-sm focus:outline-none ${themeClasses.text}`} onChange={(e) => { addQuestionToEntry(e.target.value); e.target.value = ""; }}>
                                    <option value="" className={themeClasses.bg}>{t('editor.add_question')}</option>
                                    {availableQuestions.map(q => (<option key={q.id} value={q.id} className={themeClasses.bg}>{!q.id.startsWith('q_') && <User className="w-3 h-3 inline mr-1 opacity-70" />}{q.text}</option>))}
                                </select>
                            </div>
                        )}
                        <Button type="button" variant="secondary" onClick={() => setShowTemplates(true)} themeClasses={themeClasses}><FileText className="w-4 h-4" /> Sablonok</Button>
                    </div>
                    <div className={`gap-4 ${editorLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-4'}`}>
                        {entryQuestionIds.map(qId => {
                            const q = questions.find(quest => quest.id === qId);
                            if (!q) return null;
                            return (
                                <div key={qId} className={`space-y-2 p-3 rounded-lg border bg-black/5 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                                    <div className="flex justify-between items-start gap-2">
                                        <label className={`block text-sm font-medium leading-snug ${themeClasses.accent}`}>{!q.id.startsWith('q_') && <User className="w-3 h-3 inline mr-1 opacity-70" />}{q.text}</label>
                                        <button type="button" onClick={() => removeQuestionFromEntry(qId)} className="opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
                                    </div>
                                    <RichTextEditor value={currentEntry.responses?.[qId] || ''} onChange={(val) => onChange({ ...currentEntry, responses: { ...currentEntry.responses, [qId]: val } })} themeClasses={themeClasses} placeholder={t('editor.response_placeholder')} minHeight="80px" />
                                </div>
                            );
                        })}
                    </div>
                 </>
             )}
        </div>

        <div className={`fixed bottom-0 left-0 right-0 p-4 border-t z-[60] backdrop-blur-md transition-colors ${themeClasses.bg} ${themeClasses.card.includes('border') ? 'border-current border-opacity-10' : 'border-t'}`}>
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-2 items-center">
              <div className="justify-self-start">
                  <button type="button" onClick={() => onChange({...currentEntry, isPrivate: !currentEntry.isPrivate})} className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${currentEntry.isPrivate ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-current opacity-50 hover:opacity-100'}`} title={currentEntry.isPrivate ? t('editor.private_entry') : t('editor.public_entry')}>
                      {currentEntry.isPrivate ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                      <span className="hidden md:inline text-xs font-bold">{currentEntry.isPrivate ? 'Privát' : 'Publikus'}</span>
                  </button>
              </div>
              <div className="justify-self-center w-full px-2 max-w-[200px]">
                  <Button type="button" onClick={onSave} themeClasses={themeClasses} className="w-full justify-center"><Save className="w-4 h-4" /> {t('editor.save')}</Button>
              </div>
              <div className="justify-self-end w-full flex items-center justify-end gap-3">
                  {settings?.showWordCount !== false && (
                      <div className={`hidden md:flex flex-col items-end leading-tight ${isWordCountLow ? 'text-red-500' : 'opacity-70'}`}>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{wordCount} <span className="text-xs opacity-50 font-normal">{settings?.minWordCount ? `/ ${settings.minWordCount}` : ''}</span></span>
                                {settings?.minWordCount && settings.minWordCount > 0 && (
                                    <div className="w-16 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden" title={`${Math.round(progressPercent)}%`}>
                                        <div 
                                            className={`h-full transition-all duration-500 ease-out ${isGoalMet ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] uppercase opacity-60">{t('editor.words') || 'szó'}</span>
                      </div>
                  )}
                  {onDelete ? (
                      <button type="button" onClick={onDelete} className="p-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors" title={t('common.delete')}><Trash2 className="w-5 h-5" /></button>
                  ) : <div />}
              </div>
          </div>
        </div>

        {showTemplates && (
            <TemplateModal onClose={() => setShowTemplates(false)} onApply={handleApplyTemplate} onSaveNew={(name, isDefault) => { const currentQs = Object.keys(currentEntry.responses || {}).map(qid => { const q = questions.find(q => q.id === qid); return q ? q.text : null; }).filter(Boolean) as string[]; if(onSaveTemplate) onSaveTemplate(name, currentQs, isDefault); }} onDelete={(id) => onDeleteTemplate && onDeleteTemplate(id)} templates={templates || []} currentQuestions={Object.keys(currentEntry.responses || {}).map(qid => questions.find(q=>q.id===qid)?.text).filter(Boolean) as string[]} themeClasses={themeClasses} t={t} onSetDefault={(id) => {}} />
        )}

        {showLocationPicker && (
            <LocationPickerModal onClose={() => setShowLocationPicker(false)} onSelect={handleLocationSelect} onSaveLocation={handleSaveSavedLocation} onDeleteLocation={onUpdateSettings ? handleDeleteSavedLocation : undefined} savedLocations={settings?.savedLocations || []} themeClasses={themeClasses} t={t} />
        )}
      </div>
    );
};

export default EntryEditor;
