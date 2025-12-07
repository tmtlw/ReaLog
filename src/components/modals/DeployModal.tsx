import React, { useState } from 'react';
import { Server, X, RefreshCw, Code, Copy, AlertTriangle } from 'lucide-react';
import { Button, Card } from '../ui';
import { SERVER_CODE_JSCRIPT, SERVER_CODE_PHP, SERVER_CODE_HTACCESS_PHP, SERVER_CODE_HTACCESS_NODE } from '../../constants/serverTemplates';
import { DEFAULT_QUESTIONS } from '../../constants';

const APP_VERSION = "2.9";

const DeployModal: React.FC<{ onClose: () => void, themeClasses: any }> = ({ onClose, themeClasses }) => {
    const [isZipping, setIsZipping] = useState(false);
    const [activeTab, setActiveTab] = useState<'install' | 'files'>('install');
    const [serverType, setServerType] = useState<'nodejs' | 'php'>('php');
    const [errorLog, setErrorLog] = useState<string[]>([]);

    const handleDownloadSource = async () => {
        setIsZipping(true);
        setErrorLog([]);
        
        try {
            // @ts-ignore
            if (typeof window.JSZip === 'undefined') {
                alert("JSZip könyvtár nem töltődött be. Ellenőrizd az internetkapcsolatot és frissíts.");
                setIsZipping(false);
                return;
            }

            // @ts-ignore
            const zip = new window.JSZip();
            
            const files = [
                // Root files
                'index.html', 
                'package.json', 
                'metadata.json', 
                'style.css',
                
                // Source root files
                'src/index.tsx', 
                'src/types.ts', 
                'src/constants.ts', 
                'src/App.tsx',
                
                // Services
                'src/services/storage.ts',
                'src/services/gemini.ts',
                
                // Constants
                'src/constants/theme.ts', 
                'src/constants/serverTemplates.ts',
                
                // Components - UI
                'src/components/ui/index.tsx',
                
                // Components - Layout
                'src/components/layout/StatusBar.tsx',
                'src/components/layout/Navbar.tsx',
                
                // Components - Forms
                'src/components/forms/EntryEditor.tsx',
                
                // Components - Views
                'src/components/views/AtlasView.tsx', 
                'src/components/views/GalleryView.tsx', 
                'src/components/views/CalendarView.tsx', 
                'src/components/views/QuestionManager.tsx',
                'src/components/views/EntryList.tsx',
                
                // Components - Modals
                'src/components/modals/ExportModal.tsx', 
                'src/components/modals/SettingsModal.tsx',
                'src/components/modals/DeployModal.tsx', 
                'src/components/modals/StorageDebugMenu.tsx'
            ];
            
            const failedFiles: string[] = [];
            // @ts-ignore
            const sourceCache = window.__SOURCE_CACHE__ || {};

            await Promise.all(files.map(async (f) => {
                try {
                    const ts = Date.now();
                    const zipPath = f; // Store in zip with original structure (e.g. src/App.tsx)
                    
                    // Try to retrieve from global cache first (avoids 404s for compiled files)
                    // Cache keys usually start with ./
                    const cacheKey = f.startsWith('./') ? f : `./${f}`;
                    if (sourceCache[cacheKey]) {
                        zip.file(zipPath, sourceCache[cacheKey]);
                        return;
                    }

                    // Fallback to fetch
                    const strategies = [
                        f,
                        `./${f}`,
                        f.replace('src/', ''),
                        `./${f.replace('src/', '')}`
                    ];
                    
                    // Special case for index.html - might need root fetch
                    if (f === 'index.html') {
                        strategies.push('.');
                        strategies.push(window.location.pathname.split('/').pop() || 'index.html');
                    }

                    const uniqueStrategies = [...new Set(strategies)];
                    
                    let content = null;
                    for (const url of uniqueStrategies) {
                        try {
                            // Try with timestamp first to bust cache if possible
                            let res = await fetch(`${url}?t=${ts}`);
                            if (!res.ok) {
                                // Retry without timestamp (some static servers dislike query params)
                                res = await fetch(url); 
                            }
                            
                            if (res.ok) {
                                content = await res.text();
                                // Basic validation: check if returned HTML instead of code (common SPA fallback issue)
                                if ((f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.json')) && content.trim().startsWith('<!DOCTYPE')) {
                                    content = null; // invalid
                                    continue; // Try next strategy
                                }
                                break;
                            }
                        } catch(e) { /* ignore and try next */ }
                    }

                    if (content) {
                        zip.file(zipPath, content);
                    } else {
                        // Use hardcoded fallback for package.json if completely missing
                        if (f === 'package.json') {
                            zip.file(f, JSON.stringify({name: "grind-naplo", version: "2.0.0", description: "Grind Napló"}, null, 2));
                        } else {
                            throw new Error(`File not found`);
                        }
                    }
                } catch(e) {
                    console.error(`Failed to load ${f}`, e);
                    failedFiles.push(f);
                }
            }));

            if (failedFiles.length > 0) {
                setErrorLog(prev => [...prev, ...failedFiles.map(f => `Sikertelen letöltés: ${f}`)]);
            }

            // Add server files
            zip.file('api.jscript', SERVER_CODE_JSCRIPT);
            zip.file('api.php', SERVER_CODE_PHP);
            zip.file('entries.json', '[]');
            zip.file('settings.json', '{}');
            zip.file('questions.json', JSON.stringify(DEFAULT_QUESTIONS));
            zip.file('.htaccess', serverType === 'php' ? SERVER_CODE_HTACCESS_PHP : SERVER_CODE_HTACCESS_NODE);

            const content = await zip.generateAsync({type:"blob"});
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `grind-naplo-v${APP_VERSION}-source.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch(e: any) {
            console.error(e);
            setErrorLog(prev => [...prev, `ZIP Hiba: ${e.message}`]);
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
                            <p className={`text-xs ${themeClasses.subtext}`}>Verzió {APP_VERSION} (Saját Szerver)</p>
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
                                    {isZipping ? "Csomagolás..." : `Teljes Forráskód Letöltése v${APP_VERSION} (.zip)`}
                                </Button>
                                <p className="text-[10px] text-center mt-2 opacity-50">Adatok (bejegyzések) nélkül</p>
                                
                                {errorLog.length > 0 && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                                        <div className="flex items-center gap-2 font-bold mb-2 text-red-400">
                                            <AlertTriangle className="w-4 h-4" /> Hibák a letöltés során
                                        </div>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {errorLog.map((err, i) => <li key={i}>{err}</li>)}
                                        </ul>
                                        <p className="mt-2 opacity-70">Tipp: Frissítsd az oldalt és próbáld újra.</p>
                                    </div>
                                )}
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

export default DeployModal;