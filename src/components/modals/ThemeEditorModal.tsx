
import React, { useState, useRef, useEffect } from 'react';
import { X, Palette, Check, Monitor, Moon, Sun, PaintBucket, Type, Upload, Search, CloudSun, Smile, Gift, RefreshCw } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { THEMES, ACCENT_COLORS, generateCustomTheme, HOLIDAY_THEMES } from '../../constants/theme';
import { GOOGLE_FONTS } from '../../constants/fonts';
import { AppData, ThemeOption, CustomThemeConfig, WeatherIconPack, EmojiStyle } from '../../types';
import WeatherRenderer from '../ui/WeatherRenderer';
import EmojiRenderer from '../ui/EmojiRenderer';
import * as StorageService from '../../services/storage';

// All 10 Packs
const WEATHER_PACKS: WeatherIconPack[] = [
    'outline', 'filled', 'color', 'emoji', 'ascii', 
    'thin', 'bold', 'cartoon', 'mono-duotone', 'neon'
];

// Extracted Preview Components to prevent re-creation on render
const WeatherPreview: React.FC<{ pack: WeatherIconPack, currentPack: WeatherIconPack, onSelect: (p: WeatherIconPack) => void, t: any }> = ({ pack, currentPack, onSelect, t }) => {
    // Mock data for preview (using generic text conditions, Renderer will map them)
    const conditions: any[] = [
        { condition: 'Clear', icon: '01d' },
        { condition: 'Clouds', icon: '02d' },
        { condition: 'Rain', icon: '10d' },
        { condition: 'Storm', icon: '11d' },
        { condition: 'Snow', icon: '13d' }
    ];

    return (
        <div 
            onClick={() => onSelect(pack)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${currentPack === pack ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent bg-black/5 hover:border-white/10'}`}
        >
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm uppercase">{t(`weather.${pack}`)}</span>
                {currentPack === pack && <Check className="w-4 h-4 text-emerald-500" />}
            </div>
            <div className="flex justify-between items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {conditions.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 min-w-[24px]">
                        <WeatherRenderer data={{ temp: 20, condition: c.condition, location: '', icon: c.icon }} pack={pack} className="w-6 h-6" />
                    </div>
                ))}
            </div>
        </div>
    );
};

