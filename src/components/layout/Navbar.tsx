
import React, { useState, useRef, useEffect } from 'react';
import { 
  Map as MapIcon, Images, Download, Server, Settings, LogOut, Lock, Menu, Hash, CalendarClock, BookOpen, Palette, ChevronDown, Monitor, MoreVertical, Trash2, PieChart, Trophy, Upload
} from 'lucide-react';
import { Category } from '../../types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../constants';
import { Button } from '../ui';
import EmojiRenderer from '../ui/EmojiRenderer';

interface NavbarProps {
    appName: string;
    activeCategory: Category;
    setActiveCategory: (c: Category) => void;
    globalView: 'none' | 'atlas' | 'gallery' | 'tags' | 'onThisDay' | 'trash' | 'stats' | 'streak';
    setGlobalView: (v: 'none' | 'atlas' | 'gallery' | 'tags' | 'onThisDay' | 'trash' | 'stats' | 'streak') => void;
    setActiveTab: (t: 'entries' | 'questions') => void;
    isAdmin: boolean;
    onOpenExport: () => void;
    onOpenDeploy: () => void;
    onOpenSettings: (tab?: 'views' | 'public' | 'account' | 'about' | 'data') => void;
    onOpenThemeEditor: () => void;
    onLogout: () => void;
    onOpenAuth: () => void;
    themeClasses: any;
    showMobileMenu: boolean;
    setShowMobileMenu: (show: boolean) => void;
    t: (key: string) => string;
    showStats: boolean;
    showGamification: boolean;
    currentStreak: number;
    logoEmoji?: string | null;
}

