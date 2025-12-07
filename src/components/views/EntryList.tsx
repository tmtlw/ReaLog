import React from 'react';
import { Book, Layout, List, Calendar, Map as MapIcon, Images } from 'lucide-react';
import { Entry, Category } from '../../types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../constants';
import { Card } from '../ui';

interface EntryListProps {
    viewMode: 'grid' | 'timeline' | 'calendar' | 'atlas' | 'gallery';
    entries: Entry[];
    onSelectEntry: (e: Entry) => void;
    renderActionButtons: (e: Entry) => React.ReactNode;
    themeClasses: any;
    isAdmin: boolean;
}

const EntryList: React.FC<EntryListProps> = ({
    viewMode, entries, onSelectEntry, renderActionButtons, themeClasses, isAdmin
}) => {

    if (entries.length === 0 && viewMode !== 'calendar') {
        return (
            <div className="text-center py-20 opacity-40">
                <Book className="w-12 h-12 mx-auto mb-4" />
                <p>Nincs megjeleníthető bejegyzés.</p>
                {isAdmin && <p className="text-sm mt-2">Kattints a + gombra új bejegyzéshez.</p>}
            </div>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {entries.map(e => (
                    <Card key={e.id} themeClasses={themeClasses} className="group hover:border-emerald-500/50 transition-colors flex flex-col relative">
                            {e.photo && (
                                <div className="h-32 overflow-hidden relative cursor-pointer" onClick={() => onSelectEntry(e)}>
                                    <img src={e.photo} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                            )}
                            <div className="p-5 flex-1 flex flex-col" onClick={() => onSelectEntry(e)}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${CATEGORY_COLORS[e.category]} text-white`}>{CATEGORY_LABELS[e.category]}</span>
                                    {e.mood && <span className="text-lg">{e.mood}</span>}
                                </div>
                                <h3 className="font-bold text-lg mb-2 leading-tight group-hover:text-emerald-500 transition-colors cursor-pointer">{e.title || e.dateLabel}</h3>
                                <div className="text-sm opacity-60 mb-4 line-clamp-3 flex-1">
                                    {e.entryMode === 'free' ? e.freeTextContent : (Object.values(e.responses || {}) as string[]).filter(Boolean).join(' • ')}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-current border-opacity-10 mt-auto">
                                    <div className="text-xs opacity-50 flex flex-col">
                                        <span>{new Date(e.timestamp).toLocaleDateString()}</span>
                                        {(e.location && (!e.isLocationPrivate || isAdmin)) && <span>{e.location}</span>}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {renderActionButtons(e)}
                                    </div>
                                </div>
                            </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (viewMode === 'timeline') {
        return (
            <div className="relative border-l-2 border-emerald-500/20 ml-3 space-y-8 py-2">
                {entries.map(e => (
                    <div key={e.id} className="relative pl-8 group">
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-zinc-900 ${CATEGORY_COLORS[e.category]}`}></div>
                        <div className={`p-4 rounded-lg border transition-all ${themeClasses.card} hover:border-emerald-500/50 cursor-pointer`} onClick={() => onSelectEntry(e)}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-mono opacity-50 mb-1 block">{new Date(e.timestamp).toLocaleString()}</span>
                                        <h3 className="font-bold text-lg">{e.title || e.dateLabel}</h3>
                                    </div>
                                    {e.mood && <div className="text-2xl">{e.mood}</div>}
                                </div>
                                <div className="mt-2 text-sm opacity-80 line-clamp-2">
                                    {e.entryMode === 'free' ? e.freeTextContent : (Object.values(e.responses || {}) as string[]).filter(Boolean).join(' • ')}
                                </div>
                                <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                    {renderActionButtons(e)}
                                </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

export default EntryList;