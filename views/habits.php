<?php
// views/habits.php
$habits = load_data(HABITS_FILE);
?>

<div class="max-w-4xl mx-auto w-full p-4 pb-24">
    <div class="flex items-center gap-4 mb-6">
        <a href="index.php?page=entries" class="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <i data-lucide="arrow-left" class="w-5 h-5 text-zinc-400"></i>
        </a>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <i data-lucide="activity" class="w-6 h-6"></i> Szokások Kezelése
        </h1>
    </div>

    <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6 text-sm text-blue-300 flex items-start gap-3">
        <i data-lucide="info" class="w-5 h-5 shrink-0 mt-0.5"></i>
        <p>A szokások minden naplótípusnál (Napi, Heti, Havi) megjelennek. Itt adhatsz hozzá új követnivalókat.</p>
    </div>

    <!-- Új szokás hozzáadása -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h3 class="font-bold text-white mb-3 text-sm uppercase flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-500"></i> Új Szokás
        </h3>
        <form action="index.php" method="POST" class="flex flex-col md:flex-row gap-2">
            <input type="hidden" name="action" value="save_habit">
            <input type="hidden" name="isActive" value="on">

            <div class="flex-1">
                <input
                    type="text"
                    name="title"
                    required
                    placeholder="Szokás neve (pl. Vízivás)"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
            </div>

            <div class="w-full md:w-32">
                <select name="type" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                    <option value="boolean">Pipálós</option>
                    <option value="value">Értékes</option>
                </select>
            </div>

            <div class="w-full md:w-24">
                 <input
                    type="text"
                    name="unit"
                    placeholder="Egység"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
            </div>

            <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span class="md:hidden">Hozzáadás</span>
            </button>
        </form>
    </div>

    <!-- Szokások listája -->
    <div class="space-y-3">
        <?php if (empty($habits)): ?>
            <div class="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                <i data-lucide="activity" class="w-12 h-12 mx-auto mb-3 opacity-30"></i>
                <p>Nincsenek rögzített szokások.</p>
            </div>
        <?php else: ?>
            <?php foreach ($habits as $h): ?>
                <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                    <div class="flex items-center gap-4 flex-1">
                        <form action="index.php" method="POST" class="shrink-0">
                            <input type="hidden" name="action" value="toggle_habit">
                            <input type="hidden" name="id" value="<?php echo $h['id']; ?>">
                            <button type="submit" class="w-10 h-10 flex items-center justify-center rounded-xl transition-all <?php echo ($h['isActive'] ?? true) ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'; ?>">
                                <i data-lucide="<?php echo ($h['type'] === 'value') ? 'hash' : 'check'; ?>" class="w-5 h-5"></i>
                            </button>
                        </form>
                        <div class="flex flex-col">
                            <span class="font-bold text-sm <?php echo ($h['isActive'] ?? true) ? 'text-zinc-200' : 'text-zinc-600 line-through'; ?>">
                                <?php echo htmlspecialchars($h['title']); ?>
                            </span>
                            <?php if (($h['type'] === 'value') && !empty($h['unit'])): ?>
                                <span class="text-xs text-zinc-500"><?php echo htmlspecialchars($h['unit']); ?></span>
                            <?php endif; ?>
                        </div>
                    </div>

                    <form action="index.php" method="POST" onsubmit="return confirm('Biztosan törlöd ezt a szokást?');" class="shrink-0">
                        <input type="hidden" name="action" value="delete_habit">
                        <input type="hidden" name="id" value="<?php echo $h['id']; ?>">
                        <button type="submit" class="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </form>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
