
import React, { useState } from 'react';
import { 
    Plus, Trash2, CheckCircle2, Hash, Edit2, X, Save, 
    // General
    Activity, Book, Droplets, Moon, Sun, DollarSign, Briefcase, Heart, Brain, Music, PenTool, Code, Leaf, Coffee, Utensils, Zap, Award, Target, Flag, Bike, Dumbbell, Footprints, Bed, ShowerHead, Timer, Watch, Smartphone, Laptop, Gamepad2, ShoppingCart, Home, Car, Plane, Brush, Camera, Headphones, Gift, Star, Smile, Frown, Users, Phone, Mail,
    // Expanded
    Anchor, Archive, ArrowRight, Atom, Baby, Backpack, Banana, Banknote, Bath, Battery, Beer, Bell, Bird, Bitcoin, Bluetooth, Bomb, Bone, Box, Bug, Building, Bus, Cake, Calculator, Calendar, Candy, Carrot, Cast, Cat, Check, ChefHat, Cherry, Cigarette, Circle, Clipboard, Clock, Cloud, CloudRain, Coins, Compass, Cookie, Copy, CreditCard, Crop, Crosshair, Crown, Database, Diamond, Disc, Dog, DoorOpen, Drum, Egg, Eye, Feather, File, Film, Filter, Fingerprint, Fish, Flame, Flashlight, Flower, Folder, Gauge, Ghost, Glasses, Globe, Hammer, Hand, HardDrive, Hash as HashIcon, Heading, History, Hourglass, Image, Infinity, Info, Key, Keyboard, Lamp, Layers, Library, Lightbulb, Link, Lock, Luggage, Map, Medal, Megaphone, Mic, Microscope, Milk, Monitor, Mouse, Move, Navigation, Nut, Package, Palette, Paperclip, PartyPopper, Pause, Pencil, Percent, PersonStanding, Piano, PiggyBank, Pill, Pin, Pizza, Play, Plug, Power, Printer, Puzzle, Radio, Receipt, Repeat, Rocket, Ruler, Save as SaveIcon, Scale, Scissors, ScreenShare, Search, Send, Server, Settings, Share, Shield, Ship, Shirt, Shovel, Signal, Skull, Slack, Slash, Slice, Snowflake, Sofa, Speaker, Sprout, Stamp, StopCircle, Store, Stethoscope, StickyNote, Sword, Syringe, Table, Tablet, Tag, Tent, Terminal, Thermometer, ThumbsUp, Ticket, ToggleLeft, ToggleRight, Tornado, Train, Trash, TreeDeciduous, TreePine, Triangle, Trophy, Truck, Tv, Umbrella, Unlock, Upload, User as UserIcon, Video, Voicemail, Volume2, Wallet, Wand2, Wifi, Wind, Wine, Wrench, XCircle, ZapOff, ZoomIn
} from 'lucide-react';
import { Category, Habit } from '../../types';
import { Button, Input } from '../ui';

