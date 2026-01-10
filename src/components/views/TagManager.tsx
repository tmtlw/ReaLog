
import React, { useState } from 'react';
import { Entry } from '../../types';
import { Button, Input } from '../ui';
import { Edit2, Trash2, ArrowLeft, Save, Tag, Cloud, List, X } from 'lucide-react';
import { stringToColor, stringToBgColor } from '../../utils/colors';

interface TagManagerProps {
    entries: Entry[];
    onUpdateEntries: (entries: Entry[]) => void;
    onBack: () => void;
    onSelectTag: (tag: string) => void;
    themeClasses: any;
    t: (key: string) => string;
    isAdmin: boolean;
}

const TagManager: React.FC<TagManagerProps> = ({ entries, onUpdateEntries, onBack, onSelectTag, themeClasses, t, isAdmin }) => {
    const [view, setView] = useState<'cloud' | 'manage'>('cloud');
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [newTagName, setNewTagName] = useState("");

    // Calculate Tag Counts
    const tagCounts: Record<string, number> = {};
    let maxCount = 0;
    entries.forEach(e => {
        e.tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            if (tagCounts[tag] > maxCount) maxCount = tagCounts[tag];
        });
    });
    
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    const handleRename = (oldTag: string) => {
        if (!isAdmin) return;
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
        if (!isAdmin) return;
        if (confirm(`${t('tags.confirm_delete')} #${tagToDelete}`)) {
            const updatedEntries = entries.map(e => {
                if (e.tags?.includes(tagToDelete)) {
                    // Remove from array
                    const newTags = e.tags.filter(t => t !== tagToDelete);
                    
                    // Remove string from content
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

    const getFontSize = (count: number) => {
        if (maxCount === 0) return '1rem';
        const minSize = 0.8;
        const maxSize = 2.5;
        const size = minSize + (count / maxCount) * (maxSize - minSize);
        return `${size}rem`;
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Tag className="w-5 h-5 text-emerald-500" /> {t('tags.manager_title')}
                    </h3>
                    
                    <div className="flex bg-black/5 p-1 rounded-lg border border-black/5">
                        <button onClick={() => setView('cloud')} className={`p-1.5 rounded transition-all flex items-center gap-1 text-xs font-bold ${view === 'cloud' ? themeClasses.primaryBtn : 'opacity-60'}`}>
                            <Cloud className="w-3 h-3" /> {t('tags.view_cloud')}
                        </button>
                        {isAdmin && (
                            <button onClick={() => setView('manage')} className={`p-1.5 rounded transition-all flex items-center gap-1 text-xs font-bold ${view === 'manage' ? themeClasses.primaryBtn : 'opacity-60'}`}>
                                <List className="w-3 h-3" /> {t('tags.view_list')}
                            </button>
                        )}
                    </div>
                </div>
                
                <Button variant="secondary" size="sm" onClick={onBack} themeClasses={themeClasses}>
                    <ArrowLeft className="w-4 h-4" /> {t('tags.back_btn')}
                </Button>
            </div>

            {view === 'cloud' ? (
                <div className={`p-8 rounded-xl border flex flex-wrap gap-4 justify-center items-center ${themeClasses.card} min-h-[300px]`}>
                    {sortedTags.length === 0 ? (
                        <p className="opacity-50 italic">{t('app.no_tags')}</p>
                    ) : (
                        sortedTags.map(([tag, count]) => {
                            const isDark = themeClasses.bg.includes('black') || themeClasses.bg.includes('9');
                            return (
                                <button
                                    key={tag}
                                    onClick={() => onSelectTag(tag)}
                                    style={{
                                        fontSize: getFontSize(count),
                                        color: stringToColor(tag, isDark ? 'dark' : 'light')
                                    }}
                                    className={`font-bold transition-all hover:scale-110 opacity-80 hover:opacity-100 px-2 py-1 rounded`}
                                    title={`${count} ${t('tags.count')}`}
                                >
                                    #{tag}
                                </button>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sortedTags.map(([tag, count]) => (
                        <div key={tag} className={`p-3 rounded-lg border flex items-center justify-between group ${themeClasses.card}`}>
                            {editingTag === tag && isAdmin ? (
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
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-1 rounded text-sm font-bold`}
                                            style={{
                                                backgroundColor: stringToBgColor(tag, themeClasses.bg.includes('black') || themeClasses.bg.includes('9') ? 'dark' : 'light'),
                                                color: stringToColor(tag, themeClasses.bg.includes('black') || themeClasses.bg.includes('9') ? 'dark' : 'light')
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                        <span className="text-xs opacity-50">({count} {t('tags.count')})</span>
                                    </div>
                                    {isAdmin && (
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
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagManager;
