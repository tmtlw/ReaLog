<?php
// views/questions.php
$questions = load_data(QUESTIONS_FILE);
$active_category = $_GET['category'] ?? 'DAILY';

// Csak az adott kategóriához tartozó kérdések
$filtered_questions = array_filter($questions, function($q) use ($active_category) {
    return ($q['category'] ?? 'DAILY') === $active_category;
});
?>

<div class="max-w-4xl mx-auto w-full p-4 pb-24">
    <div class="flex items-center gap-4 mb-6">
        <a href="index.php?page=entries" class="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <i data-lucide="arrow-left" class="w-5 h-5 text-zinc-400"></i>
        </a>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <i data-lucide="help-circle" class="w-6 h-6"></i> Kérdések Kezelése
        </h1>
    </div>

    <!-- Kategória választó -->
    <div class="flex border-b border-zinc-800 mb-6 bg-zinc-900/50 rounded-t-xl overflow-hidden">
        <a href="?page=questions&category=DAILY" class="flex-1 px-4 py-3 text-sm font-bold text-center border-b-2 transition-colors <?php echo $active_category === 'DAILY' ? 'border-emerald-500 text-white bg-zinc-800' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'; ?>">
            Napi Napló
        </a>
        <a href="?page=questions&category=WEEKLY" class="flex-1 px-4 py-3 text-sm font-bold text-center border-b-2 transition-colors <?php echo $active_category === 'WEEKLY' ? 'border-emerald-500 text-white bg-zinc-800' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'; ?>">
            Heti Összegző
        </a>
        <a href="?page=questions&category=MONTHLY" class="flex-1 px-4 py-3 text-sm font-bold text-center border-b-2 transition-colors <?php echo $active_category === 'MONTHLY' ? 'border-emerald-500 text-white bg-zinc-800' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'; ?>">
            Havi Tervező
        </a>
    </div>

    <!-- Új kérdés hozzáadása -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h3 class="font-bold text-white mb-3 text-sm uppercase flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-500"></i> Új Kérdés ehhez: <?php echo $active_category; ?>
        </h3>
        <form action="index.php" method="POST" class="flex gap-2">
            <input type="hidden" name="action" value="save_question">
            <input type="hidden" name="category" value="<?php echo htmlspecialchars($active_category); ?>">
            <input type="hidden" name="isActive" value="on">

            <input
                type="text"
                name="text"
                required
                placeholder="Írd ide a kérdést..."
                class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
            <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span class="hidden md:inline">Hozzáadás</span>
            </button>
        </form>
    </div>

    <!-- Kérdések listája -->
    <div class="space-y-3">
        <?php if (empty($filtered_questions)): ?>
            <div class="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 opacity-30"></i>
                <p>Nincsenek kérdések ebben a kategóriában.</p>
            </div>
        <?php else: ?>
            <?php foreach ($filtered_questions as $q): ?>
                <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                    <div class="flex items-center gap-4 flex-1">
                        <form action="index.php" method="POST" class="shrink-0">
                            <input type="hidden" name="action" value="toggle_question">
                            <input type="hidden" name="id" value="<?php echo $q['id']; ?>">
                            <button type="submit" class="w-10 h-10 flex items-center justify-center rounded-xl transition-all <?php echo ($q['isActive'] ?? true) ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'; ?>" title="<?php echo ($q['isActive'] ?? true) ? 'Kikapcsolás' : 'Bekapcsolás'; ?>">
                                <i data-lucide="<?php echo ($q['isActive'] ?? true) ? 'check' : 'x'; ?>" class="w-5 h-5"></i>
                            </button>
                        </form>
                        <span class="text-sm font-medium <?php echo ($q['isActive'] ?? true) ? 'text-zinc-200' : 'text-zinc-600 line-through'; ?>">
                            <?php echo htmlspecialchars($q['text']); ?>
                        </span>
                    </div>

                    <form action="index.php" method="POST" onsubmit="return confirm('Biztosan törlöd ezt a kérdést?');" class="shrink-0 ml-2">
                        <input type="hidden" name="action" value="delete_question">
                        <input type="hidden" name="id" value="<?php echo $q['id']; ?>">
                        <button type="submit" class="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </form>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
