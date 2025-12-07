import React from 'react';
import { 
  Map as MapIcon, Images, Download, Server, Settings, LogOut, Lock, Menu 
} from 'lucide-react';
import { Category } from '../../types';
import { CATEGORY_LABELS } from '../../constants';
import { Button } from '../ui';

interface NavbarProps {
    appName: string;
    activeCategory: Category;
    setActiveCategory: (c: Category) => void;
    globalView: 'none' | 'atlas' | 'gallery';
    setGlobalView: (v: 'none' | 'atlas' | 'gallery') => void;
    setActiveTab: (t: 'entries' | 'questions') => void;
    isAdmin: boolean;
    onOpenExport: () => void;
    onOpenDeploy: () => void;
    onOpenSettings: () => void;
    onLogout: () => void;
    onOpenAuth: () => void;
    themeClasses: any;
    showMobileMenu: boolean;
    setShowMobileMenu: (show: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
    appName, activeCategory, setActiveCategory, globalView, setGlobalView, setActiveTab,
    isAdmin, onOpenExport, onOpenDeploy, onOpenSettings, onLogout, onOpenAuth,
    themeClasses, showMobileMenu, setShowMobileMenu
}) => {
    return (
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
                            <button onClick={onOpenExport} className="p-2 opacity-50 hover:opacity-100" title="Export / Import"><Download className="w-5 h-5" /></button>
                            <button onClick={onOpenDeploy} className="p-2 opacity-50 hover:opacity-100" title="Telepítés"><Server className="w-5 h-5" /></button>
                            <button onClick={onOpenSettings} className="p-2 opacity-50 hover:opacity-100" title="Beállítások"><Settings className="w-5 h-5" /></button>
                        </>
                    )}
                    
                    {isAdmin ? (
                        <button onClick={onLogout} className="p-2 opacity-50 hover:opacity-100 text-red-500" title="Kijelentkezés"><LogOut className="w-5 h-5" /></button>
                    ) : (
                        <button onClick={onOpenAuth} className="p-2 opacity-50 hover:opacity-100" title="Admin belépés"><Lock className="w-5 h-5" /></button>
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
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { onOpenExport(); setShowMobileMenu(false); }} className="w-full justify-start"><Download className="w-4 h-4" /> Export / Import</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { onOpenDeploy(); setShowMobileMenu(false); }} className="w-full justify-start"><Server className="w-4 h-4" /> Telepítés</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => { onOpenSettings(); setShowMobileMenu(false); }} className="w-full justify-start"><Settings className="w-4 h-4" /> Beállítások</Button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;