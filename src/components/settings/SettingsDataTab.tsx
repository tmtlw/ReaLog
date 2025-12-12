
import React from 'react';
import { Database, AlertTriangle, RefreshCw, Upload, Trash2, History } from 'lucide-react';
import { Button } from '../ui';

interface SettingsDataTabProps {
    themeClasses: any;
    t: (key: string) => string;
    dbSize: string;
    backups: any[];
    isLoadingBackups: boolean;
    onCreateBackup: () => void;
    onRestoreBackup: (filename: string) => void;
    onDeleteSampleData: () => void;
    onResetDiary: () => void;
}

const SettingsDataTab: React.FC<SettingsDataTabProps> = ({ 
    themeClasses, t, dbSize, backups, isLoadingBackups, 
    onCreateBackup, onRestoreBackup, onDeleteSampleData, onResetDiary 
}) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm">
                <h4 className="font-bold flex items-center gap-2 mb-2 text-red-500"><AlertTriangle className="w-4 h-4" /> {t('settings.data_management')}</h4>
                <p className="opacity-80">Az itt végrehajtott műveletek visszafordíthatatlanok lehetnek. Kérjük, légy óvatos!</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-black/5 border border-white/5">
                <span className="text-sm flex items-center gap-2"><Database className="w-4 h-4 opacity-70" /> {t('settings.db_size')}</span>
                <span className="text-sm font-mono font-bold">{dbSize} MB</span>
            </div>
            <div className="space-y-4">
                <h5 className={`font-bold text-xs uppercase mb-2 ${themeClasses.subtext}`}>{t('settings.backup_title')}</h5>
                <div className="flex gap-2">
                    <Button themeClasses={themeClasses} onClick={onCreateBackup} className="w-full"><Upload className="w-4 h-4" /> {t('settings.create_backup')}</Button>
                </div>
                <p className="text-[10px] opacity-50">{t('settings.backup_hint')}</p>
                <div className="border rounded-lg max-h-48 overflow-y-auto bg-black/5">
                    {isLoadingBackups ? (
                        <div className="p-4 text-center opacity-50 text-xs"><RefreshCw className="w-4 h-4 animate-spin inline mr-2" />{t('common.loading')}</div>
                    ) : backups.length === 0 ? (
                        <div className="p-4 text-center opacity-50 text-xs">{t('settings.no_backups')}</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {backups.map((b, i) => (
                                <div key={i} className="p-3 flex items-center justify-between text-xs">
                                    <div>
                                        <div className="font-bold">{new Date(b.date).toLocaleString()}</div>
                                        <div className="opacity-50">{b.name} ({(b.size/1024).toFixed(1)} KB)</div>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => onRestoreBackup(b.name)} themeClasses={themeClasses}><History className="w-3 h-3" /> {t('settings.restore')}</Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <hr className="border-white/10" />
            <div className="space-y-4">
                <Button variant="danger" themeClasses={themeClasses} onClick={onDeleteSampleData} className="w-full justify-start"><Trash2 className="w-4 h-4" /> {t('settings.delete_sample_data')}</Button>
                <p className="text-[10px] opacity-50 mt-1">{t('settings.delete_sample_hint')}</p>
                <Button variant="danger" themeClasses={themeClasses} onClick={onResetDiary} className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"><AlertTriangle className="w-4 h-4" /> {t('settings.reset_diary')}</Button>
                <p className="text-[10px] opacity-50 mt-1 text-red-400">{t('settings.reset_hint')}</p>
            </div>
        </div>
    );
};

export default SettingsDataTab;
