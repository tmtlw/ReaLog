import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Category } from '../../types';
import { Button, Input } from '../ui';

const QuestionManager: React.FC<{
    questions: any[];
    activeCategory: Category;
    onAdd: (text: string) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    themeClasses: any;
}> = ({ questions, activeCategory, onAdd, onToggle, onDelete, themeClasses }) => {
    const [newQText, setNewQText] = useState("");

    const handleAdd = () => {
        if (!newQText.trim()) return;
        onAdd(newQText);
        setNewQText("");
    };

    const filteredQuestions = questions.filter(q => q.category === activeCategory);

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Kérdések kezelése</h3>
            </div>
            
            <div className={`flex gap-2 p-4 rounded-lg border mb-6 ${themeClasses.card}`}>
                <Input 
                    themeClasses={themeClasses} 
                    value={newQText} 
                    onChange={(e: any) => setNewQText(e.target.value)} 
                    placeholder="Írj be egy új kérdést..."
                    onKeyDown={(e: any) => e.key === 'Enter' && handleAdd()}
                />
                <Button onClick={handleAdd} themeClasses={themeClasses} disabled={!newQText.trim()}>
                    <Plus className="w-4 h-4" /> Hozzáadás
                </Button>
            </div>

            <div className="space-y-3">
                {filteredQuestions.map((q: any) => (
                    <div key={q.id} className={`flex items-center justify-between p-4 rounded-lg border ${themeClasses.card}`}>
                        <span className={`text-sm flex-1 mr-4 ${q.isActive ? '' : 'line-through opacity-50'}`}>{q.text}</span>
                        <div className="flex gap-2">
                            <button onClick={() => onToggle(q.id)} className={`text-xs px-3 py-1 rounded font-medium ${q.isActive ? themeClasses.accent + ' bg-black/5' : 'opacity-50 border'}`}>
                                {q.isActive ? 'Aktív' : 'Inaktív'}
                            </button>
                            <button onClick={() => onDelete(q.id)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionManager;