<?php
// views/dashboard.php
$entries = load_data(ENTRIES_FILE);
$settings = load_data(SETTINGS_FILE);

// Szűrés (pl. nem kuka)
$active_entries = array_filter($entries, function($e) {
    return !($e['isTrashed'] ?? false);
});

// Rendezés dátum szerint csökkenő
usort($active_entries, function($a, $b) {
    return ($b['timestamp'] ?? 0) - ($a['timestamp'] ?? 0);
});

// Legutóbbi 10
$recent_entries = array_slice($active_entries, 0, 10);
?>

<div class="max-w-6xl mx-auto w-full p-4">
    <!-- Header -->
    <header class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">
            <?php echo get_greeting(); ?>, <?php echo htmlspecialchars($settings['userName'] ?? 'Admin'); ?>!
        </h1>
        <p class="text-zinc-400">Itt van a legutóbbi tevékenységed.</p>
    </header>

    <!-- Widgets / Stats Placeholder -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <div class="flex items-center gap-3 mb-2 text-emerald-500">
                <i data-lucide="book" class="w-5 h-5"></i>
                <h3 class="font-bold">Összes bejegyzés</h3>
            </div>
            <p class="text-3xl font-bold text-white"><?php echo count($active_entries); ?></p>
        </div>
        <!-- Többi widget helye -->
    </div>

    <!-- Recent Entries -->
    <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <i data-lucide="clock" class="w-5 h-5 text-zinc-400"></i> Legutóbbiak
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <?php foreach ($recent_entries as $entry): ?>
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/50 transition-colors cursor-pointer group">
                <div class="flex justify-between items-start mb-3">
                    <span class="bg-zinc-800 text-zinc-300 text-[10px] uppercase font-bold px-2 py-1 rounded">
                        <?php echo htmlspecialchars($entry['category'] ?? 'DAILY'); ?>
                    </span>
                    <span class="text-zinc-500 text-xs">
                        <?php echo date('Y.m.d', ($entry['timestamp'] ?? time()) / 1000); ?>
                    </span>
                </div>

                <h3 class="font-bold text-lg text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    <?php echo htmlspecialchars($entry['title'] ?? $entry['dateLabel']); ?>
                </h3>

                <?php if (!empty($entry['mood'])): ?>
                    <div class="text-2xl mb-3"><?php echo $entry['mood']; ?></div>
                <?php endif; ?>

                <div class="text-sm text-zinc-400 line-clamp-3">
                    <?php
                        if (($entry['entryMode'] ?? '') === 'free') {
                            echo strip_tags($entry['freeTextContent'] ?? '');
                        } else {
                            // Struktúrált válaszok
                            $responses = $entry['responses'] ?? [];
                            foreach ($responses as $r) {
                                if (!empty($r)) {
                                    echo strip_tags($r) . ' ';
                                }
                            }
                        }
                    ?>
                </div>

                <?php if (!empty($entry['tags'])): ?>
                    <div class="mt-4 flex flex-wrap gap-1">
                        <?php foreach ($entry['tags'] as $tag): ?>
                            <span class="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">#<?php echo htmlspecialchars($tag); ?></span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    </div>
</div>
