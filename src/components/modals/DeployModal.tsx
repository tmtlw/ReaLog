
import React, { useState } from 'react';
import { Server, X, RefreshCw, Code, Copy, AlertTriangle } from 'lucide-react';
import { Button, Card } from '../ui';
import { SERVER_CODE_JSCRIPT, SERVER_CODE_PHP, SERVER_CODE_HTACCESS_PHP, SERVER_CODE_HTACCESS_NODE } from '../../constants/serverTemplates';
import { DEFAULT_QUESTIONS } from '../../constants';

const APP_VERSION = "4.5.3";

const DeployModal: React.FC<{ onClose: () => void, themeClasses: any, t: (key: string) => string }> = ({ onClose, themeClasses, t }) => {
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
                alert("JSZip library not loaded.");
                setIsZipping(false);
                return;
            }

            // @ts-ignore
            const zip = new window.JSZip();
            // @ts-ignore
            const sourceCache = window.__SOURCE_CACHE__ || {};
            
            // Get all files loaded by the system + index.html
            // This ensures new files added to index.html are automatically included
            const allLoadedFiles = Object.keys(sourceCache);
            const filesToZip = Array.from(new Set(['index.html', 'sw.js', ...allLoadedFiles]));
            
            const failedFiles: string[] = [];

            await Promise.all(filesToZip.map(async (f) => {
                try {
                    let content = sourceCache[f];
                    
                    // If content is not in cache (e.g. index.html or fetched directly), try to fetch it
                    if (!content) {
                        const strategies = [f];
                        if (f === 'index.html') {
                            strategies.push('./index.html');
                            strategies.push(window.location.pathname.split('/').pop() || 'index.html');
                        } else if (!f.startsWith('./') && !f.startsWith('/')) {
                            strategies.push(`./${f}`);
                        }

                        for (const url of strategies) {
                            try {
                                const res = await fetch(url);
                                if (res.ok) {
                                    content = await res.text();
                                    // Protect against loading HTML for code files (404 fallback)
                                    if ((f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.json')) && content.trim().startsWith('<!DOCTYPE')) {
                                        content = null;
                                        continue;
                                    }
                                    break;
                                }
                            } catch(e) { }
                        }
                    }

                    // Normalize path for Zip (remove ./ prefix)
                    const zipPath = f.startsWith('./') ? f.substring(2) : f;

                    if (content) {
                        zip.file(zipPath, content);
                    } else if (zipPath === 'package.json') {
                        // Fallback for package.json
                        zip.file(zipPath, JSON.stringify({name: "realog", version: APP_VERSION, description: "ReaLog"}, null, 2));
                    } else {
                        // Silent fail for non-critical assets, or log
                        // console.warn(`Could not load ${f}`);
                    }
                } catch(e) {
                    console.error(`Failed to load ${f}`, e);
                    failedFiles.push(f);
                }
            }));

            if (failedFiles.length > 0) setErrorLog(prev => [...prev, ...failedFiles.map(f => `${t('deploy.download_error')}: ${f}`)]);

            zip.file('api.jscript', SERVER_CODE_JSCRIPT);
            zip.file('api.php', SERVER_CODE_PHP);
            
            // Place defaults in ROOT. Server scripts will prioritize posts/questions.json if it exists.
            zip.file('questions.json', JSON.stringify(DEFAULT_QUESTIONS));
            
            zip.file('.htaccess', serverType === 'php' ? SERVER_CODE_HTACCESS_PHP : SERVER_CODE_HTACCESS_NODE);

            const content = await zip.generateAsync({type:"blob"});
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `realog-v${APP_VERSION}-source.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch(e: any) {
            console.error(e);
            setErrorLog(prev => [...prev, `${t('deploy.zip_error')}: ${e.message}`]);
        } finally {
            setIsZipping(false);
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert(t('deploy.clipboard_copied'));
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
            <Card themeClasses={themeClasses} className="w-full max-w-2xl p-0 shadow-2xl relative flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500"><Server className="w-6 h-6" /></div>
                        <div>
                            <h3 className="text-xl font-bold">{t('deploy.title')}</h3>
                            <p className={`text-xs ${themeClasses.subtext}`}>v{APP_VERSION} ({t('deploy.subtitle')})</p>
                        </div>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                </div>

                <div className="flex border-b border-white/10">
                    <button onClick={() => setActiveTab('install')} className={`flex-1 p-3 text-sm font-bold ${activeTab === 'install' ? 'bg-white/5 text-emerald-500 border-b-2 border-emerald-500' : 'opacity-60'}`}>{t('deploy.guide')}</button>
                    <button onClick={() => setActiveTab('files')} className={`flex-1 p-3 text-sm font-bold ${activeTab === 'files' ? 'bg-white/5 text-emerald-500 border-b-2 border-emerald-500' : 'opacity-60'}`}>{t('deploy.files')}</button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {activeTab === 'install' ? (
                        <div className="space-y-6">
                            <div>
                                <h4 className={`text-sm font-bold uppercase mb-2 ${themeClasses.accent}`}>{t('deploy.manual_title')}</h4>
                                <ol className={`text-sm space-y-2 list-decimal pl-4 ${themeClasses.subtext}`}>
                                    <li>{t('deploy.step_1')}</li>
                                    <li>{t('deploy.step_2')}</li>
                                    <li>{t('deploy.step_3')}</li>
                                    <li>{t('deploy.step_4')}</li>
                                    <li>{t('deploy.step_5')}</li>
                                </ol>
                                <p className="text-xs mt-2 italic opacity-70">{t('deploy.note')}</p>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <h4 className={`text-sm font-bold uppercase mb-2 ${themeClasses.accent}`}>{t('deploy.lang_title')}</h4>
                                <ol className={`text-sm space-y-2 list-decimal pl-4 ${themeClasses.subtext}`}>
                                    <li>{t('deploy.lang_step_1')}</li>
                                    <li>{t('deploy.lang_step_2')}</li>
                                    <li>{t('deploy.lang_step_3')}</li>
                                </ol>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <Button onClick={handleDownloadSource} themeClasses={themeClasses} className="w-full" disabled={isZipping}>
                                    {isZipping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
                                    {isZipping ? t('deploy.zipping') : t('deploy.download_btn')}
                                </Button>
                                <p className="text-[10px] text-center mt-2 opacity-50">{t('deploy.no_data')}</p>
                                
                                {errorLog.length > 0 && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                                        <div className="flex items-center gap-2 font-bold mb-2 text-red-400">
                                            <AlertTriangle className="w-4 h-4" /> Error
                                        </div>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {errorLog.map((err, i) => <li key={i}>{err}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
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
                                     <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className={`text-sm font-bold uppercase ${themeClasses.accent}`}>api.jscript</label>
                                            <Button size="sm" variant="secondary" themeClasses={themeClasses} onClick={() => copyToClipboard(SERVER_CODE_JSCRIPT)}>
                                                <Copy className="w-3 h-3" /> {t('deploy.copy')}
                                            </Button>
                                        </div>
                                        <div className="relative">
                                            <pre className="bg-black/20 p-4 rounded-lg text-[10px] md:text-xs overflow-x-auto border border-white/10 max-h-48 overflow-y-auto">
                                                <code>{SERVER_CODE_JSCRIPT}</code>
                                            </pre>
                                            <div className="absolute top-2 right-2 text-[10px] bg-red-500/20 text-red-400 px-2 rounded">{t('deploy.chmod_warning')}</div>
                                        </div>
                                     </div>

                                     <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className={`text-sm font-bold uppercase ${themeClasses.accent}`}>.htaccess (Node)</label>
                                            <Button size="sm" variant="secondary" themeClasses={themeClasses} onClick={() => copyToClipboard(SERVER_CODE_HTACCESS_NODE)}>
                                                <Copy className="w-3 h-3" /> {t('deploy.copy')}
                                            </Button>
                                        </div>
                                        <pre className="bg-black/20 p-4 rounded-lg text-[10px] md:text-xs overflow-x-auto border border-white/10">
                                            <code>{SERVER_CODE_HTACCESS_NODE}</code>
                                        </pre>
                                     </div>
                                 </>
                             ) : (
                                 <>
                                     <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold uppercase text-blue-400">api.php</label>
                                            <Button size="sm" variant="secondary" themeClasses={themeClasses} onClick={() => copyToClipboard(SERVER_CODE_PHP)}>
                                                <Copy className="w-3 h-3" /> {t('deploy.copy')}
                                            </Button>
                                        </div>
                                        <div className="relative">
                                            <pre className="bg-black/20 p-4 rounded-lg text-[10px] md:text-xs overflow-x-auto border border-white/10 max-h-48 overflow-y-auto">
                                                <code>{SERVER_CODE_PHP}</code>
                                            </pre>
                                        </div>
                                     </div>

                                     <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold uppercase text-blue-400">.htaccess (PHP)</label>
                                            <Button size="sm" variant="secondary" themeClasses={themeClasses} onClick={() => copyToClipboard(SERVER_CODE_HTACCESS_PHP)}>
                                                <Copy className="w-3 h-3" /> {t('deploy.copy')}
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
