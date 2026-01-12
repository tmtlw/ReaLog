
import React, { useState } from 'react';
import { User, AppData, ThemeOption } from '../../types';
import { Button, Card, Input } from '../ui';
import { Lock, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';
import { DEMO_PASSWORD } from '../../constants';

interface LoginScreenProps {
    users: User[];
    onLogin: (user: User) => void;
    themeClasses: any;
    t: (key: string) => string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, themeClasses, t }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>(users.length > 0 ? users[0].id : '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const user = users.find(u => u.id === selectedUserId);
        if (!user) {
            setError(t('app.user_not_found'));
            return;
        }

        // Check password
        // If user has no password set (migration), allow empty or any password?
        // Better: require default password "admin" or match DEMO_PASSWORD if user is admin
        // For now, simple strict check if password field exists.

        const expected = user.password;

        // If legacy user without password, maybe use a default or allow access
        if (!expected) {
             // For legacy migration: if no password set, we might allow it or require setting one.
             // Let's assume for now we auto-migrate or use a default.
             if (password === DEMO_PASSWORD || password === 'admin') {
                 onLogin(user);
                 return;
             } else {
                 setError('Helytelen jelszó (Alapértelmezett: admin)');
                 return;
             }
        }

        if (password === expected) {
            onLogin(user);
        } else {
            setError(t('app.wrong_password'));
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${themeClasses.bg} ${themeClasses.text}`}>
            <Card themeClasses={themeClasses} className="w-full max-w-md p-8 shadow-2xl animate-fade-in border border-white/10">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 rotate-3">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">ReaLog</h1>
                    <p className="opacity-60">{t('app.login_subtitle') || 'Jelentkezz be a folytatáshoz'}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Felhasználó</label>
                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {users.map(u => (
                                <div
                                    key={u.id}
                                    onClick={() => { setSelectedUserId(u.id); setError(''); }}
                                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${
                                        selectedUserId === u.id
                                        ? `${themeClasses.primaryBtn} border-transparent shadow-md transform scale-[1.02]`
                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                    }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm bg-black/20"
                                        style={{ backgroundColor: u.color }}
                                    >
                                        {u.avatar || u.name.charAt(0)}
                                    </div>
                                    <span className="font-medium">{u.name}</span>
                                    {selectedUserId === u.id && <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">{t('app.password')}</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e: any) => setPassword(e.target.value)}
                            placeholder="Jelszó"
                            themeClasses={themeClasses}
                            className="w-full"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm flex items-center gap-2 border border-red-500/20">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button type="submit" themeClasses={themeClasses} className="w-full py-3 text-lg shadow-lg shadow-emerald-500/10">
                        {t('app.login_btn')} <LogIn className="w-5 h-5 ml-2" />
                    </Button>
                </form>

                <div className="mt-6 text-center text-xs opacity-40">
                    &copy; 2026 ReaLog Project
                </div>
            </Card>
        </div>
    );
};
