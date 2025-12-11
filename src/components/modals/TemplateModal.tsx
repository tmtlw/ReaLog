
import React, { useState } from 'react';
import { X, Save, FileText, Trash2, CheckCircle2, Star } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { Template, Category, Question } from '../../types';

interface TemplateModalProps {
    onClose: () => void;
    onApply: (questions: string[]) => void;
    onSaveNew: (name: string, isDefault: boolean) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
    templates: Template[];
    currentQuestions: string[]; // List of texts
    themeClasses: any;
    t: (key: string) => string;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ 
    onClose, onApply, onSaveNew, onDelete, onSetDefault, templates, currentQuestions, themeClasses, t 
}) => {
    const [newTemplateName, setNewTemplateName] = useState("");
    const [isDefaultNew, setIsDefaultNew] = useState(false);
    const [view, setView] = useState<'list' | 'save'>('list');

    const handleSave = () => {
        if (!newTemplateName.trim()) return;
        onSaveNew(newTemplateName, isDefaultNew);
        setNewTemplateName("");
        setIsDefaultNew(false);
        setView('list');
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
            <Card themeClasses={themeClasses} className="w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 opacity-50 hover:opacity-100"><X className="w-5 h-5" /></button>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" /> {t('templates.title')}
                </h3>

                {view === 'list' ? (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
                            {templates.length === 0 ? (
                                <p className="text-center opacity-50 italic py-4">{t('templates.empty')}</p>
                            ) : (
                                templates.map(temp => (
                                    <div key={temp.id} className={`p-3 rounded-lg border flex items-center justify-between group ${themeClasses.card}`}>
                                        <div className="flex-1 cursor-pointer" onClick={() => { 
                                            if(confirm(t('templates.confirm_load'))) {
                                                onApply(temp.questions);
                                                onClose();
                                            }
                                        }}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{temp.name}</span>
                                                {temp.isDefault && <Star className="w-3 h-3 text-orange-400 fill-orange-400" />}
                                            </div>
                                            <span className={`text-xs opacity-60`}>{temp.questions.length} kérdés</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {!temp.isDefault && (
                                                <button 
                                                    onClick={() => onSetDefault(temp.id)} 
                                                    className="p-2 opacity-30 group-hover:opacity-100 hover:text-orange-400 transition-all"
                                                    title={t('templates.set_default')}
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => onDelete(temp.id)} 
                                                className="p-2 opacity-30 group-hover:opacity-100 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="pt-4 border-t border-current border-opacity-10">
                            <Button className="w-full" onClick={() => setView('save')} themeClasses={themeClasses} disabled={currentQuestions.length === 0}>
                                <Save className="w-4 h-4" /> {t('templates.save_current')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Input 
                            themeClasses={themeClasses}
                            value={newTemplateName}
                            onChange={(e: any) => setNewTemplateName(e.target.value)}
                            placeholder={t('templates.name_placeholder')}
                            autoFocus
                        />
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="isDef" 
                                checked={isDefaultNew} 
                                onChange={(e) => setIsDefaultNew(e.target.checked)} 
                                className="accent-orange-500 w-4 h-4"
                            />
                            <label htmlFor="isDef" className="text-sm cursor-pointer select-none">{t('templates.set_default')}</label>
                        </div>
                        <div className="bg-black/5 p-3 rounded-lg text-xs opacity-70 border border-current border-opacity-10 max-h-32 overflow-y-auto">
                            <strong>Tartalom:</strong>
                            <ul className="list-disc pl-4 mt-1">
                                {currentQuestions.map((q, i) => (
                                    <li key={i}>{q}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="ghost" onClick={() => setView('list')} className="flex-1">{t('common.cancel')}</Button>
                            <Button onClick={handleSave} themeClasses={themeClasses} className="flex-1" disabled={!newTemplateName.trim()}>
                                {t('common.save')}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TemplateModal;
