<?php
// views/questions.php
$questions = load_data(QUESTIONS_FILE);
$active_category = $_GET['category'] ?? 'DAILY';

// Csak az adott kategóriához tartozó kérdések
$filtered_questions = array_filter($questions, function($q) use ($active_category) {
    return ($q['category'] ?? 'DAILY') === $active_category;
});
?>

<div class="max-w-4xl mx-auto w-full p-4">
    <div class="flex items-center gap-4 mb-6">
        <a href="index.php?page=entries" class="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <i data-lucide="arrow-left" class="w-5 h-5 text-zinc-400"></i>
        </a>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <i data-lucide="help-circle" class="w-6 h-6"></i> Kérdések Kezelése
        </h1>
    </div>

    <!-- Kategória választó -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <a href="?page=questions&category=DAILY" class="px-4 py-2 rounded-lg font-bold text-sm transition-colors <?php echo $active_category === 'DAILY' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'; ?>">
            Napi
        </a>
        <a href="?page=questions&category=WEEKLY" class="px-4 py-2 rounded-lg font-bold text-sm transition-colors <?php echo $active_category === 'WEEKLY' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'; ?>">
            Heti
        </a>
        <a href="?page=questions&category=MONTHLY" class="px-4 py-2 rounded-lg font-bold text-sm transition-colors <?php echo $active_category === 'MONTHLY' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'; ?>">
            Havi
        </a>
    </div>

    <!-- Új kérdés hozzáadása -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h3 class="font-bold text-white mb-3">Új Kérdés</h3>
        <form action="index.php" method="POST" class="flex gap-2">
            <input type="hidden" name="action" value="save_question">
            <input type="hidden" name="category" value="<?php echo htmlspecialchars($active_category); ?>">
            <input type="hidden" name="isActive" value="on"> <!-- Alapból aktív -->

            <input
                type="text"
                name="text"
                required
                placeholder="Írd ide a kérdést..."
                class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
            <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span class="hidden md:inline">Hozzáadás</span>
            </button>
        </form>
    </div>

    <!-- Kérdések listája -->
    <div class="space-y-3">
        <?php if (empty($filtered_questions)): ?>
            <div class="text-center py-8 text-zinc-500">
                <p>Nincsenek kérdések ebben a kategóriában.</p>
            </div>
        <?php else: ?>
            <?php foreach ($filtered_questions as $q): ?>
                <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                    <div class="flex items-center gap-3">
                        <form action="index.php" method="POST" class="inline">
                            <input type="hidden" name="action" value="toggle_question">
                            <input type="hidden" name="id" value="<?php echo $q['id']; ?>">
                            <button type="submit" class="p-2 rounded-full transition-colors <?php echo ($q['isActive'] ?? true) ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'; ?>" title="<?php echo ($q['isActive'] ?? true) ? 'Kikapcsolás' : 'Bekapcsolás'; ?>">
                                <i data-lucide="<?php echo ($q['isActive'] ?? true) ? 'check-circle-2' : 'circle'; ?>" class="w-5 h-5"></i>
                            </button>
                        </form>
                        <span class="<?php echo ($q['isActive'] ?? true) ? 'text-white' : 'text-zinc-500 line-through'; ?>">
                            <?php echo htmlspecialchars($q['text']); ?>
                        </span>
                    </div>

                    <form action="index.php" method="POST" onsubmit="return confirm('Biztosan törlöd ezt a kérdést?');">
                        <input type="hidden" name="action" value="delete_question">
                        <input type="hidden" name="id" value="<?php echo $q['id']; ?>">
                        <button type="submit" class="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </form>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
