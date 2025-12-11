
import React, { useState } from 'react';
import { Plus, Trash2, FolderOpen, User } from 'lucide-react';
import { Category, Question } from '../../types';
import { Button, Input } from '../ui';
import { SUB_CATEGORIES } from '../../constants';

const QuestionManager: React.FC<{
    questions: Question[];
    activeCategory: Category;
    onAdd: (text: string, subCategory: string) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    themeClasses: any;
    t: (key: string, params?: any) => string;
}> = ({ questions, activeCategory, onAdd, onToggle, onDelete, themeClasses, t }) => {
    const [newQText, setNewQText] = useState("");
    const [selectedSubCat, setSelectedSubCat] = useState("general");

    const handleAdd = () => {
        if (!newQText.trim()) return;
        onAdd(newQText, selectedSubCat);
        setNewQText("");
    };

    // Group questions by subCategory
    const groupedQuestions: Record<string, Question[]> = {};
    SUB_CATEGORIES.forEach(sc => groupedQuestions[sc] = []);
    
    questions.filter(q => q.category === activeCategory).forEach(q => {
        const key = q.subCategory || 'general';
        if (!groupedQuestions[key]) groupedQuestions[key] = [];
        groupedQuestions[key].push(q);
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{t('questions.title')}</h3>
            </div>
            
            {/* Add New Question Section */}
            <div className={`flex flex-col md:flex-row gap-2 p-4 rounded-lg border mb-6 ${themeClasses.card}`}>
                <div className="flex-1 flex gap-2">
                    <select
                        value={selectedSubCat}
                        onChange={(e) => setSelectedSubCat(e.target.value)}
                        className={`rounded-lg px-3 py-2 border text-sm focus:outline-none focus:ring-2 ${themeClasses.input} ${themeClasses.bg} max-w-[150px]`}
                    >
                        {SUB_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{t(`subcats.${cat}`)}</option>
                        ))}
                    </select>
                    <Input 
                        themeClasses={themeClasses} 
                        value={newQText} 
                        onChange={(e: any) => setNewQText(e.target.value)} 
                        placeholder={t('questions.add_placeholder')}
                        onKeyDown={(e: any) => e.key === 'Enter' && handleAdd()}
                        className="flex-1"
                    />
                </div>
                <Button onClick={handleAdd} themeClasses={themeClasses} disabled={!newQText.trim()}>
                    <Plus className="w-4 h-4" /> {t('questions.add_btn')}
                </Button>
            </div>

            {/* Questions List Grouped by SubCategory */}
            <div className="space-y-6">
                {SUB_CATEGORIES.map(subCat => {
                    const groupQuestions = groupedQuestions[subCat];
                    if (groupQuestions.length === 0) return null;

                    return (
                        <div key={subCat} className="space-y-3">
                            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${themeClasses.accent} border-b border-current border-opacity-10 pb-1`}>
                                <FolderOpen className="w-3 h-3" /> {t(`subcats.${subCat}`)} ({groupQuestions.length})
                            </h4>
                            <div className="grid gap-2">
                                {groupQuestions.map((q: any) => (
                                    <div key={q.id} className={`flex items-center justify-between p-3 rounded-lg border ${themeClasses.card} bg-opacity-50`}>
                                        <div className="flex-1 mr-4">
                                            <span className={`text-sm ${q.isActive ? '' : 'line-through opacity-50'}`}>
                                                {/* Check if ID starts with q_ (default) or is UUID (custom) */}
                                                {!q.id.startsWith('q_') && <User className="w-3 h-3 inline mr-1 text-emerald-500" />}
                                                {q.text}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <button onClick={() => onToggle(q.id)} className={`text-[10px] px-2 py-1 rounded font-medium ${q.isActive ? themeClasses.accent + ' bg-black/5' : 'opacity-50 border'}`}>
                                                {q.isActive ? t('questions.active') : t('questions.inactive')}
                                            </button>
                                            <button onClick={() => onDelete(q.id)} className="text-red-400 hover:text-red-500 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionManager;
