
import React, { useState, useRef, useEffect } from 'react';
import { X, Palette, Check, Monitor, Moon, Sun, PaintBucket, Type, Upload, Search, CloudSun } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { THEMES, ACCENT_COLORS, generateCustomTheme } from '../../constants/theme';
import { GOOGLE_FONTS } from '../../constants/fonts';
import { AppData, ThemeOption, CustomThemeConfig, WeatherIconPack } from '../../types';
import WeatherRenderer from '../ui/WeatherRenderer';

const ThemeEditorModal: React.FC<{
    onClose: () => void;
    data: AppData;
    setData: React.Dispatch<React.SetStateAction<AppData>>;
    currentTheme: ThemeOption;
    setCurrentTheme: (t: ThemeOption) => void;
    themeClasses: any;
    t: (key: string) => string;
}> = ({ onClose, data, setData, currentTheme, setCurrentTheme, themeClasses, t }) => {
    const [mode, setMode] = useState<'presets' | 'creator' | 'typography' | 'weather'>('presets');
    
    // Creator state
    const [customBase, setCustomBase] = useState<'light' | 'dark'>(
        data.settings?.customTheme?.base || 'dark'
    );
    const [customAccent, setCustomAccent] = useState<string>(
        data.settings?.customTheme?.accent || 'c22' // Default to Emerald
    );

    // Typography State
    const [fontFamily, setFontFamily] = useState(data.settings?.typography?.fontFamily || 'Inter');
    const [fontSize, setFontSize] = useState(data.settings?.typography?.fontSize || 16);
    const [customFontName, setCustomFontName] = useState(data.settings?.typography?.customFontName || '');
    const [customFontData, setCustomFontData] = useState(data.settings?.typography?.customFontData || '');
    
    // Weather State
    const [weatherPack, setWeatherPack] = useState<WeatherIconPack>(data.settings?.weatherIconPack || 'outline');

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
        setData(prev => ({ ...prev, settings: { ...prev.settings, theme } }));
    };

    const handleSaveCustom = () => {
        const config: CustomThemeConfig = { base: customBase, accent: customAccent };
        setData(prev => ({ 
            ...prev, 
            settings: { 
                ...prev.settings, 
                theme: 'custom', 
                customTheme: config 
            } 
        }));
        setCurrentTheme('custom');
    };

    const handleSaveTypography = () => {
        setData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                typography: {
                    fontFamily,
                    fontSize,
                    customFontName: fontFamily === 'Custom' ? customFontName : undefined,
                    customFontData: fontFamily === 'Custom' ? customFontData : undefined
                }
            }
        }));
        onClose();
    };

    const handleSaveWeather = () => {
        setData(prev => ({
            ...prev,
            settings: { ...prev.settings, weatherIconPack: weatherPack }
        }));
        onClose();
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

    const PreviewCard = ({ classes, label, active }: { classes: any, label: string, active: boolean }) => (
        <div className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${active ? 'border-emerald-500 scale-[1.02] shadow-lg' : 'border-transparent hover:border-white/20'}`}
             onClick={() => mode === 'presets' ? handleSelectPreset(label as ThemeOption) : null}
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
                <span className="text-xs font-bold text-white uppercase">{t(`theme.${label}`)}</span>
            </div>
            
            {active && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <Check className="w-4 h-4" />
                </div>
            )}
        </div>
    );

    const customPreviewClasses = generateCustomTheme(customBase, customAccent as any);

    const filteredFonts = GOOGLE_FONTS.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()));

    // Weather Pack Preview Component
    const WeatherPreview = ({ pack }: { pack: WeatherIconPack }) => {
        // Mock data for preview
        const conditions: any[] = [
            { condition: 'Clear', icon: '01d' },
            { condition: 'Clouds', icon: '02d' },
            { condition: 'Rain', icon: '10d' },
            { condition: 'Storm', icon: '11d' },
            { condition: 'Snow', icon: '13d' }
        ];

        return (
            <div 
                onClick={() => setWeatherPack(pack)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${weatherPack === pack ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent bg-black/5 hover:border-white/10'}`}
            >
                <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm uppercase">{t(`theme.weather_${pack}`)}</span>
                    {weatherPack === pack && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
                <div className="flex justify-between items-center gap-2">
                    {conditions.map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <WeatherRenderer data={{ temp: 20, condition: c.condition, location: '', icon: c.icon }} pack={pack} className="w-6 h-6" />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

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

                <div className="flex border-b border-white/10 overflow-x-auto">
                    <button onClick={() => setMode('presets')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap ${mode === 'presets' ? 'bg-white/5 text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60'}`}>
                        <Monitor className="w-4 h-4" /> {t('theme.presets')}
                    </button>
                    <button onClick={() => setMode('creator')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap ${mode === 'creator' ? 'bg-white/5 text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60'}`}>
                        <PaintBucket className="w-4 h-4" /> {t('theme.create')}
                    </button>
                    <button onClick={() => setMode('typography')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap ${mode === 'typography' ? 'bg-white/5 text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60'}`}>
                        <Type className="w-4 h-4" /> {t('theme.typography')}
                    </button>
                    <button onClick={() => setMode('weather')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap ${mode === 'weather' ? 'bg-white/5 text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60'}`}>
                        <CloudSun className="w-4 h-4" /> {t('theme.weather_tab')}
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-black/5 flex-1">
                    {mode === 'presets' && (
                        <div className="grid grid-cols-2 gap-4">
                            <PreviewCard classes={THEMES.dark} label="dark" active={currentTheme === 'dark'} />
                            <PreviewCard classes={THEMES.light} label="light" active={currentTheme === 'light'} />
                            <PreviewCard classes={THEMES.lavender} label="lavender" active={currentTheme === 'lavender'} />
                            <PreviewCard classes={THEMES.dark} label="system" active={currentTheme === 'system'} />
                        </div>
                    )}

                    {mode === 'creator' && (
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-xs font-bold uppercase mb-3 opacity-70">{t('theme.preview')}</h4>
                                <PreviewCard classes={customPreviewClasses} label="custom" active={currentTheme === 'custom'} />
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
                                
                                {/* Custom Font Upload Area */}
                                <div className="p-4 border-2 border-dashed rounded-lg text-center hover:bg-black/5 transition-colors cursor-pointer mb-4" onClick={() => fontFileInput.current?.click()}>
                                    <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                    <span className="text-sm font-medium">{customFontName || t('theme.upload_font')}</span>
                                    <input type="file" ref={fontFileInput} className="hidden" accept=".ttf,.woff,.woff2" onChange={handleFontUpload} />
                                </div>

                                {/* Font Selector with Search */}
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
                                            // Reset custom font data when user picks a Google font to ensure preview works
                                            if (e.target.value !== 'Custom') {
                                                setCustomFontData('');
                                                setCustomFontName('');
                                            }
                                        }}
                                        size={5} // Show multiple items
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
                                <Button className="w-full" onClick={handleSaveTypography} themeClasses={themeClasses}>
                                    {t('settings.save_settings')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {mode === 'weather' && (
                        <div className="space-y-6">
                            <p className="text-sm opacity-80 mb-4">{t('theme.weather_desc')}</p>
                            <div className="grid grid-cols-1 gap-4">
                                <WeatherPreview pack="outline" />
                                <WeatherPreview pack="filled" />
                                <WeatherPreview pack="color" />
                                <WeatherPreview pack="emoji" />
                                <WeatherPreview pack="ascii" />
                            </div>
                            <div className="pt-4">
                                <Button className="w-full" onClick={handleSaveWeather} themeClasses={themeClasses}>
                                    {t('settings.save_settings')}
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
