
import React, { useState } from 'react';
import { User } from '../../types';
import { Button, Input } from '../ui';
import { User as UserIcon, Plus, Trash2, Shield, Lock, Edit2 } from 'lucide-react';

interface Props {
    users: User[];
    onUpdateUsers: (users: User[]) => void;
    themeClasses: any;
    t: (key: string) => string;
}

const SettingsUsersTab: React.FC<Props> = ({ users, onUpdateUsers, themeClasses, t }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newColor, setNewColor] = useState("#10b981");
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editPassword, setEditPassword] = useState("");

    const handleAddUser = () => {
        if (!newName.trim()) return;
        const newUser: User = {
            id: crypto.randomUUID(),
            name: newName,
            color: newColor,
            password: newPassword || undefined, // Optional if empty, but recommended
            isAdmin: false
        };
        onUpdateUsers([...users, newUser]);
        setNewName("");
        setNewPassword("");
        setIsAdding(false);
    };

    const handleDeleteUser = (id: string) => {
        if (confirm("Biztosan törlöd? A bejegyzései megmaradnak, de árva bejegyzések lesznek.")) {
            onUpdateUsers(users.filter(u => u.id !== id));
        }
    };

    const handleUpdatePassword = (id: string) => {
        if (!editPassword.trim()) {
            alert("A jelszó nem lehet üres!");
            return;
        }
        const updatedUsers = users.map(u =>
            u.id === id ? { ...u, password: editPassword } : u
        );
        onUpdateUsers(updatedUsers);
        setEditingUserId(null);
        setEditPassword("");
        alert("Jelszó frissítve!");
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
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e: any) => setNewPassword(e.target.value)}
                        placeholder="Jelszó"
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
                    <div key={u.id} className={`p-3 rounded-lg border flex flex-col gap-2 border-white/10 hover:bg-white/5`}>
                        <div className="flex items-center justify-between">
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
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={() => setEditingUserId(editingUserId === u.id ? null : u.id)} themeClasses={themeClasses}>
                                    <Lock className="w-3 h-3" /> Jelszó
                                </Button>
                                {users.length > 1 && (
                                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 opacity-50 hover:text-red-500 hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                )}
                            </div>
                        </div>

                        {editingUserId === u.id && (
                            <div className="mt-2 flex gap-2 animate-fade-in p-2 bg-black/20 rounded">
                                <Input
                                    type="password"
                                    value={editPassword}
                                    onChange={(e: any) => setEditPassword(e.target.value)}
                                    placeholder="Új jelszó"
                                    themeClasses={themeClasses}
                                    className="flex-1 text-sm"
                                />
                                <Button size="sm" onClick={() => handleUpdatePassword(u.id)} themeClasses={themeClasses}>Mentés</Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SettingsUsersTab;