const Navbar: React.FC<NavbarProps> = ({
    appName, activeCategory, setActiveCategory, globalView, setGlobalView, setActiveTab,
    isAdmin, onOpenExport, onOpenDeploy, onOpenSettings, onOpenThemeEditor, onLogout, onOpenAuth,
    themeClasses, showMobileMenu, setShowMobileMenu, t, showStats, showGamification, currentStreak,
    logoEmoji
}) => {
    const [showDesktopMenu, setShowDesktopMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close desktop menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowDesktopMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getCategoryButtonClass = (cat: Category, isActive: boolean) => {
        if (!isActive) return 'opacity-60 hover:opacity-100 bg-transparent';
        
        // Return fixed colors instead of theme-dependent ones
        switch (cat) {
            case Category.DAILY: return 'bg-emerald-500 text-white shadow-md scale-105';
            case Category.WEEKLY: return 'bg-blue-500 text-white shadow-md scale-105';
            case Category.MONTHLY: return 'bg-purple-500 text-white shadow-md scale-105';
            case Category.YEARLY: return 'bg-amber-500 text-white shadow-md scale-105';
            default: return themeClasses.primaryBtn + ' shadow-md scale-105';
        }
    };

    return (
        <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${themeClasses.nav}`}>
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                
                {/* Left Side: Logo & Desktop Categories */}
                <div className="flex items-center gap-4 flex-1 md:flex-initial overflow-hidden">
                     <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg ${logoEmoji ? 'bg-transparent text-2xl' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'}`}>
                         {logoEmoji ? (
                             <EmojiRenderer emoji={logoEmoji} style="native" />
                         ) : (
                             <BookOpen className="w-5 h-5 text-white" />
                         )}
                     </div>
                     <span className="font-bold text-lg hidden md:block tracking-tight">{appName}</span>

                     {/* Categories */}
                     <div className="flex items-center gap-1 bg-black/5 p-1 rounded-lg border border-black/5 overflow-x-auto no-scrollbar ml-2 md:ml-0">
                        {[Category.DAILY, Category.WEEKLY, Category.MONTHLY, Category.YEARLY].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => { setActiveCategory(cat); setGlobalView('none'); setActiveTab('entries'); }}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${getCategoryButtonClass(cat, activeCategory === cat && globalView === 'none')}`}
                            >
                                {t(`category.${cat.toLowerCase()}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Desktop Icons & Auth / Mobile Menu Toggle */}
                <div className="flex items-center gap-2">
                    
                    {/* Streak Counter (Gamification) */}
                    {showGamification && (
                        <button 
                            onClick={() => setGlobalView('streak')}
                            className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full mr-2 transition-all ${globalView === 'streak' ? 'bg-orange-500 text-white' : 'bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500/20'}`} 
                            title={t('stats.current_streak')}
                        >
                            <Trophy className="w-4 h-4" />
                            <span className="text-xs font-bold">{currentStreak}</span>
                        </button>
                    )}

                    {/* Desktop View Icons - Hidden on Mobile */}
                    <div className="hidden md:flex items-center gap-2">
                        <button onClick={() => setGlobalView('onThisDay')} className={`p-2 rounded-lg transition-all ${globalView === 'onThisDay' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`} title={t('nav.on_this_day')}>
                            <CalendarClock className="w-5 h-5" />
                        </button>
                        <button onClick={() => setGlobalView('tags')} className={`p-2 rounded-lg transition-all ${globalView === 'tags' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`} title={t('nav.tags')}>
                            <Hash className="w-5 h-5" />
                        </button>
                        <button onClick={() => setGlobalView('atlas')} className={`p-2 rounded-lg transition-all ${globalView === 'atlas' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`} title={t('nav.map')}>
                            <MapIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setGlobalView('gallery')} className={`p-2 rounded-lg transition-all ${globalView === 'gallery' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`} title={t('nav.gallery')}>
                            <Images className="w-5 h-5" />
                        </button>
                        
                        <div className="h-6 w-px bg-current opacity-10 mx-1"></div>
                        
                        {isAdmin && (
                            <div className="relative flex gap-2" ref={menuRef}>
                                <button 
                                    onClick={() => setGlobalView('trash')} 
                                    className={`p-2 rounded-lg transition-all ${globalView === 'trash' ? 'bg-red-500 text-white' : 'opacity-50 hover:opacity-100 hover:text-red-500'}`}
                                    title={t('nav.trash')}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                <button 
                                    onClick={() => setShowDesktopMenu(!showDesktopMenu)} 
                                    className={`p-2 rounded-lg transition-all ${showDesktopMenu ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`}
                                    title={t('nav.menu')}
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>

                                {showDesktopMenu && (
                                    <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border overflow-hidden animate-fade-in ${themeClasses.card}`}>
                                        <div className="p-1 space-y-0.5">
                                            {showStats && (
                                                <button onClick={() => { setGlobalView('stats'); setShowDesktopMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-bold rounded hover:bg-black/5 flex items-center gap-2">
                                                    <PieChart className="w-4 h-4" /> {t('nav.stats')}
                                                </button>
                                            )}
                                            <button onClick={() => { onOpenThemeEditor(); setShowDesktopMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-bold rounded hover:bg-black/5 flex items-center gap-2">
                                                <Palette className="w-4 h-4" /> {t('nav.appearance')}
                                            </button>
                                            <button onClick={() => { onOpenExport(); setShowDesktopMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-bold rounded hover:bg-black/5 flex items-center gap-2">
                                                <Download className="w-4 h-4" /> {t('nav.export')}
                                            </button>
                                            <button onClick={() => { onOpenSettings('data'); setShowDesktopMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-bold rounded hover:bg-black/5 flex items-center gap-2">
                                                <Upload className="w-4 h-4" /> {t('settings.backup_title')}
                                            </button>
                                            <button onClick={() => { onOpenDeploy(); setShowDesktopMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-bold rounded hover:bg-black/5 flex items-center gap-2">
                                                <Server className="w-4 h-4" /> {t('nav.deploy')}
                                            </button>
                                            <div className="h-px bg-current opacity-10 my-1"></div>
                                            <button onClick={() => { onOpenSettings(); setShowDesktopMenu(false); }} className="w-full text-left px-3 py-2 text-xs font-bold rounded hover:bg-black/5 flex items-center gap-2">
                                                <Settings className="w-4 h-4" /> {t('nav.settings')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Auth Button */}
                    {isAdmin ? (
                        <button onClick={onLogout} className="p-2 opacity-50 hover:opacity-100 text-red-500" title={t('nav.logout')}><LogOut className="w-5 h-5" /></button>
                    ) : (
                        <button onClick={onOpenAuth} className="p-2 opacity-50 hover:opacity-100" title={t('nav.login')}><Lock className="w-5 h-5" /></button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 opacity-50"><Menu className="w-5 h-5" /></button>
                </div>
            </div>
            
            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
                <div className="md:hidden border-t p-4 space-y-4 animate-fade-in bg-inherit">
                    {showGamification && (
                        <button onClick={() => { setGlobalView('streak'); setShowMobileMenu(false); }} className="w-full flex items-center justify-center gap-2 mb-4 p-2 bg-orange-500/10 rounded-lg">
                            <Trophy className="w-5 h-5 text-orange-500" />
                            <span className="font-bold text-orange-500">{t('stats.current_streak')}: {currentStreak}</span>
                        </button>
                    )}
                    <div className="grid grid-cols-4 gap-2">
                        {showStats && (
                            <button onClick={() => { setGlobalView('stats'); setShowMobileMenu(false); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${globalView === 'stats' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`}>
                                <PieChart className="w-5 h-5" />
                                <span className="text-[10px]">{t('nav.stats')}</span>
                            </button>
                        )}
                        <button onClick={() => { setGlobalView('onThisDay'); setShowMobileMenu(false); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${globalView === 'onThisDay' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`}>
                            <CalendarClock className="w-5 h-5" />
                            <span className="text-[10px]">{t('nav.on_this_day')}</span>
                        </button>
                        <button onClick={() => { setGlobalView('tags'); setShowMobileMenu(false); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${globalView === 'tags' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`}>
                            <Hash className="w-5 h-5" />
                            <span className="text-[10px]">{t('nav.tags')}</span>
                        </button>
                        <button onClick={() => { setGlobalView('atlas'); setShowMobileMenu(false); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${globalView === 'atlas' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`}>
                            <MapIcon className="w-5 h-5" />
                            <span className="text-[10px]">{t('nav.map')}</span>
                        </button>
                        <button onClick={() => { setGlobalView('gallery'); setShowMobileMenu(false); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${globalView === 'gallery' ? themeClasses.accent + ' bg-black/5' : 'opacity-50 hover:opacity-100'}`}>
                            <Images className="w-5 h-5" />
                            <span className="text-[10px]">{t('nav.gallery')}</span>
                        </button>
                    </div>

                    {isAdmin && (
                        <div className="pt-2 border-t border-current border-opacity-10 space-y-2">
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { setGlobalView('trash'); setShowMobileMenu(false); }} className="w-full justify-start text-red-500"><Trash2 className="w-4 h-4" /> {t('nav.trash')}</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { onOpenThemeEditor(); setShowMobileMenu(false); }} className="w-full justify-start"><Palette className="w-4 h-4" /> {t('nav.appearance')}</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { onOpenExport(); setShowMobileMenu(false); }} className="w-full justify-start"><Download className="w-4 h-4" /> {t('nav.export')}</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { onOpenSettings('data'); setShowMobileMenu(false); }} className="w-full justify-start"><Upload className="w-4 h-4" /> {t('settings.backup_title')}</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { onOpenDeploy(); setShowMobileMenu(false); }} className="w-full justify-start"><Server className="w-4 h-4" /> {t('nav.deploy')}</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { onOpenSettings(); setShowMobileMenu(false); }} className="w-full justify-start"><Settings className="w-4 h-4" /> {t('nav.settings')}</Button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
