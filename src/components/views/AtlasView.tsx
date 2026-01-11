
import React, { useRef, useEffect } from 'react';
import { Entry, Category, EmojiStyle } from '../../types';
import { CATEGORY_COLORS } from '../../constants';
import { getEmojiStyleObject } from '../ui/EmojiRenderer';

const AtlasView: React.FC<{
  entries: Entry[];
  activeCategory: Category;
  onSelectEntry: (e: Entry) => void;
  themeClasses: any;
  showAll?: boolean;
  isAdmin?: boolean;
  t?: (key: string) => string;
  emojiStyle?: EmojiStyle;
  fixPosition?: boolean;
}> = ({ entries, activeCategory, onSelectEntry, themeClasses, showAll, isAdmin, emojiStyle = 'native', fixPosition }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;
        
        const cleanup = () => {
            if (mapInstanceRef.current) {
                 mapInstanceRef.current.off();
                 try {
                    mapInstanceRef.current.remove();
                 } catch(e) {
                    // Ignore remove errors
                 }
                 mapInstanceRef.current = null;
            }
        };

        cleanup();

        // @ts-ignore
        if (typeof L === 'undefined') return;

        try {
            // @ts-ignore
            const map = L.map(mapContainerRef.current, {
                zoomAnimation: false,
                fadeAnimation: false,
                markerZoomAnimation: false
            }).setView([47.1625, 19.5033], 7);
            
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
               // Get style object for emoji and convert to string for popup HTML
               const styleObj = getEmojiStyleObject(emojiStyle as EmojiStyle);
               const styleString = Object.entries(styleObj).map(([k, v]) => {
                   // Convert camelCase to kebab-case for inline styles
                   const key = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                   return `${key}:${v}`;
               }).join(';');

               for (const e of entriesWithGps) {
                   if (e.gps) {
                       const colorClass = CATEGORY_COLORS[e.category];
                       // @ts-ignore
                       const customIcon = L.divIcon({
                           className: 'custom-map-marker', 
                           html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${colorClass}" style="${!fixPosition ? 'transform: translate(-25%, -25%);' : ''}"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>`,
                           iconSize: [24, 24],
                           iconAnchor: [12, 12]
                       });

                       // @ts-ignore
                       const marker = L.marker([e.gps.lat, e.gps.lon], { icon: customIcon }).addTo(map);
                       const moodHtml = e.mood ? `<br><span style="font-size:1.2em; ${styleString}">${e.mood}</span>` : '';
                       
                       marker.bindPopup(`<b>${e.title || e.dateLabel}</b><br>${e.location || ''}${moodHtml}`);
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
        } catch(e) {
            console.error("AtlasView map init error", e);
        }

        return cleanup;
    }, [activeCategory, entries, showAll, isAdmin, emojiStyle]); 

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden border relative z-0 animate-fade-in" ref={mapContainerRef}></div>
    );
};

export default AtlasView;
