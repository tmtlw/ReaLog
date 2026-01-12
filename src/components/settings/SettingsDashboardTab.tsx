
import React, { useEffect, useState } from 'react';
import { WidgetConfig } from '../../types';
import { DEFAULT_WIDGETS } from '../../constants';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
    widgets: WidgetConfig[];
    onUpdateWidgets: (w: WidgetConfig[]) => void;
    themeClasses: any;
    t: (key: string) => string;
}

const SettingsDashboardTab: React.FC<Props> = ({ widgets, onUpdateWidgets, themeClasses, t }) => {
    const [localList, setLocalList] = useState<WidgetConfig[]>(() => {
        if (!widgets || widgets.length === 0) return DEFAULT_WIDGETS;
        // Ensure sorting by order
        return [...widgets].sort((a,b) => a.order - b.order);
    });

    // Update parent when local changes
    useEffect(() => {
        onUpdateWidgets(localList);
    }, [localList, onUpdateWidgets]);

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newList = [...localList];
        const temp = newList[index];
        newList[index] = newList[index-1];
        newList[index-1] = temp;
        // Update order property
        newList.forEach((w, i) => w.order = i);
        setLocalList(newList);
    };

    const moveDown = (index: number) => {
        if (index === localList.length - 1) return;
        const newList = [...localList];
        const temp = newList[index];
        newList[index] = newList[index+1];
        newList[index+1] = temp;
        newList.forEach((w, i) => w.order = i);
        setLocalList(newList);
    };

    const toggle = (id: string) => {
        setLocalList(prev => prev.map(w => w.id === id ? { ...w, isEnabled: !w.isEnabled } : w));
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold mb-4">Widgetek kezelése</h3>
            <p className="text-sm opacity-60 mb-4">Kapcsold be vagy rendezd át a vezérlőpult elemeit.</p>

            <div className="space-y-2">
                {localList.map((widget, index) => (
                    <div key={widget.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/5">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1 opacity-50">
                                <button onClick={() => moveUp(index)} disabled={index === 0} className="hover:text-emerald-500 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                                <button onClick={() => moveDown(index)} disabled={index === localList.length - 1} className="hover:text-emerald-500 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                            </div>
                            <span className="font-medium">{widget.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] opacity-50 uppercase tracking-wider">{widget.isEnabled ? 'Aktív' : 'Inaktív'}</span>
                            <div
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${widget.isEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
                                onClick={() => toggle(widget.id)}
                            >
                                <div className={`absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all ${widget.isEnabled ? 'left-6' : 'left-1'}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SettingsDashboardTab;
