
import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Button, Card } from '../ui';
import { performUpdate } from '../../services/updater';

interface UpdateModalProps {
    onClose: () => void;
    themeClasses: any;
    t: (key: string) => string;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ onClose, themeClasses, t }) => {
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("Inicializálás...");
    const [error, setError] = useState("");

    const startUpdate = async () => {
        setStatus('running');
        setError("");
        try {
            await performUpdate((msg, prog) => {
                setMessage(msg);
                setProgress(prog);
            });
            setStatus('success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (e: any) {
            setStatus('error');
            setError(e.message || "Ismeretlen hiba történt.");
        }
    };

    // Auto-start
    useEffect(() => {
        startUpdate();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-fade-in">
            <Card themeClasses={themeClasses} className="w-full max-w-md p-6 shadow-2xl relative border-2 border-emerald-500/30">
                {status !== 'running' && (
                    <button onClick={onClose} className="absolute top-4 right-4 opacity-50 hover:opacity-100"><X className="w-5 h-5" /></button>
                )}
                
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className={`p-4 rounded-full ${status === 'error' ? 'bg-red-500/20 text-red-500' : status === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500 animate-pulse'}`}>
                            {status === 'running' && <RefreshCw className="w-8 h-8 animate-spin" />}
                            {status === 'success' && <CheckCircle2 className="w-8 h-8" />}
                            {status === 'error' && <AlertTriangle className="w-8 h-8" />}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-2">
                            {status === 'running' && t('update.in_progress')}
                            {status === 'success' && t('update.success')}
                            {status === 'error' && t('update.failed')}
                        </h3>
                        <p className={`text-sm ${themeClasses.subtext}`}>{message}</p>
                    </div>

                    {status === 'running' && (
                        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300 text-left">
                            <strong>Hiba:</strong> {error}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex gap-2">
                            <Button onClick={onClose} variant="ghost" className="flex-1">{t('common.cancel')}</Button>
                            <Button onClick={startUpdate} themeClasses={themeClasses} className="flex-1">{t('update.retry')}</Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default UpdateModal;
