
import React, { useState } from 'react';
import { User } from '../../types';
import { Button, Input } from '../ui';
import { User as UserIcon, Plus, Trash2, Check, Shield } from 'lucide-react';

interface Props {
    users: User[];
    setUsers: (users: User[]) => void;
    currentUser: User | null;
    setCurrentUser: (u: User) => void;
    themeClasses: any;
    t: (key: string) => string;
}

const SettingsUsersTab: React.FC<Props> = ({ users, setUsers, currentUser, setCurrentUser, themeClasses, t }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#10b981");

    const handleAddUser = () => {
        if (!newName.trim()) return;
        const newUser: User = {
            id: crypto.randomUUID(),
            name: newName,
            color: newColor,
            isAdmin: false
        };
        setUsers([...users, newUser]);
        setNewName("");
        setIsAdding(false);
    };

    const handleDeleteUser = (id: string) => {
        if (confirm("Biztosan törlöd? A bejegyzései megmaradnak, de árva bejegyzések lesznek.")) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Felhasználók kezelése</h3>
                <Button size="sm" onClick={() => setIsAdding(true)} themeClasses={themeClasses}><Plus className="w-4 h-4" /> Új felhasználó</Button>
            </div>

            {isAdding && (
                <div className="p-4 rounded-lg bg-black/5 border border-black/5 animate-fade-in space-y-3">
                    <h4 className="font-bold text-sm">Új felhasználó</h4>
                    <Input
                        value={newName}
                        onChange={(e: any) => setNewName(e.target.value)}
                        placeholder="Név"
                        themeClasses={themeClasses}
                    />
                    <div className="flex items-center gap-2">
                        <label className="text-sm">Szín:</label>
                        <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0" />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Mégse</Button>
                        <Button size="sm" onClick={handleAddUser} themeClasses={themeClasses}>Hozzáadás</Button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {users.map(u => (
                    <div key={u.id} className={`p-3 rounded-lg border flex items-center justify-between ${currentUser?.id === u.id ? themeClasses.accent + ' border-current' : 'border-white/10 hover:bg-white/5'}`}>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm text-white"
                                style={{ backgroundColor: u.color || '#ccc' }}
                            >
                                {u.avatar || u.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold flex items-center gap-2">
                                    {u.name}
                                    {u.isAdmin && <Shield className="w-3 h-3 text-yellow-500 fill-current" />}
                                </div>
                                {currentUser?.id === u.id && <span className="text-[10px] opacity-80 uppercase tracking-wider">Jelenlegi</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {currentUser?.id !== u.id && (
                                <Button size="sm" variant="secondary" onClick={() => setCurrentUser(u)} themeClasses={themeClasses}>Váltás</Button>
                            )}
                            {users.length > 1 && (
                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 opacity-50 hover:text-red-500 hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SettingsUsersTab;
