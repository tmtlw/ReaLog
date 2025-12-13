
import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Hash, Edit2, X, Save } from 'lucide-react';
import { Category, Habit } from '../../types';
import { Button, Input } from '../ui';

const HabitManager: React.FC<{
    habits: Habit[];
    activeCategory: Category;
    onAdd: (habit: Habit) => void;
    onEdit: (habit: Habit) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    themeClasses: any;
    t: (key: string) => string;
}> = ({ habits, activeCategory, onAdd, onEdit, onToggle, onDelete, themeClasses, t }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [type, setType] = useState<'boolean' | 'value'>('boolean');
    const [target, setTarget] = useState("");
    const [unit, setUnit] = useState("");

    const handleSave = () => {
        if (!title.trim()) return;
        
        const habitData: Habit = {
            id: editingId || crypto.randomUUID(),
            title: title.trim(),
            type,
            category: activeCategory,
            isActive: true, // Default to active on save/update
            target: type === 'value' && target ? parseFloat(target) : undefined,
            unit: type === 'value' ? unit : undefined
        };

        if (editingId) {
            // Find original to preserve isActive state if needed, though we usually want active on edit
            const original = habits.find(h => h.id === editingId);
            if (original) habitData.isActive = original.isActive;
            onEdit(habitData);
            setEditingId(null);
        } else {
            onAdd(habitData);
        }

        resetForm();
    };

    const resetForm = () => {
        setTitle("");
        setTarget("");
        setUnit("");
        setType('boolean');
        setEditingId(null);
    };

    const startEditing = (habit: Habit) => {
        setEditingId(habit.id);
        setTitle(habit.title);
        setType(habit.type);
        setTarget(habit.target ? habit.target.toString() : "");
        setUnit(habit.unit || "");
    };

    const filteredHabits = habits.filter(h => h.category === activeCategory);

    // Common style for inputs to ensure theme persistence
    const inputStyle = `rounded-lg px-3 py-2 border text-sm focus:outline-none focus:ring-2 transition-all ${themeClasses.input}`;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{t('habits.title')}</h3>
            </div>
            
            {/* Add/Edit Form */}
            <div className={`p-4 rounded-lg border mb-6 ${themeClasses.card} ${editingId ? 'ring-2 ring-emerald-500/50' : ''}`}>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold uppercase opacity-70">
                        {editingId ? t('common.edit') : t('habits.add_new')}
                    </h4>
                    {editingId && (
                        <button onClick={resetForm} className="text-xs opacity-50 hover:opacity-100 flex items-center gap-1">
                            <X className="w-3 h-3" /> {t('common.cancel')}
                        </button>
                    )}
                </div>
                <div className="grid gap-3">
                    <Input 
                        themeClasses={themeClasses} 
                        value={title} 
                        onChange={(e: any) => setTitle(e.target.value)} 
                        placeholder={t('habits.name_placeholder')}
                    />
                    
                    <div className="flex gap-2">
                        <select 
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className={`rounded-lg px-3 py-2 border text-sm focus:outline-none focus:ring-2 flex-1 ${themeClasses.input} ${themeClasses.bg}`}
                            style={{ color: 'inherit' }}
                        >
                            <option value="boolean" className={themeClasses.bg} style={{ color: 'inherit' }}>{t('habits.type_boolean')}</option>
                            <option value="value" className={themeClasses.bg} style={{ color: 'inherit' }}>{t('habits.type_value')}</option>
                        </select>
                        
                        {type === 'value' && (
                            <>
                                <Input 
                                    type="number"
                                    themeClasses={themeClasses} 
                                    value={target} 
                                    onChange={(e: any) => setTarget(e.target.value)} 
                                    placeholder={t('habits.goal_placeholder')}
                                    className={`w-24 ${inputStyle}`}
                                />
                                <Input 
                                    themeClasses={themeClasses} 
                                    value={unit} 
                                    onChange={(e: any) => setUnit(e.target.value)} 
                                    placeholder={t('habits.unit_placeholder')}
                                    className={`w-24 ${inputStyle}`}
                                />
                            </>
                        )}
                    </div>

                    <Button onClick={handleSave} themeClasses={themeClasses} disabled={!title.trim()}>
                        {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                        {editingId ? t('common.save') : t('questions.add_btn')}
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredHabits.map((h) => (
                    <div key={h.id} className={`flex items-center justify-between p-4 rounded-lg border transition-opacity ${themeClasses.card} ${editingId === h.id ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-3 flex-1 mr-4">
                            <div className={`p-2 rounded-full ${h.type === 'boolean' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {h.type === 'boolean' ? <CheckCircle2 className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                            </div>
                            <div>
                                <div className={`text-sm font-bold ${h.isActive ? '' : 'line-through opacity-50'}`}>{h.title}</div>
                                {h.type === 'value' && (
                                    <div className="text-[10px] opacity-60">
                                        Cél: {h.target || '-'} {h.unit}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button onClick={() => onToggle(h.id)} className={`text-xs px-3 py-1 rounded font-medium ${h.isActive ? themeClasses.accent + ' bg-black/5' : 'opacity-50 border'}`}>
                                {h.isActive ? t('habits.active') : t('habits.inactive')}
                            </button>
                            <button onClick={() => startEditing(h)} className="text-blue-400 hover:text-blue-500 p-1">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(h.id)} className="text-red-400 hover:text-red-500 p-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HabitManager;
