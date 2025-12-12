
import React, { useState } from 'react';
import { Info, ExternalLink, Heart, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { Button } from '../ui';
import { APP_VERSION, CHANGELOG } from '../../changelog';
import UpdateModal from '../modals/UpdateModal';

interface SettingsAboutTabProps {
    themeClasses: any;
    t: (key: string) => string;
    isCheckingUpdate: boolean;
    updateInfo: {version: string, changes: string[], url: string, error?: string} | null;
    cardBg: string;
}

const SettingsAboutTab: React.FC<SettingsAboutTabProps> = ({ themeClasses, t, isCheckingUpdate, updateInfo, cardBg }) => {
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    
    // Determine Update State
    const hasError = updateInfo?.error;
    const isNewVersion = updateInfo && !hasError && updateInfo.version !== APP_VERSION;
    const isUpToDate = updateInfo && !hasError && updateInfo.version === APP_VERSION;

    return (
        <div className="flex flex-col flex-1 min-h-0 relative isolate animate-fade-in">
            {showUpdateModal && <UpdateModal onClose={() => setShowUpdateModal(false)} themeClasses={themeClasses} t={t} />}
            
            <style>{`
                .lobster-font-important {
                    font-family: 'Lobster', cursive !important;
                }
            `}</style>
            <div className={`p-6 pb-4 shrink-0 border-b border-white/5 z-20 text-center ${cardBg} transition-colors`}>
                <div className="mb-2">
                    <h2 className="lobster-font-important text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent tracking-tighter drop-shadow-sm">ReaLog</h2>
                    <p className={`text-xs opacity-60 font-mono mt-1`}>v{APP_VERSION}</p>
                </div>
                
                {isCheckingUpdate ? (
                    <div className="text-[10px] opacity-50 animate-pulse mt-2">{t('settings.checking_update')}...</div>
                ) : (
                    <div className="mt-4 flex flex-col items-center gap-2">
                        {hasError && (
                            <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                                <AlertTriangle className="w-3 h-3" />
                                {t('settings.update_error')}: {updateInfo?.changes[0]}
                            </div>
                        )}

                        {isUpToDate && (
                            <div className="flex items-center gap-2 text-xs font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                {t('settings.uptodate')}
                            </div>
                        )}

                        {isNewVersion && (
                            <>
                                <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded animate-pulse">
                                    {t('settings.new_version')}: v{updateInfo?.version}
                                </div>
                                <Button 
                                    size="sm" 
                                    themeClasses={themeClasses} 
                                    onClick={() => setShowUpdateModal(true)}
                                    className="animate-bounce mt-1"
                                >
                                    <Download className="w-3 h-3" /> {t('settings.update_btn')}
                                </Button>
                                
                                {updateInfo && updateInfo.changes.length > 0 && (
                                    <div className="w-full mt-2 text-left bg-black/10 p-3 rounded text-[10px] border border-white/5">
                                        <strong className="block mb-1 opacity-70 uppercase tracking-wider">{t('settings.whats_new')}:</strong>
                                        <ul className="list-disc pl-3 space-y-0.5 opacity-80">
                                            {updateInfo.changes.map((c, i) => (
                                                <li key={i}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-black/5 min-h-0">
                <div className="p-0 space-y-6">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase opacity-70 mb-4 sticky top-0 bg-transparent">
                        <Info className="w-4 h-4" /> Változásnapló
                    </div>
                    {CHANGELOG.map((log, idx) => (
                        <div key={idx} className="relative pl-4 border-l-2 border-current border-opacity-10 text-left">
                            <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-current opacity-30'}`}></div>
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-bold text-sm">v{log.version}</span>
                                <span className="text-[10px] opacity-50 font-mono">{log.date}</span>
                            </div>
                            <ul className="text-xs space-y-1 opacity-80 list-disc pl-3">
                                {log.changes.map((change, cIdx) => (
                                    <li key={cIdx}>{change}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`p-4 pt-2 shrink-0 text-center border-t border-white/5 z-20 text-sm font-medium text-pink-500 flex items-center justify-center gap-2 ${cardBg} transition-colors`}>
                <span className="animate-pulse flex items-center gap-2">Szeretettel Rea-nak <Heart className="w-4 h-4 fill-current" /></span>
            </div>
        </div>
    );
};

export default SettingsAboutTab;
