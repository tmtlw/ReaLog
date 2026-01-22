
import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool, X, List, Grid, RefreshCw, MapPin,
  Image, ThermometerSun, Lock, Unlock, Save, Eye, EyeOff, Trash2, CalendarClock,
  FileText, ChevronLeft, ChevronRight, Plus, Search, AlignLeft, User, CheckCircle2, Hash, Minus, Activity, Tag,
  Book, Droplets, Moon, Sun, DollarSign, Briefcase, Heart, Brain, Music, Code, Leaf, Coffee, Utensils, Zap, Award, Target, Flag, Bike, Dumbbell, Footprints, Bed, ShowerHead, Timer, Watch, Smartphone, Laptop, Gamepad2, ShoppingCart, Home, Car, Plane, Brush, Camera, Headphones, Gift, Star, Smile, Frown, Users, Phone, Mail,
  Maximize2, Minimize2, ZoomIn, ZoomOut, Map
} from 'lucide-react';
import { Entry, Category, WeatherData, AppSettings, Question, Template, WeatherIconPack, EmojiStyle, SavedLocation, Habit } from '../../types';
import { Button, Input } from '../ui';
import { stringToColor, stringToBgColor } from '../../utils/colors';
import * as StorageService from '../../services/storage';
import TemplateModal from '../modals/TemplateModal';
import LocationPickerModal from '../modals/LocationPickerModal';
import RichTextEditor from '../ui/RichTextEditor';
import WeatherRenderer from '../ui/WeatherRenderer';
import EmojiRenderer from '../ui/EmojiRenderer';
import AtlasView from '../views/AtlasView';

// Helper for Icon Rendering
const DynamicIcon = ({ name, className }: { name, className? }) => {
    const iconMap = {
        Activity, Book, Droplets, Moon, Sun, DollarSign, Briefcase, Heart, Brain, Music, PenTool, Code, Leaf, Coffee, Utensils, Zap, Award, Target, Flag, Bike, Dumbbell, Footprints, Bed, ShowerHead, Timer, Watch, Smartphone, Laptop, Gamepad2, ShoppingCart, Home, Car, Plane, Brush, Camera, Headphones, Gift, Star, Smile, Frown, Users, Phone, Mail
    };
    const IconComponent = iconMap[name] || Activity;
    return <IconComponent className={className} />;
};

