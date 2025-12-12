
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Save, Star, Navigation, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import { SavedLocation } from '../../types';

interface LocationPickerModalProps {
    onClose: () => void;
    onSelect: (lat: number, lon: number, displayName: string) => void;
    onSaveLocation: (location: SavedLocation) => void;
    onDeleteLocation?: (id: string) => void;
    savedLocations: SavedLocation[];
    themeClasses: any;
    t: (key: string) => string;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ 
    onClose, onSelect, onSaveLocation, onDeleteLocation, savedLocations, themeClasses, t 
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const isMountedRef = useRef(true);

    const [currentPos, setCurrentPos] = useState<{lat: number, lon: number} | null>(null);
    const [address, setAddress] = useState<string>("");
    const [locationName, setLocationName] = useState<string>("");
    const [isLocating, setIsLocating] = useState(true);
    
    const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Track mount status to prevent async state updates on unmounted component
    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        
        // @ts-ignore
        if (typeof L === 'undefined') return;

        // Cleanup function to strictly destroy map instance
        const cleanupMap = () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.off();
                // Ensure marker is removed first
                if (markerRef.current) {
                    try { markerRef.current.remove(); } catch(e) {}
                    markerRef.current = null;
                }
                try {
                    mapInstanceRef.current.remove();
                } catch (e) {
                    console.warn("Leaflet map removal error (likely DOM detached)", e);
                }
                mapInstanceRef.current = null;
            }
        };

        // Ensure clean state before mounting
        cleanupMap();

        try {
            // @ts-ignore
            const map = L.map(mapContainerRef.current).setView([47.4979, 19.0402], 6);
            mapInstanceRef.current = map;
            
            // @ts-ignore
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
               attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                handleMapClick(lat, lng);
            });

            // Fix map size on modal render
            setTimeout(() => {
                if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
            }, 200);

            // Get User Location
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (!mapInstanceRef.current) return;
                    const { latitude, longitude } = pos.coords;
                    updateMapVisuals(latitude, longitude, true);
                    if (isMountedRef.current) setIsLocating(false);
                },
                () => {
                    if (isMountedRef.current) setIsLocating(false);
                }
            );
        } catch (e) {
            console.error("Map init error", e);
        }

        return cleanupMap;
    }, []);

    // Separated logic to handle the async address fetch vs sync map update
    const handleMapClick = (lat: number, lon: number) => {
        updateMapVisuals(lat, lon, false);
    };

    const updateMapVisuals = (lat: number, lon: number, centerMap: boolean) => {
        if (!mapInstanceRef.current) return;

        if (isMountedRef.current) setCurrentPos({ lat, lon });

        try {
            // @ts-ignore
            if (!markerRef.current) {
                // @ts-ignore
                markerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current);
            } else {
                markerRef.current.setLatLng([lat, lon]);
            }

            if (centerMap) {
                mapInstanceRef.current.setView([lat, lon], 15);
            }
        } catch (e) {
            console.warn("Leaflet marker update failed", e);
        }

        fetchAddress(lat, lon);
    };

    const fetchAddress = async (lat: number, lon: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
            if (!isMountedRef.current) return; 
            
            if (res.ok) {
                const data = await res.json();
                const addr = data.address;
                const parts = [];
                if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
                if (addr.road) parts.push(addr.road);
                if (addr.house_number) parts.push(addr.house_number);
                setAddress(parts.join(', ') || data.display_name.split(',')[0]);
            }
        } catch (e) {
            console.error("Reverse geocode failed", e);
            if (isMountedRef.current) setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
    };

    const handleSaveFavorite = () => {
        if (!currentPos || !locationName.trim()) return;
        const newLoc: SavedLocation = {
            id: crypto.randomUUID(),
            name: locationName.trim(),
            lat: currentPos.lat,
            lon: currentPos.lon,
            timestamp: Date.now()
        };
        onSaveLocation(newLoc);
        setLocationName("");
    };

    const handleSelect = () => {
        if (currentPos) {
            const nameToUse = locationName.trim() || address;
            onSelect(currentPos.lat, currentPos.lon, nameToUse);
            onClose();
        }
    };

    const selectSavedLocation = (loc: SavedLocation) => {
        setLocationName(loc.name);
        updateMapVisuals(loc.lat, loc.lon, true);
    };

    const sortedLocations = [...savedLocations].sort((a, b) => {
        if (sortBy === 'name') {
            return sortDir === 'asc' 
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else {
            const ta = a.timestamp || 0;
            const tb = b.timestamp || 0;
            return sortDir === 'asc' ? ta - tb : tb - ta;
        }
    });

    // Use Portal to escape stacking contexts of parent animations
    // We render the Portal into document.body to ensure it sits on top of everything
    return createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in pointer-events-none text-base">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
            <Card themeClasses={themeClasses} className="w-full max-w-6xl p-0 shadow-2xl relative flex flex-col h-[90vh] border-2 pointer-events-auto">
                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                    <h3 className="text-lg font-bold flex items-center gap-2"><MapPin className="w-5 h-5" /> {t('editor.location_picker')}</h3>
                    <button onClick={onClose}><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                </div>

                <div className="flex flex-1 min-h-0 flex-col md:flex-row">
                    {/* Map Area */}
                    <div className="flex-1 relative z-0 h-1/2 md:h-auto border-b md:border-b-0 md:border-r border-white/10 order-2 md:order-1">
                        <div ref={mapContainerRef} className="w-full h-full z-0" />
                        {isLocating && (
                            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs z-[400]">
                                {t('common.loading')}
                            </div>
                        )}
                        <button 
                            className="absolute bottom-4 right-4 z-[400] bg-white text-black p-2 rounded-full shadow-lg hover:bg-gray-100"
                            onClick={() => {
                                setIsLocating(true);
                                navigator.geolocation.getCurrentPosition((pos) => {
                                    updateMapVisuals(pos.coords.latitude, pos.coords.longitude, true);
                                    setIsLocating(false);
                                });
                            }}
                            title="Jelenlegi pozíció"
                        >
                            <Navigation className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Sidebar / Bottom Panel */}
                    <div className="w-full md:w-80 bg-black/5 flex flex-col p-4 gap-4 overflow-y-auto order-1 md:order-2 border-b md:border-b-0 border-white/10">
                        <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                            <div className="flex items-center justify-between">
                                <h4 className={`text-xs font-bold uppercase ${themeClasses.subtext}`}>{t('editor.saved_locations')}</h4>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => { setSortBy('name'); setSortDir(d => d==='asc'?'desc':'asc'); }} 
                                        className={`p-1 rounded hover:bg-white/10 ${sortBy==='name' ? 'text-emerald-500' : 'opacity-50'}`}
                                        title={t('editor.sort_name')}
                                    >
                                        {sortBy==='name' && sortDir==='desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                                    </button>
                                    <button 
                                        onClick={() => { setSortBy('date'); setSortDir(d => d==='asc'?'desc':'asc'); }} 
                                        className={`p-1 rounded hover:bg-white/10 ${sortBy==='date' ? 'text-emerald-500' : 'opacity-50'}`}
                                        title={t('editor.sort_date')}
                                    >
                                        {sortBy==='date' && sortDir==='desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[150px] md:max-h-none">
                                {sortedLocations.length === 0 ? (
                                    <span className="text-xs opacity-50 italic block text-center py-2">-</span>
                                ) : (
                                    sortedLocations.map(loc => (
                                        <div key={loc.id} className="flex gap-1 group">
                                            <button 
                                                onClick={() => selectSavedLocation(loc)}
                                                className={`flex-1 p-2 rounded border text-xs font-bold text-left flex items-center gap-2 hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-500 transition-colors ${themeClasses.card}`}
                                            >
                                                <Star className="w-3 h-3 fill-current opacity-50" /> {loc.name}
                                            </button>
                                            {onDeleteLocation && (
                                                <button 
                                                    onClick={() => onDeleteLocation(loc.id)}
                                                    className="p-2 rounded border border-transparent hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 opacity-50 hover:opacity-100 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-current opacity-10 my-2 shrink-0"></div>

                        {currentPos && (
                            <div className="space-y-4 shrink-0">
                                <div>
                                    <h4 className={`text-xs font-bold uppercase mb-1 ${themeClasses.subtext}`}>Kiválasztva:</h4>
                                    <div className="font-mono text-sm mb-1">{currentPos.lat.toFixed(5)}, {currentPos.lon.toFixed(5)}</div>
                                    <div className="text-sm font-medium opacity-80 break-words line-clamp-2" title={address}>{address}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input 
                                            themeClasses={themeClasses} 
                                            value={locationName} 
                                            onChange={(e: any) => setLocationName(e.target.value)} 
                                            placeholder={t('editor.save_location')}
                                            className="text-sm"
                                        />
                                        <Button size="sm" onClick={handleSaveFavorite} themeClasses={themeClasses} disabled={!locationName.trim()}>
                                            <Save className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Button className="w-full" onClick={handleSelect} themeClasses={themeClasses}>
                                        {t('editor.use_location')}
                                    </Button>
                                </div>
                            </div>
                        )}
                        {!currentPos && (
                            <div className="text-center opacity-50 text-sm mt-4 shrink-0">
                                {t('nav.map')}...
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>,
        document.body
    );
};

export default LocationPickerModal;
