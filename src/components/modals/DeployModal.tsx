import React, { useState } from 'react';
import { Server, X, RefreshCw, Code, Copy } from 'lucide-react';
import { Button, Card } from '../ui';
import { SERVER_CODE_JSCRIPT, SERVER_CODE_PHP, SERVER_CODE_HTACCESS_PHP, SERVER_CODE_HTACCESS_NODE } from '../../constants/serverTemplates';
import { DEFAULT_QUESTIONS } from '../../constants';

const APP_VERSION = "2.8";

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
                // Root configuration & entry points
                'index.html', 'index.tsx', 'types.ts', 'constants.ts', 'style.css', 'package.json', 'metadata.json',
                // Services
                'src/services/storage.ts',
                // Main Component
                'src/App.tsx',
                // Constants
                'src/constants/theme.ts', 'src/constants/serverTemplates.ts',
                // Components - UI
                'src/components/ui/index.tsx',
                // Components - Layout
                'src/components/layout/StatusBar.tsx',
                // Components - Views
                'src/components/views/AtlasView.tsx', 'src/components/views/GalleryView.tsx', 
                'src/components/views/CalendarView.tsx', 'src/components/views/QuestionManager.tsx',
                // Components - Modals
                'src/components/modals/ExportModal.tsx', 'src/components/modals/SettingsModal.tsx',
                'src/components/modals/DeployModal.tsx', 'src/components/modals/StorageDebugMenu.tsx'
            ];
            
            await Promise.all(files.map(async (f) => {
                try {
                    // Try fetching the file. 
                    const res = await fetch(f);
                    if (!res.ok) {
                        // Fallback: try removing 'src/' if not found, just in case of flat deployment
                        const fallbackRes = await fetch(f.replace('src/', ''));
                        if (fallbackRes.ok) {
                            const text = await fallbackRes.text();
                            zip.file(f, text);
                            return;
                        }
                        throw new Error("File not found");
                    }
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
            a.download = `grind-naplo-v${APP_VERSION}-source.zip`;
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