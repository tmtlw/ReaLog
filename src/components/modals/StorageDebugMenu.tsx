import React, { useState } from 'react';
import { Terminal, X, Server, CheckCircle2, HardDrive, Clock, MapPin, FileText } from 'lucide-react';

const StorageDebugMenu: React.FC<{
    onClose: () => void;
    onSwitchMode: (mode: 'server' | 'local') => Promise<void>;
    serverMode: boolean;
    lastError: string;
    themeClasses: any;
}> = ({ onClose, onSwitchMode, serverMode, lastError, themeClasses }) => {
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState("");

    const handleSwitch = async (mode: 'server' | 'local') => {
        setLoading(true);
        setTestResult("");
        try {
            await onSwitchMode(mode);
        } catch (e: any) {
            setTestResult(e.message || "Hiba történt");
        } finally {
            setLoading(false);
        }
    };

    const currentPlace = serverMode ? 'Szerver' : 'Helyi';

    return (
        <div className="fixed bottom-8 left-2 z-[110] animate-fade-in origin-bottom-left">
            <div className={`rounded-lg shadow-xl border p-4 w-72 backdrop-blur-md ${themeClasses.card} ${themeClasses.text}`}>
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                    <h4 className="font-bold text-xs uppercase flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> Rendszernapló
                    </h4>
                    <button onClick={onClose}><X className="w-3 h-3" /></button>
                </div>

                {/* Last Save Log Info */}
                <div className="mb-4 bg-black/10 p-2 rounded text-[10px] space-y-1">
                    <div className="flex items-center gap-2 opacity-70">
                        <Clock className="w-3 h-3" /> Idő: {new Date().toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-2 opacity-70">
                        <MapPin className="w-3 h-3" /> Hely: {currentPlace}
                    </div>
                    <div className="flex items-center gap-2 opacity-70">
                        <FileText className="w-3 h-3" /> Név: Mentés (Auto)
                    </div>
                </div>

                <div className="space-y-2">
                    <button 
                        onClick={() => handleSwitch('server')}
                        disabled={loading}
                        className={`w-full text-left p-2 rounded text-xs flex items-center justify-between transition-colors ${serverMode ? 'bg-emerald-500/20 border border-emerald-500/50' : 'hover:bg-black/5 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2"><Server className="w-3 h-3" /> Saját Szerver (Node / PHP)</span>
                        {serverMode && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </button>

                    <button 
                        onClick={() => handleSwitch('local')}
                        disabled={loading}
                        className={`w-full text-left p-2 rounded text-xs flex items-center justify-between transition-colors ${!serverMode ? 'bg-zinc-500/20 border border-zinc-500/50' : 'hover:bg-black/5 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2"><HardDrive className="w-3 h-3" /> Csak Helyi (Offline)</span>
                        {!serverMode && <CheckCircle2 className="w-3 h-3 opacity-50" />}
                    </button>
                </div>

                {(lastError || testResult) && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-mono text-red-400 break-all">
                        {testResult || lastError}
                    </div>
                )}
                
                {loading && <div className="mt-2 text-center text-[10px] opacity-50 animate-pulse">Kapcsolódás...</div>}
            </div>
        </div>
    );
};

export default StorageDebugMenu;