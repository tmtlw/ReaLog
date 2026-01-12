
import React, { useState } from 'react';
import { User, AppData, ThemeOption } from '../../types';
import { Button, Card, Input } from '../ui';
import { Lock, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';
import { DEMO_PASSWORD } from '../../constants';
import { verifyPassword } from '../../utils/crypto';

interface LoginScreenProps {
    users: User[];
    onLogin: (user: User) => void;
    themeClasses: any;
    t: (key: string) => string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, themeClasses, t }) => {
    // If only one user exists, maybe pre-fill?
    // But strict "type username" requirement suggests we should let them type.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Master Override
        const normalizedUsername = username.trim().toLowerCase();
        if (normalizedUsername === 'admin' && password === 'grind') {
             const existingAdmin = users.find(u => u.name.trim().toLowerCase() === 'admin');
             if (existingAdmin && existingAdmin.password && existingAdmin.password !== 'grind') {
                 // Fall through
             } else {
                 onLogin(existingAdmin || {
                     id: crypto.randomUUID(),
                     name: 'Admin',
                     isAdmin: true,
                     color: '#10b981',
                     password: 'grind',
                     avatar: 'A'
                 });
                 return;
             }
        }

        const user = users.find(u => u.name.trim().toLowerCase() === normalizedUsername);

        if (!user) {
            const available = users.map(u => u.name).join(', ');
            const errorMsg = t('app.user_not_found') || 'Felhasználó nem található';
            setError(available ? `${errorMsg}. (Elérhető: ${available})` : errorMsg);
            return;
        }

        const expected = user.password;

        // Legacy/Default password handling
        if (!expected) {
             if (password === DEMO_PASSWORD || password === 'admin' || password === 'grind') {
                 onLogin(user);
                 return;
             } else {
                 setError('Helytelen jelszó (Alapértelmezett: grind)');
                 return;
             }
        }

        if (password === expected) {
            onLogin(user);
            return;
        }

        const isValid = await verifyPassword(password, expected);
        if (isValid) {
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
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Felhasználónév</label>
                        <Input
                            data-testid="username-input"
                            type="text"
                            value={username}
                            onChange={(e: any) => setUsername(e.target.value)}
                            placeholder="Felhasználónév"
                            themeClasses={themeClasses}
                            className="w-full"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">{t('app.password')}</label>
                        <Input
                            data-testid="password-input"
                            type="password"
                            value={password}
                            onChange={(e: any) => setPassword(e.target.value)}
                            placeholder="Jelszó"
                            themeClasses={themeClasses}
                            className="w-full"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm flex items-center gap-2 border border-red-500/20">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button data-testid="login-button" type="submit" themeClasses={themeClasses} className="w-full py-3 text-lg shadow-lg shadow-emerald-500/10">
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
