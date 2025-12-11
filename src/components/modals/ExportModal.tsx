import React, { useState } from 'react';
import { X, Download, Upload, Book, Printer } from 'lucide-react';
import { AppData, ThemeOption } from '../../types';
import { Button, Card, Input } from '../ui';
import * as StorageService from '../../services/storage';

const ExportModal: React.FC<{ 
    onClose: () => void, 
    data: AppData, 
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    themeClasses: any, 
    currentTheme: ThemeOption,
    t: (key: string) => string
}> = ({ onClose, data, onImport, themeClasses, currentTheme, t }) => {
    const [range, setRange] = useState<'all'|'custom'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [includePrivate, setIncludePrivate] = useState(false);

    const handleExport = (format: 'json' | 'txt' | 'html' | 'wxr' | 'pdf' | 'epub') => {
        const filter = range === 'custom' ? {
              start: startDate ? new Date(startDate).getTime() : undefined,
              end: endDate ? new Date(endDate).getTime() + 86400000 : undefined 
        } : {};
        
        StorageService.exportData(data, format, filter, includePrivate);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
            <Card themeClasses={themeClasses} className="w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Download className="w-5 h-5" /> {t('export.title')}</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className={`block text-xs font-bold uppercase mb-2 ${themeClasses.subtext}`}>{t('export.period')}</label>
                        <div className="flex gap-2 mb-3">
                             <Button type="button" variant={range === 'all' ? 'primary' : 'secondary'} themeClasses={themeClasses} onClick={() => setRange('all')} className="flex-1">{t('export.all')}</Button>
                             <Button type="button" variant={range === 'custom' ? 'primary' : 'secondary'} themeClasses={themeClasses} onClick={() => setRange('custom')} className="flex-1">{t('export.custom')}</Button>
                        </div>
                        {range === 'custom' && (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div>
                                    <span className={`text-xs block mb-1 ${themeClasses.subtext}`}>{t('export.start')}</span>
                                    <Input themeClasses={themeClasses} type="date" value={startDate} onChange={(e:any) => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <span className={`text-xs block mb-1 ${themeClasses.subtext}`}>{t('export.end')}</span>
                                    <Input themeClasses={themeClasses} type="date" value={endDate} onChange={(e:any) => setEndDate(e.target.value)} />
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 p-2 bg-black/5 rounded">
                            <input 
                                type="checkbox" 
                                id="incPrivate" 
                                checked={includePrivate} 
                                onChange={(e) => setIncludePrivate(e.target.checked)}
                                className="accent-emerald-500 w-4 h-4"
                            />
                            <label htmlFor="incPrivate" className="text-sm font-medium opacity-80 cursor-pointer select-none">
                                {t('export.include_private')}
                            </label>
                        </div>
                    </div>
                    
                    {/* Book Export */}
                    <div>
                        <label className={`block text-xs font-bold uppercase mb-2 ${themeClasses.subtext}`}>Könyv Generálás</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('epub')}>
                                <Book className="w-4 h-4" /> E-könyv (EPUB)
                            </Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('pdf')}>
                                <Printer className="w-4 h-4" /> Nyomtatás (PDF)
                            </Button>
                        </div>
                    </div>

                    {/* Standard Export */}
                    <div>
                        <label className={`block text-xs font-bold uppercase mb-2 ${themeClasses.subtext}`}>{t('export.format')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('json')}>JSON (Backup)</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('wxr')}>WordPress (WXR)</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('html')}>HTML</Button>
                            <Button variant="secondary" themeClasses={themeClasses} onClick={() => handleExport('txt')}>TXT</Button>
                        </div>
                    </div>

                    <div className={`border-t pt-6 ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-200'}`}>
                        <label className={`block text-xs font-bold uppercase mb-2 ${themeClasses.subtext}`}>{t('export.import')}</label>
                        <div className="relative group">
                            <input type="file" onChange={onImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".json,.xml,.wxr" />
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors group-hover:bg-black/5 ${currentTheme === 'dark' ? 'border-zinc-800' : 'border-slate-300'}`}>
                                <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                <span className="text-sm font-medium">{t('export.import_placeholder')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ExportModal;