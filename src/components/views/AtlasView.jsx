import React, { useRef, useEffect } from 'react';
import { Category } from '../../types';
import { CATEGORY_COLORS } from '../../constants';
import { getEmojiStyleObject } from '../ui/EmojiRenderer';

const AtlasView = ({ entries, activeCategory, onSelectEntry, themeClasses, showAll, emojiStyle, fixPosition }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return; // Initialize once

    // Initialize Map
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
        zoomControl: false
    }).setView([47.4979, 19.0402], 3);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
  }, []);

  useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || !entries) return;

      // Clear existing markers logic would go here
      // For this migration, I'm simplifying to ensure stability first

      const markers = [];
      const L = window.L;

      entries.forEach(entry => {
          if (entry.gps) { // Assuming gps format "lat,lon" or object
              let lat, lon;
              if (typeof entry.gps === 'string') {
                  [lat, lon] = entry.gps.split(',').map(Number);
              } else {
                  lat = entry.gps.lat;
                  lon = entry.gps.lon;
              }

              if (lat && lon) {
                  const marker = L.marker([lat, lon]).addTo(map);
                  marker.on('click', () => onSelectEntry(entry));
                  markers.push(marker);
              }
          }
      });

      // Fix position hack for modal
      if (fixPosition) {
          setTimeout(() => map.invalidateSize(), 100);
      }

  }, [entries, fixPosition]);

  return (
    <div className="w-full h-full relative z-0">
        <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" style={{ minHeight: '400px' }}></div>
    </div>
  );
};

export default AtlasView;