// Helper to render icon by name
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    const iconMap: Record<string, any> = {
        Activity, Book, Droplets, Moon, Sun, DollarSign, Briefcase, Heart, Brain, Music, PenTool, Code, Leaf, Coffee, Utensils, Zap, Award, Target, Flag, Bike, Dumbbell, Footprints, Bed, ShowerHead, Timer, Watch, Smartphone, Laptop, Gamepad2, ShoppingCart, Home, Car, Plane, Brush, Camera, Headphones, Gift, Star, Smile, Frown, Users, Phone, Mail,
        Anchor, Archive, ArrowRight, Atom, Baby, Backpack, Banana, Banknote, Bath, Battery, Beer, Bell, Bird, Bitcoin, Bluetooth, Bomb, Bone, Box, Bug, Building, Bus, Cake, Calculator, Calendar, Candy, Carrot, Cast, Cat, Check, ChefHat, Cherry, Cigarette, Circle, Clipboard, Clock, Cloud, CloudRain, Coins, Compass, Cookie, Copy, CreditCard, Crop, Crosshair, Crown, Database, Diamond, Disc, Dog, DoorOpen, Drum, Egg, Eye, Feather, File, Film, Filter, Fingerprint, Fish, Flame, Flashlight, Flower, Folder, Gauge, Ghost, Glasses, Globe, Hammer, Hand, HardDrive, Hash: HashIcon, Heading, History, Hourglass, Image, Infinity, Info, Key, Keyboard, Lamp, Layers, Library, Lightbulb, Link, Lock, Luggage, Map, Medal, Megaphone, Mic, Microscope, Milk, Monitor, Mouse, Move, Navigation, Nut, Package, Palette, Paperclip, PartyPopper, Pause, Pencil, Percent, PersonStanding, Piano, PiggyBank, Pill, Pin, Pizza, Play, Plug, Power, Printer, Puzzle, Radio, Receipt, Repeat, Rocket, Ruler, Save: SaveIcon, Scale, Scissors, ScreenShare, Search, Send, Server, Settings, Share, Shield, Ship, Shirt, Shovel, Signal, Skull, Slack, Slash, Slice, Snowflake, Sofa, Speaker, Sprout, Stamp, StopCircle, Store, Stethoscope, StickyNote, Sword, Syringe, Table, Tablet, Tag, Tent, Terminal, Thermometer, ThumbsUp, Ticket, ToggleLeft, ToggleRight, Tornado, Train, Trash, TreeDeciduous, TreePine, Triangle, Trophy, Truck, Tv, Umbrella, Unlock, Upload, User: UserIcon, Video, Voicemail, Volume2, Wallet, Wand2, Wifi, Wind, Wine, Wrench, XCircle, ZapOff, ZoomIn
    };
    
    const IconComponent = iconMap[name] || Activity;
    return <IconComponent className={className} />;
};

