import React, { useState, useEffect, useRef } from 'react';
import { Server, HardDrive, RefreshCw, AlertCircle, CheckCircle2, Database, Activity, ChevronUp, Save, X, Trash2 } from 'lucide-react';

interface LogEntry {
    id: string;
    timestamp: number;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

const StatusBar: React.FC<{
    serverMode: boolean;
    syncStatus: 'idle' | 'syncing' | 'error' | 'success' | 'auto_syncing' | 'auto_success';
    lastSyncTime: number | null;
    systemMessage: string;
    themeClasses: any;
    cloudEnabled: boolean;
    onOpenDebug: () => void;
    t: (key: string) => string;
}> = ({ serverMode, syncStatus, lastSyncTime, systemMessage, themeClasses, cloudEnabled, onOpenDebug, t }) => {
    
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [log, setLog] = useState<LogEntry[]>([]);
    const prevSystemMessage = useRef(systemMessage);
    const prevSyncStatus = useRef(syncStatus);

    // Watch for System Messages (Errors usually)
    useEffect(() => {
        if (systemMessage && systemMessage !== prevSystemMessage.current) {
             addLog(systemMessage, 'error'); 
        }
        prevSystemMessage.current = systemMessage;
    }, [systemMessage]);

    // Watch for Sync Status
    useEffect(() => {
        if (syncStatus !== prevSyncStatus.current) {
            if (syncStatus === 'success') addLog(t('status.saved'), 'success');
            if (syncStatus === 'error') addLog(t('status.save_error'), 'error');
            if (syncStatus === 'auto_success') addLog(t('status.auto_saved'), 'success');
        }
        prevSyncStatus.current = syncStatus;
    }, [syncStatus]);

    const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'warning') => {
        const newEntry: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            message: msg,
            type
        };
        setLog(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50
    };

    const getServerStatus = () => {
        if (serverMode) return { icon: <Server className="w-3 h-3 text-emerald-500" />, text: t('status.server_online') };
        if (cloudEnabled) return { icon: <Activity className="w-3 h-3 text-blue-500" />, text: t('status.cloud_active') };
        return { icon: <HardDrive className="w-3 h-3 opacity-50" />, text: t('status.local_storage') };
    };

    const getSyncStatus = () => {
        if (syncStatus === 'syncing') return { icon: <RefreshCw className="w-3 h-3 animate-spin text-yellow-500" />, text: t('status.saving') };
        if (syncStatus === 'auto_syncing') return { icon: <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />, text: t('status.auto_saving') };
        if (syncStatus === 'error') return { icon: <AlertCircle className="w-3 h-3 text-red-500" />, text: t('status.save_error') };
        if (syncStatus === 'success') return { icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />, text: t('status.saved') };
        if (syncStatus === 'auto_success') return { icon: <Save className="w-3 h-3 text-blue-500" />, text: t('status.auto_saved') };
        return { icon: <Database className="w-3 h-3 opacity-50" />, text: t('status.ready') };
    };

    const getSystemStatus = () => {
        if (systemMessage) return { icon: <Activity className="w-3 h-3 text-red-500" />, text: systemMessage, isError: true };
        
        const time = lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : "--:--";
        
        return { 
            icon: <Activity className="w-3 h-3 opacity-50" />, 
            text: `${t('status.system_ok')} (${time})`, 
            isError: false 
        };
    };

    const server = getServerStatus();
    const sync = getSyncStatus();
    const system = getSystemStatus();

    return (
        <>
            {isLogOpen && (
                <div className={`fixed bottom-6 right-0 w-80 h-64 border-t border-l rounded-tl-lg shadow-xl z-[90] flex flex-col backdrop-blur-md animate-fade-in origin-bottom-right ${themeClasses.card} ${themeClasses.text}`}>
                    <div className="flex items-center justify-between p-2 border-b border-white/10 bg-black/5">
                        <span className="text-[10px] font-bold uppercase flex items-center gap-2">
                            <Activity className="w-3 h-3" /> {t('status.log_title')}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setLog([])} className="opacity-50 hover:opacity-100" title={t('status.clear_log')}>
                                <Trash2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => setIsLogOpen(false)} className="opacity-50 hover:opacity-100">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {log.length === 0 ? (
                            <div className="text-[10px] opacity-30 text-center py-4">- Empty -</div>
                        ) : (
                            log.map(entry => (
                                <div key={entry.id} className="text-[10px] flex gap-2 border-b border-white/5 pb-1 last:border-0">
                                    <span className="opacity-30 font-mono whitespace-nowrap">
                                        {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                    </span>
                                    <span className={`${entry.type === 'error' ? 'text-red-400' : entry.type === 'success' ? 'text-emerald-400' : 'opacity-80'}`}>
                                        {entry.message}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <div className={`fixed bottom-0 left-0 right-0 h-6 border-t flex items-center text-[10px] font-mono z-[100] select-none ${themeClasses.statusBar}`}>
                <div 
                    onClick={onOpenDebug}
                    className="flex-1 flex items-center justify-start px-3 gap-2 border-r border-current border-opacity-10 h-full overflow-hidden whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors relative group"
                    title={t('status.tooltip')}
                >
                    {server.icon}
                    <span className="opacity-90 font-semibold">{server.text}</span>
                    <ChevronUp className="w-2 h-2 ml-auto opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className={`flex-1 flex items-center justify-center px-3 gap-2 border-r border-current border-opacity-10 h-full overflow-hidden whitespace-nowrap ${syncStatus.includes('auto') ? 'text-blue-500' : ''}`}>
                    {sync.icon}
                    <span className="opacity-90 font-semibold">{sync.text}</span>
                </div>
                <div 
                    className={`flex-1 flex items-center justify-end px-3 gap-2 h-full overflow-hidden whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors group ${system.isError ? 'bg-red-500/10 text-red-500' : ''}`}
                    onClick={() => setIsLogOpen(!isLogOpen)}
                    title={t('status.log_tooltip')}
                >
                    <span className="opacity-80 truncate">{system.text}</span>
                    {system.icon}
                    <ChevronUp className={`w-2 h-2 ml-1 opacity-30 group-hover:opacity-100 transition-transform ${isLogOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
        </>
    );
};

export default StatusBar;