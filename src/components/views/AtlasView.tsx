import React, { useRef, useEffect } from 'react';
import { Entry, Category } from '../../types';
import { CATEGORY_COLORS } from '../../constants';

const AtlasView: React.FC<{
  entries: Entry[];
  activeCategory: Category;
  onSelectEntry: (e: Entry) => void;
  themeClasses: any;
  showAll?: boolean;
  isAdmin?: boolean;
  t?: (key: string) => string;
}> = ({ entries, activeCategory, onSelectEntry, themeClasses, showAll, isAdmin }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) {
             mapInstanceRef.current.remove();
             mapInstanceRef.current = null;
        }

        // @ts-ignore
        if (typeof L === 'undefined') return;

        // @ts-ignore
        const map = L.map(mapContainerRef.current).setView([47.1625, 19.5033], 7);
        
        // @ts-ignore
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
           attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Filter out entries with private location unless admin
        const entriesWithGps = (showAll 
            ? entries.filter(e => e.gps)
            : entries).filter(e => !e.isLocationPrivate || isAdmin); 
        
        if (entriesWithGps.length > 0) {
           const bounds: any[] = [];
           for (const e of entriesWithGps) {
               if (e.gps) {
                   const colorClass = CATEGORY_COLORS[e.category];
                   // @ts-ignore
                   const customIcon = L.divIcon({
                       className: 'custom-map-marker', 
                       html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${colorClass}" style="transform: translate(-25%, -25%);"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>`,
                       iconSize: [24, 24],
                       iconAnchor: [12, 12]
                   });

                   // @ts-ignore
                   const marker = L.marker([e.gps.lat, e.gps.lon], { icon: customIcon }).addTo(map);
                   marker.bindPopup(`<b>${e.title || e.dateLabel}</b><br>${e.location || ''}<br>${e.mood || ''}`);
                   marker.on('click', () => onSelectEntry(e));
                   bounds.push([e.gps.lat, e.gps.lon]);
               }
           }
           if (bounds.length > 0) {
               // @ts-ignore
               map.fitBounds(bounds, { padding: [50, 50] });
           }
        }

        mapInstanceRef.current = map;
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        }
    }, [activeCategory, entries, showAll, isAdmin]); 

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden border relative z-0 animate-fade-in" ref={mapContainerRef}></div>
    );
};

export default AtlasView;