const HABIT_ICONS = Array.from(new Set([
    'Activity', 'Book', 'Droplets', 'Moon', 'Sun', 'DollarSign', 'Briefcase', 'Heart', 'Brain', 'Music', 'PenTool', 'Code', 'Leaf', 'Coffee', 'Utensils', 'Zap', 'Award', 'Target', 'Flag', 'Bike', 'Dumbbell', 'Footprints', 'Bed', 'ShowerHead', 'Timer', 'Watch', 'Smartphone', 'Laptop', 'Gamepad2', 'ShoppingCart', 'Home', 'Car', 'Plane', 'Brush', 'Camera', 'Headphones', 'Gift', 'Star', 'Smile', 'Frown', 'Users', 'Phone', 'Mail',
    'Flame', 'Trophy', 'Medal', 'Crown', 'Rocket', 'Lightbulb', 'Sprout', 'TreeDeciduous', 'TreePine', 'Flower', 'Bird', 'Cat', 'Dog', 'Fish', 'Bug', 'PawPrint',
    'Apple', 'Banana', 'Carrot', 'Cherry', 'Cookie', 'Cake', 'Pizza', 'Beer', 'Wine', 'Milk', 'ChefHat',
    'Banknote', 'Wallet', 'CreditCard', 'PiggyBank', 'Coins', 'Bitcoin', 'Diamond',
    'Bath', 'Sofa', 'Tv', 'Radio', 'Speaker', 'Plug', 'Battery', 'Flashlight', 'Key', 'Lock', 'Unlock',
    'Hammer', 'Wrench', 'Scissors', 'Ruler', 'Pencil', 'Paperclip', 'Folder', 'File', 'Archive', 'Trash',
    'Thermometer', 'Pill', 'Stethoscope', 'Syringe', 'Baby', 'User', 'PersonStanding', 'Hand', 'Eye', 'Fingerprint',
    'Globe', 'Map', 'Navigation', 'Compass', 'Anchor', 'Ship', 'Bus', 'Train', 'Truck', 'TrafficCone',
    'Cloud', 'CloudRain', 'Snowflake', 'Wind', 'Umbrella', 'Tent', 'Mountain',
    'Ghost', 'Skull', 'Bomb', 'Sword', 'Shield', 'Target', 'Crosshair',
    'Search', 'Settings', 'Bell', 'Info', 'Check', 'XCircle', 'Plus', 'Minus', 'Play', 'Pause', 'Repeat', 'Infinity'
]));

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
    const [selectedIcon, setSelectedIcon] = useState<string>("");
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [iconSearch, setIconSearch] = useState("");

    const handleSave = () => {
        if (!title.trim()) return;
        
        const habitData: Habit = {
            id: editingId || crypto.randomUUID(),
            title: title.trim(),
            type,
            category: activeCategory,
            isActive: true, // Default to active on save/update
            target: type === 'value' && target ? parseFloat(target) : undefined,
            unit: type === 'value' ? unit : undefined,
            icon: selectedIcon || undefined
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
        setSelectedIcon("");
        setEditingId(null);
        setShowIconPicker(false);
        setIconSearch("");
    };

    const startEditing = (habit: Habit) => {
        setEditingId(habit.id);
        setTitle(habit.title);
        setType(habit.type);
        setTarget(habit.target ? habit.target.toString() : "");
        setUnit(habit.unit || "");
        setSelectedIcon(habit.icon || "");
        setShowIconPicker(false);
    };

    const filteredHabits = habits.filter(h => h.category === activeCategory);
    const filteredIcons = HABIT_ICONS.filter(i => i.toLowerCase().includes(iconSearch.toLowerCase()));

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
                    <div className="flex gap-2">
                        <Input 
                            themeClasses={themeClasses} 
                            value={title} 
                            onChange={(e: any) => setTitle(e.target.value)} 
                            placeholder={t('habits.name_placeholder')}
                            className="flex-1 font-bold"
                        />
                        <div className="relative">
                            <button 
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className={`h-full aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${selectedIcon ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-transparent border-dashed border-current opacity-70 hover:opacity-100'}`}
                                title={t('habits.select_icon')}
                                style={{ minWidth: '42px' }}
                            >
                                {selectedIcon ? <DynamicIcon name={selectedIcon} className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                            </button>
                            
                            {showIconPicker && (
                                <div className={`absolute top-full right-0 mt-2 p-3 rounded-xl shadow-2xl border w-72 z-50 flex flex-col gap-2 ${themeClasses.card}`} style={{ maxHeight: '300px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Keresés..." 
                                        value={iconSearch}
                                        onChange={(e) => setIconSearch(e.target.value)}
                                        className={`w-full p-2 text-xs rounded border bg-transparent mb-2 ${themeClasses.input}`}
                                        autoFocus
                                    />
                                    <div className="grid grid-cols-6 gap-1 overflow-y-auto no-scrollbar">
                                        <button 
                                            onClick={() => { setSelectedIcon(""); setShowIconPicker(false); }}
                                            className={`p-2 rounded hover:bg-red-500/20 text-red-500 flex items-center justify-center col-span-6 border border-dashed border-red-500/30 mb-1`}
                                        >
                                            <X className="w-4 h-4" /> Nincs ikon
                                        </button>
                                        {filteredIcons.map(icon => (
                                            <button 
                                                key={icon}
                                                onClick={() => { setSelectedIcon(icon); setShowIconPicker(false); }}
                                                className={`p-2 rounded hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors ${selectedIcon === icon ? 'bg-emerald-500 text-white shadow-lg scale-110' : ''}`}
                                                title={icon}
                                            >
                                                <DynamicIcon name={icon} className="w-5 h-5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {showIconPicker && <div className="fixed inset-0 z-40" onClick={() => setShowIconPicker(false)} />}
                        </div>
                    </div>
                    
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
                            <div className={`p-2.5 rounded-xl ${h.type === 'boolean' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {h.icon ? <DynamicIcon name={h.icon} className="w-5 h-5" /> : (h.type === 'boolean' ? <CheckCircle2 className="w-5 h-5" /> : <Hash className="w-5 h-5" />)}
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