const EXTENDED_EMOJIS = {
    "Hangulat": ['🙂', '😃', '😄', '😆', '😅', '😂', '🤣', '😊', '😇', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'],
    "Aktivitás": ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥊', '🥋', '🥅', '⛳', '⛸', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌', '🎯', '🎮', '🎰', '🎲', '🧩', '🧸', '♠', '♥', '♦', '♣', '♟', '🃏', '🀄', '🎴', '🎭', '🖼', '🎨', '🧵', '🧶'],
    "Munka & Suli": ['💼', '🎓', '📚', '💻', '🖥', '🖨', '⌨', '🖱', '🖲', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞', '📽', '🎬', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯', '💡', '🔦', '🏮', '📔', '📕', '📖', '📗', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞', '📑', '🔖', '🏷', '💰', '💴', '💵', '💶', '', '💸', '💳', '🧾', '✉', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳', '✏', '✒', '🖋', '🖊', '🖊', '🖌', '🖍', '📝', '📅', '📆', '🗓', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇', '📏', '📐', '✂', '🗃', '🗄', '🗑', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝', '🔨', '🪒', '⛏', '⚒', '🛠', '🗡', '⚔', '🔫', '🏹', '🛡', '🔧', '🔩', '⚙', '🗜', '⚖', '🔗', '⛓', '🧰', '🧲', '⚗', '🧪', '🧫', '🧬', '🔬', '🔭', '📡', '💉', '💊', '🚪', '🛏', '🛋', '🚽', '🚿', '🛁', '🪒', '🧴', '🧷', '🧹', '🧺', '🧻', '🧼', '🧽', '🧯', '🛒'],
    "Étel & Ital": ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍎', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🍶', '🧉', '🧊', '🥢', '🍽', '🍴', '🥄', '🔪', '🏺'],
    "Természet": ['🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌛', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄', '💥', '🔥', '🌪', '🌈', '☀', '⭐', '☄', '☁', '⛅', '⛈', '🌤', '🌥', '🌦', '🌧', '🌨', '🌩', '🌪', '🌫', '💧', '💦', '☂'],
    "Szimbólumok": ['❤', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮', '✝', '☪', '🕉', '☸', '✡', '🔯', '🕎', '☯', '☦', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛', '🉑', '☢', '☣', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷', '✴', '🆚', '💮', '🉐', '㊙', '㊗', '🈴', '🈵', '🈹', '🈲', '🅰', '🅱', '🆎', '🆑', '🅾', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '📵', '🚭', '❗', '❕', '❓', '❔', '‼', '⁉', '🔅', '🔆', '〽', '⚠', '🚸', '🔱', '⚜', '🔰', '♻', '✅', '🈯', '💹', '❇', '✳', '❎', '🌐', '💠', 'Ⓜ', '🌀', '💤', '🏧', '🚾', '♿', '🅿', '🈳', '🈂', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏', '▶', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀', '🔼', '🔽', '➡', '⬅', '⬆', '⬇', '↗', '↘', '↙', '↖', '↕', '↔', '↪', '↩', '⤴', '⤵', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖', '♾', '💲', '💱', '™', '©', '®', '〰', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔', '☑', '🔘', '⚪', '⚫', '🔴', '🔵', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪', '▫', '◾', '◽', '◼', '◻', '⬛', '⬜', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁‍🗨', '💬', '💭', '🗯', '♠', '♣', '♥', '♦', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
};



const EntryEditor = ({
    entry: currentEntry, onChange, onSave, onCancel, onDelete, activeCategory, questions, habits = [], settings,
    templates, onSaveTemplate, onDeleteTemplate, onUpdateSettings, themeClasses, currentTheme,
    serverMode, t, currentLang = 'hu', locationParts, setLocationParts, entries
}) => {
    const [editorLayout, setEditorLayout] = useState('grid');
    const [isFetchingWeather, setIsFetchingWeather] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [customEmojiSlot, setCustomEmojiSlot] = useState(null);
    const [detectedTags, setDetectedTags] = useState([]);

    // New UI States
    const [zenMode, setZenMode] = useState(false);
    const [fontSize, setFontSize] = useState(100); // Percentage

    const fileInputRef = useRef(null);
    const datePickerRef = useRef(null);
    const emojiContainerRef = useRef(null);

    const weatherPack = settings?.weatherIconPack || 'outline';
    const emojiStyle = settings?.emojiStyle || 'native';

    const isDark = themeClasses.bg.includes('900') || themeClasses.bg.includes('950') || themeClasses.bg.includes('black');

    const wordCount = React.useMemo(() => {
        const text = (currentEntry.freeTextContent || '') + Object.values(currentEntry.responses || {}).join(' ');
        if (!text.trim()) return 0;
        return text.trim().split(/\s+/).length;
    }, [currentEntry.freeTextContent, currentEntry.responses]);

    const isWordCountLow = settings?.minWordCount && wordCount < settings.minWordCount;
    const progressPercent = settings?.minWordCount ? Math.min(100, (wordCount / settings.minWordCount) * 100) : 0;
    const isGoalMet = progressPercent >= 100;

    // Tag Extraction Logic
    useEffect(() => {
        const text = (currentEntry.title || '') + ' ' + (currentEntry.freeTextContent || '') + ' ' + Object.values(currentEntry.responses || {}).join(' ');
        // Regex to find #hashtags but exclude html entities like &#123;
        const matches = text.match(/#[a-zA-Z0-9_öüóőúéáűíÖÜÓŐÚÉÁŰÍ]+/g);
        if (matches) {
            const uniqueTags = [...new Set(matches.map(t => t.substring(1)))]; // remove # and dedup
            setDetectedTags(uniqueTags);
            // Update entry tags if different
            if (JSON.stringify(uniqueTags) !== JSON.stringify(currentEntry.tags)) {
                onChange({ ...currentEntry, tags: uniqueTags });
            }
        } else if (currentEntry.tags && currentEntry.tags.length > 0) {
            setDetectedTags([]);
            onChange({ ...currentEntry, tags: [] });
        }
    }, [currentEntry.title, currentEntry.freeTextContent, currentEntry.responses]);

    // Populate Location Parts on Load if exists but parts are empty
    useEffect(() => {
        if (currentEntry?.location && locationParts.length === 0) {
            const parts = currentEntry.location.split(',').map(s => s.trim()).filter(Boolean);
            if (parts.length > 0) {
                setLocationParts(parts);
            }
        }
    }, [currentEntry?.id]); // Only runs when entry ID changes (load)

    useEffect(() => {
        if (currentEntry) {
            let updates<Entry> = {};
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
        // If we have parts, construct the location string
        if (locationParts.length > 0) {
            const locString = locationParts.join(', ');
            if (currentEntry.location !== locString) {
                onChange({ ...currentEntry, location: locString });
            }
        }
        // If we have NO parts, but we HAD location (and we are in edit mode / locationParts was cleared)
        // We only clear location if it was previously set and now parts are empty
        else if (currentEntry.location && locationParts.length === 0) {
             // Only clear if the user explicitly deleted parts (length became 0)
             // We assume if location exists, parts should have been populated by the init effect.
             // So emptiness here implies deletion.
             if (isEditing()) {
                 onChange({ ...currentEntry, location: undefined, gps: undefined });
             }
        }
    }, [locationParts]);

    const isEditing = () => locationParts.length > 0 || currentEntry.location;

    if (!currentEntry) return null;

    const entryQuestionIds = Object.keys(currentEntry.responses || {});
    const availableQuestions = questions.filter(q => q.category === activeCategory && !entryQuestionIds.includes(q.id));
    const activeHabits = habits.filter(h => h.category === activeCategory && h.isActive);

    const moodCounts = entries.reduce((acc, e) => {
        if(e.mood) acc[e.mood] = (acc[e.mood] || 0) + 1;
        return acc;
    }, {}<string, number>);
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

    // Habit Logic
    const toggleHabit = (habitId) => {
        const currentVals = currentEntry.habitValues || {};
        const newVal = !currentVals[habitId];
        onChange({ ...currentEntry, habitValues: { ...currentVals, [habitId]: newVal } });
    };

    const updateHabitValue = (habitId, delta) => {
        const currentVals = currentEntry.habitValues || {};
        const currentVal = (currentVals[habitId] as number) || 0;
        const newVal = Math.max(0, currentVal + delta);
        onChange({ ...currentEntry, habitValues: { ...currentVals, [habitId]: newVal } });
    };

    const setHabitValue = (habitId, value) => {
        const currentVals = currentEntry.habitValues || {};
        onChange({ ...currentEntry, habitValues: { ...currentVals, [habitId].max(0, value) } });
    };

    const addQuestionToEntry = (questionId) => {
        if (!questionId) return;
        onChange({ ...currentEntry, responses: { ...currentEntry.responses, [questionId]: "" } });
    };

    const removeQuestionFromEntry = (questionId) => {
        const newResponses = { ...currentEntry.responses };
        delete newResponses[questionId];
        onChange({ ...currentEntry, responses: newResponses });
    };

    const handleApplyTemplate = (templateQuestions) => {
        const newResponses<string, string> = {};
        templateQuestions.forEach((qText, index) => {
            const existingQ = questions.find(q => q.text === qText && q.category === activeCategory);
            if (existingQ) {
                newResponses[existingQ.id] = "";
            }
        });
        onChange({ ...currentEntry, responses: newResponses });
    };

    const handleNativeDateChange = (e.ChangeEvent<HTMLInputElement>) => {
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

    const handlePickerClick = (e.MouseEvent<HTMLDivElement>) => {
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

    // Helper if date is today
    const isSameDay = (d1, d2) => {
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    };

    // Smart Weather Fetcher Current vs Historical using Open-Meteo
    const fetchWeather = async (lat, lon, timestamp)<WeatherData | null> => {
        const isToday = isSameDay(timestamp, Date.now());

        try {
            if (isToday) {
                // CURRENT WEATHER via Open-Meteo Forecast API
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.current) {
                        return {
                            temp.round(data.current.temperature_2m),
                            // Store the code, translation happens at render time
                            condition: `wmo_${data.current.weather_code}`,
                            location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
                            icon: `wmo_${data.current.weather_code}`
                        };
                    }
                }
            } else {
                // HISTORICAL WEATHER via Open-Meteo Archive API
                const dateStr = new Date(timestamp).toISOString().split('T')[0];
                const res = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=weather_code,temperature_2m_mean&timezone=auto`);

                if (res.ok) {
                    const data = await res.json();
                    if (data.daily && data.daily.weather_code && data.daily.weather_code.length > 0) {
                        const code = data.daily.weather_code[0];
                        const temp = data.daily.temperature_2m_mean[0];
                        return {
                            temp.round(temp),
                            // Store the code, translation happens at render time
                            condition: `wmo_${code}`,
                            location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
                            icon: `wmo_${code}`
                        };
                    }
                }
            }
        } catch(e) { console.warn("Weather fetch failed", e); }

        return null;
    };

    // Handle Location Selection from Map/Modal
    const handleLocationSelect = async (lat, lon, displayName) => {
        setIsFetchingWeather(true);
        // Split the new location name into parts immediately for granular deletion
        const parts = displayName.split(',').map(s => s.trim()).filter(Boolean);
        setLocationParts(parts);

        const entryTs = currentEntry.timestamp || Date.now();
        let weatherInfo = await fetchWeather(lat, lon, entryTs);

        const newData = { ...currentEntry };
        newData.gps = { lat, lon };
        newData.location = displayName;
        if (weatherInfo) {
             newData.weather = {
                 ...weatherInfo,
                 location: displayName // Use the user-selected name
             };
        }
        onChange(newData);
        setIsFetchingWeather(false);
    };

    const handleSaveSavedLocation = (loc) => {
        if (onUpdateSettings && settings) {
            const currentSaved = settings.savedLocations || [];
            onUpdateSettings({ savedLocations: [...currentSaved, loc] });
        }
    };

    const handleDeleteSavedLocation = (id) => {
        if (onUpdateSettings && settings) {
            const currentSaved = settings.savedLocations || [];
            onUpdateSettings({ savedLocations: currentSaved.filter(l => l.id !== id) });
        }
    };

    const scrollToCategory = (category) => {
        if (!emojiContainerRef.current) return;
        const categoryEl = document.getElementById(`emoji-cat-${category}`);
        if (categoryEl) {
            const containerTop = emojiContainerRef.current.getBoundingClientRect().top;
            const elTop = categoryEl.getBoundingClientRect().top;
            const offset = elTop - containerTop + emojiContainerRef.current.scrollTop;
            emojiContainerRef.current.scrollTo({ top: offset, behavior: 'smooth' });
        }
    };

    const handleMultiplePhotoUpload = async (e.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsUploading(true);
        const newPhotos = [];
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 1024 * 1024 * 5) { alert(`${file.name}: ${t('app.file_too_large')}`); continue; }
                if (serverMode) {
                    try { const url = await StorageService.uploadImage(file); newPhotos.push(url); } catch (err) { console.error(err); alert(`${file.name}: ${t('app.upload_error')}`); }
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

    const removePhoto = (index) => {
        const currentPhotos = [...(currentEntry.photos || [])];
        currentPhotos.splice(index, 1);
        onChange({ ...currentEntry, photos: currentPhotos, photo: currentPhotos.length > 0 ? currentPhotos[0] : undefined });
    };

    const movePhoto = (index, direction: 'left' | 'right') => {
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

    const displayLocationParts = locationParts.length > 0 ? locationParts : (currentEntry.location ? currentEntry.location.split(',').map(s=>s.trim()).filter(Boolean) : []);

    const zoomIn = () => setFontSize(p => Math.min(p + 10, 200));
    const zoomOut = () => setFontSize(p => Math.max(p - 10, 80));

    return (
        <div className={`space-y-6 animate-fade-in pb-24 ${zenMode ? 'zen-mode-active' : ''}`} style={{ '--editor-font-size': `${fontSize}%` } as any}>
        {/* Header */}
        {!zenMode && (
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
                <div className="flex gap-2 items-center">
                     <div className="flex bg-black/5 rounded-lg border border-black/5 mr-2">
                         <button onClick={zoomOut} className="p-1.5 opacity-50 hover:opacity-100" title={t('app.zoom_out')}><ZoomOut className="w-4 h-4" /></button>
                         <button onClick={zoomIn} className="p-1.5 opacity-50 hover:opacity-100" title={t('app.zoom_in')}><ZoomIn className="w-4 h-4" /></button>
                     </div>
                     <button
                        type="button"
                        onClick={() => setZenMode(true)}
                        className={`p-2 rounded-lg opacity-50 hover:opacity-100 transition-all`}
                        title={t('app.zen_mode')}
                     >
                         <Maximize2 className="w-5 h-5" />
                     </button>

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
        )}

        {zenMode && (
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                 <div className="flex bg-black/5 rounded-lg border border-black/5 backdrop-blur-sm bg-white/10">
                     <button onClick={zoomOut} className="p-2 opacity-50 hover:opacity-100" title={t('app.zoom_out')}><ZoomOut className="w-5 h-5" /></button>
                     <button onClick={zoomIn} className="p-2 opacity-50 hover:opacity-100" title={t('app.zoom_in')}><ZoomIn className="w-5 h-5" /></button>
                 </div>
                <button
                    onClick={() => setZenMode(false)}
                    className="p-2 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-sm transition-all"
                    title="Exit Zen Mode"
                >
                    <Minimize2 className="w-6 h-6" />
                </button>
            </div>
        )}

        {!zenMode && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-xs font-medium mb-1 uppercase ${themeClasses.subtext}`}>{t('editor.title')}</label>
                        <Input themeClasses={themeClasses} value={currentEntry.title || ''} onChange={(e) => onChange({...currentEntry, title: e.target.value})} placeholder={t('editor.title_placeholder')} />
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

                {/* Layout Split (Info) | Right (Map) */}
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
                                    <span>
                                        {currentEntry.weather.temp}°C, {currentEntry.weather.condition.startsWith('wmo_') ? t('weather.' + currentEntry.weather.condition) : currentEntry.weather.condition}
                                    </span>
                                    <button type="button" onClick={() => onChange({...currentEntry, weather: undefined})} className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors" title={t('editor.delete_weather')}><X className="w-3 h-3" /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Static Map Preview on the Right (50% split) */}
                    {currentEntry.gps && (
                        <div className="w-full md:flex-1 min-h-[120px] h-32 md:h-auto rounded-lg overflow-hidden border border-current border-opacity-10 relative cursor-pointer" onClick={() => setShowLocationPicker(true)} title="Térkép megnyitása">
                            <div className="absolute inset-0">
                                <AtlasView
                                    entries={[{...currentEntry}]}
                                    activeCategory={activeCategory}
                                    onSelectEntry={() => {}}
                                    themeClasses={themeClasses}
                                    showAll={true}
                                    emojiStyle={emojiStyle}
                                    fixPosition={true}
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors pointer-events-none" />
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
            </>
        )}

        <div className="space-y-4">
             {currentEntry.entryMode === 'free' ? (
                 <RichTextEditor
                    value={currentEntry.freeTextContent || ''}
                    onChange={(val) => onChange({ ...currentEntry, freeTextContent: val })}
                    themeClasses={themeClasses}
                    placeholder={t('editor.free_text_placeholder')}
                    minHeight="300px"
                    fontSize={`${fontSize}%`}
                 />
             ) : (
                 <>
                    <div className="flex gap-2">
                        {availableQuestions.length > 0 && (
                            <div className={`flex-1 flex gap-2 p-3 rounded-lg border ${themeClasses.card}`}>
                                <select
                                    className={`flex-1 bg-transparent text-sm focus:outline-none ${themeClasses.text}`}
                                    onChange={(e) => { addQuestionToEntry(e.target.value); e.target.value = ""; }}
                                >
                                    <option value="">+ Kérdés hozzáadása...</option>
                                    {availableQuestions.map(q => <option key={q.id} value={q.id}>{q.text}</option>)}
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
                                        <label className={`block text-sm font-medium leading-snug ${themeClasses.accent}`}>{q.text}</label>
                                        <button type="button" onClick={() => removeQuestionFromEntry(qId)} className="opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
                                    </div>
                                    <RichTextEditor
                                        value={currentEntry.responses?.[qId] || ''}
                                        onChange={(val) => onChange({ ...currentEntry, responses: { ...currentEntry.responses, [qId]: val } })}
                                        themeClasses={themeClasses}
                                        placeholder={t('editor.response_placeholder')}
                                        minHeight="80px"
                                        fontSize={`${fontSize}%`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                 </>
             )}
        </div>

        {/* --- HABIT TRACKER SECTION --- */}
        {!zenMode && settings?.enableHabits && activeHabits.length > 0 && (
            <div className={`p-4 rounded-lg border mb-4 mt-4 ${themeClasses.card}`}>
                <h4 className={`text-xs font-bold uppercase mb-3 flex items-center gap-2 ${themeClasses.accent}`}>
                    <Activity className="w-3 h-3" /> {t('editor.habits_title')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {activeHabits.map(habit => {
                        const val = currentEntry.habitValues?.[habit.id];
                        const HabitIcon = habit.icon ? <DynamicIcon name={habit.icon} className="w-4 h-4" /> : null;

                        if (habit.type === 'boolean') {
                            const isDone = !!val;
                            return (
                                <button
                                    key={habit.id}
                                    type="button"
                                    onClick={() => toggleHabit(habit.id)}
                                    className={`p-3 rounded-lg border text-sm font-medium flex items-center justify-between gap-2 transition-all ${isDone ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-black/5 border-current hover:bg-black/10'}`}
                                >
                                    <span className="truncate flex items-center gap-2">
                                        {HabitIcon}
                                        {habit.title}
                                    </span>
                                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            );
                        } else {
                            // Value type
                            const count = (val as number) || 0;
                            const progress = habit.target ? Math.min(100, (count / habit.target) * 100) : 0;
                            return (
                                <div key={habit.id} className={`p-2 rounded-lg border flex flex-col gap-2 ${count > 0 ? 'bg-blue-500/10 border-blue-500/50' : 'bg-black/5 border-current'}`}>
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="truncate flex items-center gap-1">
                                            {HabitIcon}
                                            {habit.title}
                                        </span>
                                        <span className="opacity-70">{habit.unit || ''}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => updateHabitValue(habit.id, -1)} className="p-1 rounded bg-black/10 hover:bg-black/20"><Minus className="w-3 h-3" /></button>
                                        <input
                                            type="number"
                                            value={count || ''}
                                            onChange={(e) => setHabitValue(habit.id, parseFloat(e.target.value))}
                                            placeholder="0"
                                            className="flex-1 text-center font-mono font-bold text-lg bg-transparent focus:outline-none w-full"
                                        />
                                        <button type="button" onClick={() => updateHabitValue(habit.id, 1)} className="p-1 rounded bg-black/10 hover:bg-black/20"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    {habit.target && (
                                        <div className="h-1 bg-black/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        )}

        <div className={`fixed bottom-0 left-0 right-0 p-4 border-t z-[60] backdrop-blur-md transition-colors ${themeClasses.bg} ${themeClasses.card.includes('border') ? 'border-current border-opacity-10' : 'border-t'}`}>
          <div className="max-w-6xl mx-auto flex flex-col gap-2">
              {/* Tag Preview */}
              {detectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs opacity-80 justify-center md:justify-start">
                      {detectedTags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded font-bold border border-current border-opacity-10"
                            style={{
                                backgroundColorToBgColor(tag, isDark ? 'dark' : 'light'),
                                colorToColor(tag, isDark ? 'dark' : 'light')
                            }}
                          >
                              #{tag}
                          </span>
                      ))}
                  </div>
              )}

              <div className="grid grid-cols-3 gap-2 items-center">
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
                                <span className="text-xs opacity-60 uppercase">{t('editor.words') || 'szó'}</span>
                          </div>
                      )}
                      {onDelete ? (
                          <button type="button" onClick={onDelete} className="p-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors" title={t('common.delete')}><Trash2 className="w-5 h-5" /></button>
                      ) : <div />}
                  </div>
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
