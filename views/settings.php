<?php
// views/settings.php
$settings = load_data(SETTINGS_FILE);
$active_tab = $_GET['tab'] ?? 'account';
?>

<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
    <div class="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <i data-lucide="settings" class="w-6 h-6"></i> Beállítások
            </h2>
            <a href="index.php?page=dashboard" class="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </a>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-zinc-800 bg-zinc-950/30 overflow-x-auto">
            <a href="?page=settings&tab=account" class="px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap <?php echo $active_tab === 'account' ? 'border-emerald-500 text-white bg-zinc-800/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'; ?>">
                Fiók
            </a>
            <a href="?page=settings&tab=views" class="px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap <?php echo $active_tab === 'views' ? 'border-emerald-500 text-white bg-zinc-800/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'; ?>">
                Nézetek
            </a>
            <a href="?page=settings&tab=data" class="px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap <?php echo $active_tab === 'data' ? 'border-emerald-500 text-white bg-zinc-800/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'; ?>">
                Adatok
            </a>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8">
            <form action="index.php" method="POST" class="space-y-8">
                <input type="hidden" name="action" value="save_settings">

                <?php if ($active_tab === 'account'): ?>
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-lg font-bold text-white mb-4">Felhasználói Fiók</h3>
                            <div class="grid gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-zinc-500 uppercase mb-2">Felhasználónév</label>
                                    <div class="relative">
                                        <i data-lucide="user" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"></i>
                                        <input type="text" name="userName" value="<?php echo htmlspecialchars($settings['userName'] ?? 'Admin'); ?>" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <p class="text-xs text-zinc-500 mt-2">Ez a név jelenik meg az üdvözlő képernyőn.</p>
                                </div>

                                <div>
                                    <label class="block text-xs font-bold text-zinc-500 uppercase mb-2">Admin Jelszó</label>
                                    <div class="relative">
                                        <i data-lucide="lock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"></i>
                                        <input type="password" name="adminPassword" value="<?php echo htmlspecialchars($settings['adminPassword'] ?? 'grind'); ?>" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <p class="text-xs text-yellow-600 mt-2">Figyelem: A jelszó módosítása után újra be kell jelentkezned.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                <?php elseif ($active_tab === 'views'): ?>
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-lg font-bold text-white mb-4">Megjelenítés</h3>
                            <div>
                                <label class="block text-xs font-bold text-zinc-500 uppercase mb-2">Téma</label>
                                <select name="theme" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white">
                                    <option value="dark" selected>Sötét (Dark)</option>
                                    <option value="light" disabled>Világos (Hamarosan)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                <?php elseif ($active_tab === 'data'): ?>
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-lg font-bold text-white mb-4">Adatkezelés</h3>

                            <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between mb-4">
                                <div>
                                    <h4 class="font-bold text-zinc-200">Biztonsági Mentés</h4>
                                    <p class="text-xs text-zinc-500">Mentsd le az összes adatot (JSON) egy fájlba.</p>
                                </div>
                                <button type="button" onclick="alert('Hamarosan...')" class="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
                                    Letöltés
                                </button>
                            </div>

                            <div class="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold text-red-500">Adatok Törlése</h4>
                                    <p class="text-xs text-red-400/70">Minden bejegyzés, kérdés és szokás végleges törlése.</p>
                                </div>
                                <button type="button" onclick="if(confirm('Biztosan törölsz mindent?')) alert('Még nincs implementálva a PHP verzióban biztonsági okokból.');" class="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-bold border border-red-500/20">
                                    Törlés
                                </button>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>

                <?php if ($active_tab !== 'data'): // Adat tabnál nincs form submit a gombok miatt ?>
                    <div class="pt-6 border-t border-zinc-800 flex justify-end">
                        <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all">
                            Beállítások Mentése
                        </button>
                    </div>
                <?php endif; ?>
            </form>
        </div>
    </div>
</div>
