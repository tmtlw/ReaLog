<?php
// views/entry_list.php
$entries = load_data(ENTRIES_FILE);

// Szűrés
$category_filter = $_GET['category'] ?? 'all';
$search_query = $_GET['q'] ?? '';

$filtered_entries = array_filter($entries, function($e) use ($category_filter, $search_query) {
    // Kuka
    if (($e['isTrashed'] ?? false)) return false;

    // Kategória
    if ($category_filter !== 'all' && ($e['category'] ?? '') !== $category_filter) {
        return false;
    }

    // Keresés
    if (!empty($search_query)) {
        $q = mb_strtolower($search_query);
        $title = mb_strtolower($e['title'] ?? '');
        $text = mb_strtolower($e['freeTextContent'] ?? '');
        if (strpos($title, $q) === false && strpos($text, $q) === false) {
            return false;
        }
    }

    return true;
});

// Rendezés
usort($filtered_entries, function($a, $b) {
    return ($b['timestamp'] ?? 0) - ($a['timestamp'] ?? 0);
});
?>

<div class="max-w-6xl mx-auto w-full p-4">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <i data-lucide="list" class="w-6 h-6"></i> Bejegyzések
        </h1>

        <div class="flex gap-2 w-full md:w-auto">
            <a href="index.php?page=editor" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                <i data-lucide="plus" class="w-4 h-4"></i> Új Bejegyzés
            </a>
        </div>
    </div>

    <!-- Szűrők -->
    <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4">
        <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <a href="?page=entries&category=all" class="px-3 py-1 rounded-lg text-sm font-bold <?php echo $category_filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'; ?>">Összes</a>
            <a href="?page=entries&category=DAILY" class="px-3 py-1 rounded-lg text-sm font-bold <?php echo $category_filter === 'DAILY' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'; ?>">Napi</a>
            <a href="?page=entries&category=WEEKLY" class="px-3 py-1 rounded-lg text-sm font-bold <?php echo $category_filter === 'WEEKLY' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'; ?>">Heti</a>
        </div>

        <form class="flex-1 flex gap-2" method="GET" action="index.php">
            <input type="hidden" name="page" value="entries">
            <input type="hidden" name="category" value="<?php echo htmlspecialchars($category_filter); ?>">
            <div class="relative flex-1">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"></i>
                <input
                    type="text"
                    name="q"
                    value="<?php echo htmlspecialchars($search_query); ?>"
                    placeholder="Keresés..."
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
            </div>
        </form>
    </div>

    <!-- Lista -->
    <div class="space-y-4">
        <?php if (empty($filtered_entries)): ?>
            <div class="text-center py-12 text-zinc-500">
                <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                <p>Nincs találat.</p>
            </div>
        <?php else: ?>
            <?php foreach ($filtered_entries as $entry): ?>
                <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors flex flex-col md:flex-row gap-4">
                    <!-- Bal oldal: Dátum és Hangulat -->
                    <div class="flex md:flex-col items-center md:items-start gap-3 md:w-32 shrink-0 text-zinc-400">
                        <div class="text-center md:text-left">
                            <div class="font-bold text-white"><?php echo date('Y.m.d', ($entry['timestamp'] ?? time()) / 1000); ?></div>
                            <div class="text-xs"><?php echo date('H:i', ($entry['timestamp'] ?? time()) / 1000); ?></div>
                        </div>
                        <?php if (!empty($entry['mood'])): ?>
                            <div class="text-2xl ml-auto md:ml-0"><?php echo $entry['mood']; ?></div>
                        <?php endif; ?>
                    </div>

                    <!-- Közép: Tartalom -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-zinc-800 text-zinc-300 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                <?php echo htmlspecialchars($entry['category'] ?? 'DAILY'); ?>
                            </span>
                            <h3 class="font-bold text-lg text-white truncate">
                                <?php echo htmlspecialchars($entry['title'] ?? $entry['dateLabel']); ?>
                            </h3>
                            <?php if ($entry['isFavorite'] ?? false): ?>
                                <i data-lucide="star" class="w-4 h-4 text-yellow-500 fill-current"></i>
                            <?php endif; ?>
                        </div>

                        <div class="text-zinc-400 text-sm line-clamp-2 mb-2">
                             <?php
                                if (($entry['entryMode'] ?? '') === 'free') {
                                    echo strip_tags($entry['freeTextContent'] ?? '');
                                } else {
                                    $responses = $entry['responses'] ?? [];
                                    echo implode(' ', array_map('strip_tags', array_filter($responses)));
                                }
                            ?>
                        </div>

                        <?php if (!empty($entry['tags'])): ?>
                            <div class="flex flex-wrap gap-1">
                                <?php foreach ($entry['tags'] as $tag): ?>
                                    <span class="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">#<?php echo htmlspecialchars($tag); ?></span>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <!-- Jobb: Műveletek -->
                    <div class="flex items-center md:flex-col gap-2 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-4 mt-3 md:mt-0">
                        <a href="index.php?page=editor&id=<?php echo $entry['id']; ?>" class="p-2 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-lg transition-colors" title="Szerkesztés">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </a>
                        <!-- Törlés Form -->
                        <form action="index.php" method="POST" onsubmit="return confirm('Biztosan törlöd?');">
                            <input type="hidden" name="action" value="delete_entry">
                            <input type="hidden" name="id" value="<?php echo $entry['id']; ?>">
                            <button type="submit" class="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors" title="Törlés">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
