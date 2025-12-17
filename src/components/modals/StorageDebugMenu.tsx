
import React, { useState } from 'react';
import { Terminal, X, Server, CheckCircle2, HardDrive, Clock, MapPin, FileText, CloudLightning, ChevronRight } from 'lucide-react';
import { CloudConfig } from '../../types';

const StorageDebugMenu: React.FC<{
    onClose: () => void;
    onSwitchMode: (mode: 'server' | 'local') => Promise<void>;
    serverMode: boolean;
    cloudConfig?: CloudConfig;
    lastError: string;
    themeClasses: any;
    t: (key: string) => string;
}> = ({ onClose, onSwitchMode, serverMode, cloudConfig, lastError, themeClasses, t }) => {
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState("");

    const handleSwitch = async (mode: 'server' | 'local') => {
        setLoading(true);
        setTestResult("");
        try {
            await onSwitchMode(mode);
        } catch (e: any) {
            setTestResult(e.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const ModeButton = ({ mode, icon: Icon, title, desc, active, disabled }: any) => (
        <button 
            onClick={() => handleSwitch(mode)}
            disabled={loading || disabled}
            className={`w-full text-left p-3 rounded-lg border flex flex-col gap-1 transition-all group ${active 
                ? 'bg-emerald-500/10 border-emerald-500/50' 
                : 'bg-transparent border-transparent hover:bg-black/5 hover:border-black/10'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className="flex items-center justify-between w-full">
                <span className={`flex items-center gap-2 font-bold text-sm ${active ? 'text-emerald-500' : ''}`}>
                    <Icon className="w-4 h-4" /> {title}
                </span>
                {active && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            <span className={`text-[10px] leading-tight ${themeClasses.subtext} opacity-80 group-hover:opacity-100`}>
                {desc}
            </span>
        </button>
    );

    return (
        <div className="fixed bottom-8 left-2 z-[110] animate-fade-in origin-bottom-left">
            <div className={`rounded-xl shadow-2xl border p-4 w-80 backdrop-blur-xl ${themeClasses.card} ${themeClasses.text}`}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-current border-opacity-10">
                    <h4 className="font-bold text-xs uppercase flex items-center gap-2 opacity-70">
                        <Terminal className="w-3 h-3" /> {t('debug.title')}
                    </h4>
                    <button onClick={onClose}><X className="w-4 h-4 hover:opacity-100 opacity-50" /></button>
                </div>

                <div className="space-y-1">
                    <ModeButton 
                        mode="server" 
                        icon={Server} 
                        title={t('debug.server')} 
                        desc={t('debug.server_desc')}
                        active={serverMode}
                    />
                    
                    <div className="h-px bg-current opacity-10 mx-2 my-1" />

                    <ModeButton 
                        mode="local" 
                        icon={HardDrive} 
                        title={t('debug.local')} 
                        desc={t('debug.local_desc')}
                        active={!serverMode}
                    />
                </div>

                {(lastError || testResult) && (
                    <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-mono text-red-400 break-all">
                        {testResult || lastError}
                    </div>
                )}
                
                {loading && <div className="mt-3 text-center text-[10px] opacity-50 animate-pulse font-mono uppercase">{t('debug.connect')}</div>}
            </div>
        </div>
    );
};

export default StorageDebugMenu;
