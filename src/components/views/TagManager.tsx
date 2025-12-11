import React, { useState } from 'react';
import { Entry } from '../../types';
import { Button, Input } from '../ui';
import { Edit2, Trash2, ArrowLeft, Save, Merge } from 'lucide-react';

interface TagManagerProps {
    entries: Entry[];
    onUpdateEntries: (entries: Entry[]) => void;
    onBack: () => void;
    themeClasses: any;
    t: (key: string) => string;
}

const TagManager: React.FC<TagManagerProps> = ({ entries, onUpdateEntries, onBack, themeClasses, t }) => {
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [newTagName, setNewTagName] = useState("");

    // Calculate Tag Counts
    const tagCounts: Record<string, number> = {};
    entries.forEach(e => {
        e.tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    const handleRename = (oldTag: string) => {
        if (!newTagName.trim() || newTagName.trim() === oldTag) {
            setEditingTag(null);
            return;
        }

        const newTag = newTagName.trim().replace(/^#/, ''); // Remove # if user typed it
        const confirmMsg = tagCounts[newTag] 
            ? `${t('tags.merge_hint')} (#${oldTag} -> #${newTag})` 
            : `${t('tags.rename')} #${oldTag} -> #${newTag}?`;

        if (confirm(confirmMsg)) {
            const updatedEntries = entries.map(e => {
                if (e.tags?.includes(oldTag)) {
                    // Update Tags Array
                    const newTags = e.tags.filter(t => t !== oldTag);
                    if (!newTags.includes(newTag)) newTags.push(newTag);
                    
                    // Regex Replace in Content (Title, FreeText, Responses) to preserve context
                    const regex = new RegExp(`#${oldTag}\\b`, 'g');
                    
                    let newTitle = e.title;
                    if (e.title) newTitle = e.title.replace(regex, `#${newTag}`);
                    
                    let newFreeText = e.freeTextContent;
                    if (e.freeTextContent) newFreeText = e.freeTextContent.replace(regex, `#${newTag}`);
                    
                    const newResponses = { ...e.responses };
                    Object.keys(newResponses).forEach(k => {
                        newResponses[k] = newResponses[k].replace(regex, `#${newTag}`);
                    });

                    return {
                        ...e,
                        tags: newTags,
                        title: newTitle,
                        freeTextContent: newFreeText,
                        responses: newResponses
                    };
                }
                return e;
            });

            onUpdateEntries(updatedEntries);
            alert(t('tags.rename_success'));
            setEditingTag(null);
            setNewTagName("");
        }
    };

    const handleDelete = (tagToDelete: string) => {
        if (confirm(`${t('tags.confirm_delete')} #${tagToDelete}`)) {
            const updatedEntries = entries.map(e => {
                if (e.tags?.includes(tagToDelete)) {
                    // Remove from array
                    const newTags = e.tags.filter(t => t !== tagToDelete);
                    
                    // Remove string from content (optional, but cleaner)
                    const regex = new RegExp(`#${tagToDelete}\\b`, 'g');
                    
                    let newTitle = e.title;
                    if (e.title) newTitle = e.title.replace(regex, '');
                    
                    let newFreeText = e.freeTextContent;
                    if (e.freeTextContent) newFreeText = e.freeTextContent.replace(regex, '');
                    
                    const newResponses = { ...e.responses };
                    Object.keys(newResponses).forEach(k => {
                        newResponses[k] = newResponses[k].replace(regex, '');
                    });

                    return {
                        ...e,
                        tags: newTags,
                        title: newTitle,
                        freeTextContent: newFreeText,
                        responses: newResponses
                    };
                }
                return e;
            });
            
            onUpdateEntries(updatedEntries);
            alert(t('tags.delete_success'));
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-emerald-500" /> {t('tags.manager_title')}
                </h3>
                <Button variant="secondary" size="sm" onClick={onBack} themeClasses={themeClasses}>
                    <ArrowLeft className="w-4 h-4" /> {t('tags.back_btn')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sortedTags.map(([tag, count]) => (
                    <div key={tag} className={`p-3 rounded-lg border flex items-center justify-between group ${themeClasses.card}`}>
                        {editingTag === tag ? (
                            <div className="flex items-center gap-2 flex-1">
                                <Input 
                                    themeClasses={themeClasses} 
                                    value={newTagName} 
                                    onChange={(e: any) => setNewTagName(e.target.value)} 
                                    placeholder={t('tags.new_name_placeholder')}
                                    autoFocus
                                />
                                <button onClick={() => handleRename(tag)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded">
                                    <Save className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingTag(null)} className="p-2 text-red-500 hover:bg-red-500/10 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-sm font-bold bg-emerald-500/10 text-emerald-500`}>#{tag}</span>
                                    <span className="text-xs opacity-50">({count} {t('tags.count')})</span>
                                </div>
                                <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => { setEditingTag(tag); setNewTagName(tag); }} 
                                        className="p-2 hover:bg-black/5 rounded text-blue-400"
                                        title={t('tags.rename')}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(tag)} 
                                        className="p-2 hover:bg-red-500/10 rounded text-red-400"
                                        title={t('tags.delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TagManager;