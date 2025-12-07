import React from 'react';
import { Server, CloudLightning, HardDrive, RefreshCw, AlertCircle, CheckCircle2, Database, Activity, ChevronUp } from 'lucide-react';

const StatusBar: React.FC<{
    serverMode: boolean;
    syncStatus: 'idle' | 'syncing' | 'error' | 'success';
    lastSyncTime: number | null;
    systemMessage: string;
    themeClasses: any;
    cloudEnabled: boolean;
    onOpenDebug: () => void;
}> = ({ serverMode, syncStatus, lastSyncTime, systemMessage, themeClasses, cloudEnabled, onOpenDebug }) => {
    const getServerStatus = () => {
        if (serverMode) return { icon: <Server className="w-3 h-3 text-emerald-500" />, text: "Szerver: Online" };
        if (cloudEnabled) return { icon: <CloudLightning className="w-3 h-3 text-blue-500" />, text: "Felhő: Aktív" };
        return { icon: <HardDrive className="w-3 h-3 opacity-50" />, text: "Helyi Tároló" };
    };

    const getSyncStatus = () => {
        if (syncStatus === 'syncing') return { icon: <RefreshCw className="w-3 h-3 animate-spin text-yellow-500" />, text: "Mentés..." };
        if (syncStatus === 'error') return { icon: <AlertCircle className="w-3 h-3 text-red-500" />, text: "Mentési Hiba!" };
        if (syncStatus === 'success') return { icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />, text: "Mentve" };
        return { icon: <Database className="w-3 h-3 opacity-50" />, text: "Kész" };
    };

    const getSystemStatus = () => {
        if (systemMessage) return { icon: <Activity className="w-3 h-3 text-red-500" />, text: systemMessage, isError: true };
        const time = lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : "--:--";
        return { icon: <Activity className="w-3 h-3 opacity-50" />, text: `Rendszer OK (${time})`, isError: false };
    };

    const server = getServerStatus();
    const sync = getSyncStatus();
    const system = getSystemStatus();

    return (
        <div className={`fixed bottom-0 left-0 right-0 h-6 border-t flex items-center text-[10px] font-mono z-[100] select-none ${themeClasses.statusBar}`}>
            <div 
                onClick={onOpenDebug}
                className="flex-1 flex items-center justify-start px-3 gap-2 border-r border-current border-opacity-10 h-full overflow-hidden whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors relative group"
                title="Kattints a tárolási mód váltásához és hibakereséshez"
            >
                {server.icon}
                <span className="opacity-90 font-semibold">{server.text}</span>
                <ChevronUp className="w-2 h-2 ml-auto opacity-30 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1 flex items-center justify-center px-3 gap-2 border-r border-current border-opacity-10 h-full overflow-hidden whitespace-nowrap">
                {sync.icon}
                <span className="opacity-90 font-semibold">{sync.text}</span>
            </div>
            <div className={`flex-1 flex items-center justify-end px-3 gap-2 h-full overflow-hidden whitespace-nowrap ${system.isError ? 'bg-red-500/10 text-red-500' : ''}`}>
                <span className="opacity-80 truncate">{system.text}</span>
                {system.icon}
            </div>
        </div>
    );
};

export default StatusBar;