const EmojiPreview: React.FC<{ style: EmojiStyle, currentStyle: EmojiStyle, onSelect: (s: EmojiStyle) => void, t: any }> = ({ style, currentStyle, onSelect, t }) => {
    const samples = ['🙂', '🔥', '🚀', '🌈', '🎉'];
    return (
        <div 
            onClick={() => onSelect(style)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${currentStyle === style ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent bg-black/5 hover:border-white/10'}`}
        >
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm uppercase">{t(`theme.emoji_${style.replace('-','_')}`)}</span>
                {currentStyle === style && <Check className="w-4 h-4 text-emerald-500" />}
            </div>
            <div className="flex justify-center items-center gap-4 text-2xl">
                {samples.map((e, i) => (
                    <EmojiRenderer key={i} emoji={e} style={style} />
                ))}
            </div>
        </div>
    );
};

interface PreviewCardProps {
    classes: any;
    label: string;
    active: boolean;
    onClick?: () => void;
    noTranslate?: boolean;
    t: (k: string) => string;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ classes, label, active, onClick, noTranslate, t }) => (
    <div className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${active ? 'border-emerald-500 scale-[1.02] shadow-lg' : 'border-transparent hover:border-white/20'}`}
         onClick={onClick}
    >
        <div className={`h-32 p-3 ${classes.bg} flex flex-col gap-2`}>
            <div className="flex gap-2">
                <div className={`w-8 h-8 rounded-md ${classes.primaryBtn} flex items-center justify-center`}>
                    <div className="w-4 h-4 bg-white/20 rounded"></div>
                </div>
                <div className="flex-1 space-y-1">
                    <div className={`h-2 w-1/3 rounded ${classes.card.split(' ')[0]} brightness-90`}></div>
                    <div className={`h-2 w-1/4 rounded ${classes.card.split(' ')[0]} brightness-90`}></div>
                </div>
            </div>
            <div className={`flex-1 rounded-lg border p-2 ${classes.card}`}>
                <div className={`text-xs font-bold ${classes.accent}`}>{label}</div>
                <div className={`text-[10px] mt-1 ${classes.text} opacity-60`}>Lorem ipsum dolor sit amet.</div>
            </div>
        </div>
        
        <div className={`absolute inset-x-0 bottom-0 p-2 bg-black/50 backdrop-blur-sm text-center`}>
            <span className="text-xs font-bold text-white uppercase">
                {noTranslate ? label : t(label.includes('theme.') ? label : `theme.${label}`)}
            </span>
        </div>
        
        {active && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <Check className="w-4 h-4" />
            </div>
        )}
    </div>
);

const ThemeEditorModal: React.FC<{
    onClose: () => void;
    data: AppData;
    setData: React.Dispatch<React.SetStateAction<AppData>>;
    currentTheme: ThemeOption;
    setCurrentTheme: (t: ThemeOption) => void;
    themeClasses: any;
    t: (key: string) => string;
}> = ({ onClose, data, setData, currentTheme, setCurrentTheme, themeClasses, t }) => {
    const [mode, setMode] = useState<'presets' | 'creator' | 'typography' | 'weather' | 'emoji' | 'secret'>('presets');
    
    // Creator state
    const [customBase, setCustomBase] = useState<'light' | 'dark'>(
        data.settings?.customTheme?.base || 'dark'
    );
    const [customAccent, setCustomAccent] = useState<string>(
        data.settings?.customTheme?.accent || 'c22' // Default to Emerald
    );
    const [customBg, setCustomBg] = useState<string>(
        data.settings?.customTheme?.customBg || ''
    );

    // Typography State
    const [fontFamily, setFontFamily] = useState(data.settings?.typography?.fontFamily || 'Inter');
    const [fontSize, setFontSize] = useState(data.settings?.typography?.fontSize || 16);
    const [customFontName, setCustomFontName] = useState(data.settings?.typography?.customFontName || '');
    const [customFontData, setCustomFontData] = useState(data.settings?.typography?.customFontData || '');
    
    // Weather State
    const [weatherPack, setWeatherPack] = useState<WeatherIconPack>(data.settings?.weatherIconPack || 'outline');

    // Emoji State
    const [emojiStyle, setEmojiStyle] = useState<EmojiStyle>(data.settings?.emojiStyle || 'native');
    const [isSaving, setIsSaving] = useState(false);

    const [fontSearch, setFontSearch] = useState('');
    const fontFileInput = useRef<HTMLInputElement>(null);

    // Dynamically load font for preview when selected in dropdown
    useEffect(() => {
        if (fontFamily && fontFamily !== 'Custom' && !customFontData) {
            const linkId = 'preview-font-link';
            let link = document.getElementById(linkId) as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
        }
    }, [fontFamily]);

    // Handle Custom Font Selection Automatically
    useEffect(() => {
        if (customFontData && fontFamily !== 'Custom') {
            setFontFamily('Custom');
        }
    }, [customFontData]);

    const handleSelectPreset = (theme: ThemeOption) => {
        setCurrentTheme(theme);
        // Reset active holiday when choosing a standard preset
        setData(prev => ({ 
            ...prev, 
            settings: { 
                ...prev.settings, 
                theme,
                activeHoliday: undefined 
            } 
        }));
    };

    const handlePreviewSecret = (themeId: string) => {
        // Apply holiday theme and save as 'holiday' type with active ID
        setCurrentTheme('holiday');
        setData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                theme: 'holiday',
                activeHoliday: themeId
            }
        }));
    };

    const handleSaveCustom = () => {
        const config: CustomThemeConfig = { base: customBase, accent: customAccent, customBg: customBg || undefined };
        setData(prev => ({ 
            ...prev, 
            settings: { 
                ...prev.settings, 
                theme: 'custom', 
                customTheme: config,
                activeHoliday: undefined
            } 
        }));
        setCurrentTheme('custom');
    };

    const handleSaveTypography = async () => {
        setIsSaving(true);
        let finalFontData = customFontData;

        // If custom font is base64 (newly uploaded), try saving to server
        if (fontFamily === 'Custom' && customFontData.startsWith('data:')) {
            try {
                // If using server mode, save file and get path
                const filename = (customFontName || 'custom') + '.woff2'; // Default ext, better if detected
                const savedPath = await StorageService.saveFont(customFontData, filename);
                finalFontData = savedPath;
            } catch(e) {
                console.warn("Failed to save custom font to server, using inline base64", e);
            }
        }

        setData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                typography: {
                    fontFamily,
                    fontSize,
                    customFontName: fontFamily === 'Custom' ? customFontName : undefined,
                    customFontData: fontFamily === 'Custom' ? finalFontData : undefined
                }
            }
        }));
        setIsSaving(false);
        onClose();
    };

    const handleSaveWeather = () => {
        setData(prev => ({
            ...prev,
            settings: { ...prev.settings, weatherIconPack: weatherPack }
        }));
        onClose();
    };

    const handleSaveEmoji = async () => {
        setIsSaving(true);
        let success = false;
        try {
            if (emojiStyle === 'openmoji') {
                // Use FIXED stable version to avoid 404
                const url = 'https://cdn.jsdelivr.net/npm/@openmoji/openmoji@14.0.0/font/OpenMoji-Color.woff2';
                const filename = 'OpenMoji-Color.woff2';
                
                // Attempt to save to server
                await StorageService.saveFont(url, filename);
                success = true;
            }
        } catch(e) {
            console.warn("Could not save font to server, using CDN/Cache", e);
        } finally {
            setData(prev => ({
                ...prev,
                settings: { 
                    ...prev.settings, 
                    emojiStyle: emojiStyle,
                    offlineFonts: success || prev.settings?.offlineFonts
                }
            }));
            
            setIsSaving(false);
            onClose();
        }
    };

    const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                setCustomFontData(base64);
                setCustomFontName(file.name.split('.')[0]);
                setFontFamily('Custom');
            };
            reader.readAsDataURL(file);
        }
    };

    const customPreviewClasses = generateCustomTheme(customBase, customAccent as any, customBg || undefined);

    const filteredFonts = GOOGLE_FONTS.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 pb-12">
            <Card themeClasses={themeClasses} className="w-full max-w-2xl p-0 shadow-2xl relative flex flex-col max-h-[85vh] mb-10 border-2">
                
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-500"><Palette className="w-6 h-6" /></div>
                        <div>
                            <h3 className="text-xl font-bold">{t('theme.title')}</h3>
                            <p className={`text-xs ${themeClasses.subtext}`}>{t('theme.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                </div>

                <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar shrink-0">
                    <button onClick={() => setMode('presets')} className={`px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${mode === 'presets' ? 'bg-white/5 text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60'}`}>
                        <Monitor className="w-4 h-4" /> {t('theme.presets')}
                    </button>
                    <button onClick={() => setMode('creator')} className={`px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${mode === 'creator' ? 'bg-white/5 text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60'}`}>
                        <PaintBucket className="w-4 h-4" /> {t('theme.create')}
                    </button>
                    <button onClick={() => setMode('typography')} className={`px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${mode === 'typography' ? 'bg-white/5 text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60'}`}>
                        <Type className="w-4 h-4" /> {t('theme.typography')}
                    </button>
                    <button onClick={() => setMode('weather')} className={`px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${mode === 'weather' ? 'bg-white/5 text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60'}`}>
                        <CloudSun className="w-4 h-4" /> {t('theme.weather_tab')}
                    </button>
                    <button onClick={() => setMode('emoji')} className={`px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${mode === 'emoji' ? 'bg-white/5 text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60'}`}>
                        <Smile className="w-4 h-4" /> {t('theme.emoji_tab')}
                    </button>
                    
                    {data.settings?.dev && (
                        <button onClick={() => setMode('secret')} className={`px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${mode === 'secret' ? 'bg-white/5 text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60'}`}>
                            <Gift className="w-4 h-4 text-purple-500" /> {t('theme.secret_tab')}
                        </button>
                    )}
                </div>

                <div className="p-6 overflow-y-auto bg-black/5 flex-1">
                    {mode === 'presets' && (
                        <div className="grid grid-cols-2 gap-4">
                            <PreviewCard classes={THEMES.dark} label="dark" active={currentTheme === 'dark'} onClick={() => handleSelectPreset('dark')} t={t} />
                            <PreviewCard classes={THEMES.light} label="light" active={currentTheme === 'light'} onClick={() => handleSelectPreset('light')} t={t} />
                            <PreviewCard classes={THEMES.lavender} label="lavender" active={currentTheme === 'lavender'} onClick={() => handleSelectPreset('lavender')} t={t} />
                            
                            <PreviewCard classes={THEMES.nord} label="nord" active={currentTheme === 'nord'} onClick={() => handleSelectPreset('nord')} t={t} />
                            <PreviewCard classes={THEMES.forest} label="forest" active={currentTheme === 'forest'} onClick={() => handleSelectPreset('forest')} t={t} />
                            <PreviewCard classes={THEMES.ocean} label="ocean" active={currentTheme === 'ocean'} onClick={() => handleSelectPreset('ocean')} t={t} />
                            <PreviewCard classes={THEMES.sunset} label="sunset" active={currentTheme === 'sunset'} onClick={() => handleSelectPreset('sunset')} t={t} />
                            <PreviewCard classes={THEMES.coffee} label="coffee" active={currentTheme === 'coffee'} onClick={() => handleSelectPreset('coffee')} t={t} />
                            <PreviewCard classes={THEMES.rose} label="rose" active={currentTheme === 'rose'} onClick={() => handleSelectPreset('rose')} t={t} />
                            <PreviewCard classes={THEMES.cyberpunk} label="cyberpunk" active={currentTheme === 'cyberpunk'} onClick={() => handleSelectPreset('cyberpunk')} t={t} />
                            
                            <PreviewCard classes={THEMES.dark} label="system" active={currentTheme === 'system'} onClick={() => handleSelectPreset('system')} t={t} />
                        </div>
                    )}

                    {mode === 'secret' && data.settings?.dev && (
                        <div className="space-y-4">
                            <p className="text-sm opacity-70 mb-4">Ezek a témák automatikusan aktiválódnak az adott napokon. Kattints rájuk a manuális aktiváláshoz!</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {HOLIDAY_THEMES.map(holiday => (
                                    <PreviewCard 
                                        key={holiday.id}
                                        classes={holiday.colors} 
                                        label={`${holiday.emoji} ${holiday.name} (${holiday.getDisplayDate(new Date().getFullYear())})`}
                                        active={data.settings?.activeHoliday === holiday.id}
                                        onClick={() => handlePreviewSecret(holiday.id)}
                                        noTranslate={true}
                                        t={t}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {mode === 'creator' && (
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-xs font-bold uppercase mb-3 opacity-70">{t('theme.preview')}</h4>
                                <div className="p-4 rounded-xl border-2 border-white/10" style={{ backgroundColor: customBg || 'transparent' }}>
                                    <PreviewCard classes={customPreviewClasses} label="custom" active={currentTheme === 'custom'} onClick={() => {}} t={t} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xs font-bold uppercase mb-3 opacity-70">{t('theme.base')}</h4>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCustomBase('dark')} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${customBase === 'dark' ? 'border-emerald-500 bg-zinc-900' : 'border-transparent bg-zinc-900 opacity-50'}`}>
                                            <Moon className="w-5 h-5 text-white" />
                                            <span className="text-xs font-bold text-white">Dark</span>
                                        </button>
                                        <button onClick={() => setCustomBase('light')} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${customBase === 'light' ? 'border-emerald-500 bg-white' : 'border-transparent bg-white opacity-50'}`}>
                                            <Sun className="w-5 h-5 text-black" />
                                            <span className="text-xs font-bold text-black">Light</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold uppercase mb-3 opacity-70">{t('theme.accent')}</h4>
                                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                        {Object.entries(ACCENT_COLORS).map(([key, val]) => (
                                            <button 
                                                key={key}
                                                onClick={() => setCustomAccent(key)}
                                                className={`w-full aspect-square rounded-lg flex items-center justify-center border-2 transition-all ${customAccent === key ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: val.hex }}
                                                title={val.label}
                                            >
                                                {customAccent === key && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold uppercase mb-3 opacity-70">{t('theme.custom_bg')}</h4>
                                <div className="flex gap-4 items-center">
                                    <input 
                                        type="color" 
                                        value={customBg || '#000000'} 
                                        onChange={(e) => setCustomBg(e.target.value)} 
                                        className="h-10 w-20 rounded cursor-pointer"
                                    />
                                    <Button size="sm" variant="secondary" onClick={() => setCustomBg('')} themeClasses={themeClasses}>
                                        <X className="w-4 h-4" /> Törlés (Alapértelmezett)
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button className="w-full" onClick={handleSaveCustom} themeClasses={themeClasses}>
                                    {t('theme.apply_custom')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {mode === 'typography' && (
                        <div className="space-y-6">
                            <div>
                                <label className={`text-xs font-bold uppercase mb-2 block ${themeClasses.subtext}`}>{t('theme.font_family')}</label>
                                <div className="p-4 border-2 border-dashed rounded-lg text-center hover:bg-black/5 transition-colors cursor-pointer mb-4" onClick={() => fontFileInput.current?.click()}>
                                    <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                    <span className="text-sm font-medium">{customFontName || t('theme.upload_font')}</span>
                                    <input type="file" ref={fontFileInput} className="hidden" accept=".ttf,.woff,.woff2" onChange={handleFontUpload} />
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                                        <input 
                                            className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:ring-2 focus:outline-none transition-all ${themeClasses.input} ${themeClasses.bg}`}
                                            placeholder={t('theme.search_fonts')}
                                            value={fontSearch}
                                            onChange={(e) => setFontSearch(e.target.value)}
                                        />
                                    </div>
                                    <select 
                                        className={`w-full rounded-lg px-4 py-2 border focus:ring-2 focus:outline-none transition-all ${themeClasses.input} ${themeClasses.bg}`}
                                        value={fontFamily}
                                        onChange={(e) => {
                                            setFontFamily(e.target.value);
                                            if (e.target.value !== 'Custom') {
                                                setCustomFontData('');
                                                setCustomFontName('');
                                            }
                                        }}
                                        size={5}
                                    >
                                        <option value="Custom" disabled={!customFontData}>{customFontName ? `Custom (${customFontName})` : 'Custom (Upload to select)'}</option>
                                        {filteredFonts.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={`text-xs font-bold uppercase mb-2 block ${themeClasses.subtext}`}>{t('theme.font_size')} ({fontSize}px)</label>
                                <input 
                                    type="range" 
                                    min="12" 
                                    max="24" 
                                    step="1" 
                                    value={fontSize} 
                                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                                    className="w-full accent-emerald-500 bg-transparent"
                                />
                                <div className="flex justify-between text-[10px] opacity-50 mt-1 font-mono">
                                    <span>12px</span>
                                    <span>24px</span>
                                </div>
                            </div>
                            <div className={`p-4 rounded-lg border ${themeClasses.card} mt-4 overflow-hidden`}>
                                <h4 className="text-lg font-bold mb-2">Lorem Ipsum</h4>
                                <p className="text-sm opacity-80" style={{ fontFamily: fontFamily === 'Custom' ? (customFontName || 'inherit') : fontFamily, fontSize: `${fontSize}px` }}>
                                    Ez egy minta szöveg, hogy lásd, hogyan fog kinézni a naplód az új beállításokkal. A gyors barna róka átugorja a lusta kutyát.
                                    <br/>
                                    The quick brown fox jumps over the lazy dog.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Button className="w-full" onClick={handleSaveTypography} themeClasses={themeClasses} disabled={isSaving}>
                                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('settings.save_settings')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {mode === 'weather' && (
                        <div className="space-y-6">
                            <p className="text-sm opacity-80 mb-4">{t('theme.weather_desc')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {WEATHER_PACKS.map(pack => (
                                    <WeatherPreview key={pack} pack={pack} currentPack={weatherPack} onSelect={setWeatherPack} t={t} />
                                ))}
                            </div>
                            <div className="pt-4">
                                <Button className="w-full" onClick={handleSaveWeather} themeClasses={themeClasses}>
                                    {t('settings.save_settings')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {mode === 'emoji' && (
                        <div className="space-y-6">
                            <p className="text-sm opacity-80 mb-4">{t('theme.emoji_desc')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <EmojiPreview style="noto" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                                <EmojiPreview style="noto-mono" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                                <EmojiPreview style="openmoji" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                                <EmojiPreview style="native" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                                <EmojiPreview style="grayscale" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                                <EmojiPreview style="sepia" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                                <EmojiPreview style="neon" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                                <EmojiPreview style="pop" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                                <EmojiPreview style="soft" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                                <EmojiPreview style="retro" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                                <EmojiPreview style="glitch" currentStyle={emojiStyle} onSelect={setEmojiStyle} t={t} />
                            </div>
                            <div className="pt-4">
                                <Button className="w-full" onClick={handleSaveEmoji} themeClasses={themeClasses} disabled={isSaving}>
                                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('settings.save_settings')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ThemeEditorModal;
