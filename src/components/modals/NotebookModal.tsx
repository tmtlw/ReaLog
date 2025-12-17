
import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Book, Save } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import { Notebook } from '../../types';

interface NotebookModalProps {
    onClose: () => void;
    notebooks: Notebook[];
    onSave: (notebooks: Notebook[]) => void;
    themeClasses: any;
    t: (key: string) => string;
}

const NotebookModal: React.FC<NotebookModalProps> = ({ onClose, notebooks, onSave, themeClasses, t }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");

    const handleAdd = () => {
        if (!name.trim()) return;
        const newNotebook: Notebook = {
            id: crypto.randomUUID(),
            name: name.trim(),
            icon: 'Book'
        };
        onSave([...notebooks, newNotebook]);
        setName("");
    };

    const handleUpdate = () => {
        if (!editingId || !name.trim()) return;
        const updated = notebooks.map(n => n.id === editingId ? { ...n, name: name.trim() } : n);
        onSave(updated);
        setEditingId(null);
        setName("");
    };

    const handleDelete = (id: string) => {
        if (notebooks.length <= 1) {
            alert(t('notebooks.cannot_delete_last'));
            return;
        }
        if (confirm(t('notebooks.confirm_delete'))) {
            onSave(notebooks.filter(n => n.id !== id));
        }
    };

    const startEdit = (n: Notebook) => {
        setEditingId(n.id);
        setName(n.name);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
            <Card themeClasses={themeClasses} className="w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Book className="w-5 h-5" /> {t('notebooks.title')}</h3>
                
                <div className="flex gap-2 mb-6">
                    <Input 
                        themeClasses={themeClasses} 
                        value={name} 
                        onChange={(e: any) => setName(e.target.value)} 
                        placeholder={t('notebooks.placeholder')}
                    />
                    {editingId ? (
                        <Button onClick={handleUpdate} themeClasses={themeClasses} disabled={!name.trim()}>
                            <Save className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleAdd} themeClasses={themeClasses} disabled={!name.trim()}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notebooks.map(nb => (
                        <div key={nb.id} className={`flex items-center justify-between p-3 rounded-lg border ${themeClasses.card} ${editingId === nb.id ? 'border-emerald-500 bg-emerald-500/10' : ''}`}>
                            <div className="flex items-center gap-3">
                                <Book className="w-4 h-4 opacity-70" />
                                <span className="font-bold text-sm">{nb.name}</span>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => startEdit(nb)} className="p-2 hover:bg-black/5 rounded text-blue-400">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                {notebooks.length > 1 && (
                                    <button onClick={() => handleDelete(nb.id)} className="p-2 hover:bg-red-500/10 rounded text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default NotebookModal;
