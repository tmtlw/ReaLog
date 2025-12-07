import React from 'react';
import { Clock } from 'lucide-react';
import { Entry } from '../../types';
import { CATEGORY_BORDER_COLORS } from '../../constants';

const GalleryView: React.FC<{
    entries: Entry[];
    onSelectEntry: (e: Entry) => void;
    themeClasses: any;
    renderActionButtons: (e: Entry) => React.ReactNode;
}> = ({ entries, onSelectEntry, themeClasses, renderActionButtons }) => {
    const entriesWithPhotos = entries.filter(e => e.photo);

    if (entriesWithPhotos.length === 0) return <div className="text-center py-20 opacity-50">Nincsenek feltöltött képek.</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
            {entriesWithPhotos.map(e => (
                <div key={e.id} 
                    className={`aspect-square relative group cursor-pointer overflow-hidden rounded-lg border-2 ${CATEGORY_BORDER_COLORS[e.category]} hover:border-emerald-500 transition-colors`} 
                    onClick={() => onSelectEntry(e)}
                >
                    <img src={e.photo} alt={e.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                         <div className="flex justify-between items-end">
                            <div className="overflow-hidden">
                                <span className="text-white text-xs font-bold truncate block">{e.title || e.dateLabel}</span>
                                <span className="text-white/70 text-[10px] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <div className="flex gap-1" onClick={ev => ev.stopPropagation()}>
                                {renderActionButtons(e)}
                            </div>
                         </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GalleryView;