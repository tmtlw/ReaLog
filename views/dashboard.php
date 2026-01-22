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

// Statisztikák (Widgetekhez)
$total_count = count($active_entries);
$streak = 0; // TODO: Streak számítás
$on_this_day_count = 0;
$today_md = date('m-d');
foreach ($active_entries as $e) {
    $ts = $e['timestamp'] / 1000;
    if (date('m-d', $ts) === $today_md && date('Y', $ts) !== date('Y')) {
        $on_this_day_count++;
    }
}
?>

<div class="max-w-6xl mx-auto w-full p-4 pb-24">
    <!-- Header -->
    <header class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 class="text-3xl font-bold text-white mb-2">
                <?php echo get_greeting(); ?>, <?php echo htmlspecialchars($settings['userName'] ?? 'Admin'); ?>!
            </h1>
            <p class="text-zinc-400">Jó látni téged. Íme a mai áttekintésed.</p>
        </div>
        <a href="index.php?page=editor" class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-transform active:scale-95 flex items-center gap-2">
            <i data-lucide="plus" class="w-5 h-5"></i> Új Bejegyzés
        </a>
    </header>

    <!-- Widgets Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <!-- Total Entries Widget -->
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i data-lucide="book" class="w-24 h-24 text-emerald-500"></i>
            </div>
            <div class="flex items-center gap-3 mb-2 text-emerald-500">
                <i data-lucide="book" class="w-5 h-5"></i>
                <h3 class="font-bold text-sm uppercase tracking-wider">Összesen</h3>
            </div>
            <p class="text-4xl font-bold text-white"><?php echo $total_count; ?></p>
            <p class="text-xs text-zinc-500 mt-2">bejegyzés a naplódban</p>
        </div>

        <!-- Streak Widget (Placeholder) -->
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i data-lucide="flame" class="w-24 h-24 text-orange-500"></i>
            </div>
            <div class="flex items-center gap-3 mb-2 text-orange-500">
                <i data-lucide="flame" class="w-5 h-5"></i>
                <h3 class="font-bold text-sm uppercase tracking-wider">Széria</h3>
            </div>
            <p class="text-4xl font-bold text-white"><?php echo $streak; ?></p>
            <p class="text-xs text-zinc-500 mt-2">nap egymás után</p>
        </div>

        <!-- On This Day Widget -->
        <?php if ($on_this_day_count > 0): ?>
        <div class="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden group col-span-1 md:col-span-2">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i data-lucide="calendar-clock" class="w-24 h-24 text-indigo-400"></i>
            </div>
            <div class="flex items-center gap-3 mb-2 text-indigo-400">
                <i data-lucide="calendar-clock" class="w-5 h-5"></i>
                <h3 class="font-bold text-sm uppercase tracking-wider">Ezen a napon</h3>
            </div>
            <div class="flex items-end gap-2">
                <p class="text-4xl font-bold text-white"><?php echo $on_this_day_count; ?></p>
                <p class="text-sm text-indigo-200 mb-1.5">korábbi emlék</p>
            </div>
            <a href="index.php?page=entries&filter=onthisday" class="inline-block mt-4 text-xs font-bold text-white bg-indigo-500/20 hover:bg-indigo-500/40 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/30">
                Megtekintés
            </a>
        </div>
        <?php else: ?>
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group flex flex-col justify-center items-center text-center">
            <i data-lucide="coffee" class="w-8 h-8 text-zinc-600 mb-2"></i>
            <p class="text-zinc-500 text-sm">Nincs korábbi emlék a mai napon.</p>
        </div>
        <?php endif; ?>

    </div>

    <!-- Recent Entries Feed -->
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i data-lucide="clock" class="w-5 h-5 text-zinc-400"></i> Legutóbbiak
        </h2>
        <a href="index.php?page=entries" class="text-sm font-bold text-emerald-500 hover:text-emerald-400">Összes megtekintése</a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <?php foreach ($recent_entries as $entry): ?>
            <a href="index.php?page=editor&id=<?php echo $entry['id']; ?>" class="block group">
                <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer h-full flex flex-col">
                    <div class="flex justify-between items-start mb-3">
                        <span class="bg-zinc-950 text-zinc-400 border border-zinc-800 text-[10px] uppercase font-bold px-2 py-1 rounded group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition-colors">
                            <?php echo htmlspecialchars($entry['category'] ?? 'DAILY'); ?>
                        </span>
                        <span class="text-zinc-500 text-xs font-mono">
                            <?php echo date('Y.m.d', ($entry['timestamp'] ?? time()) / 1000); ?>
                        </span>
                    </div>

                    <div class="flex items-start justify-between gap-2 mb-2">
                        <h3 class="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                            <?php echo htmlspecialchars($entry['title'] ?: $entry['dateLabel']); ?>
                        </h3>
                         <?php if (!empty($entry['mood'])): ?>
                            <div class="text-2xl shrink-0 group-hover:scale-110 transition-transform"><?php echo $entry['mood']; ?></div>
                        <?php endif; ?>
                    </div>

                    <div class="text-sm text-zinc-400 line-clamp-3 mb-4 flex-1">
                        <?php
                            if (($entry['entryMode'] ?? '') === 'free') {
                                echo strip_tags($entry['freeTextContent'] ?? '');
                            } else {
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
                        <div class="flex flex-wrap gap-1 mt-auto">
                            <?php foreach (array_slice($entry['tags'], 0, 3) as $tag): ?>
                                <span class="text-[10px] bg-zinc-950 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">#<?php echo htmlspecialchars($tag); ?></span>
                            <?php endforeach; ?>
                            <?php if(count($entry['tags']) > 3): ?>
                                <span class="text-[10px] text-zinc-600">+<?php echo count($entry['tags']) - 3; ?></span>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </a>
        <?php endforeach; ?>

        <!-- Add New Card (ha kevés a bejegyzés, jól jöhet) -->
        <a href="index.php?page=editor" class="block group border border-dashed border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:bg-zinc-800/30 transition-all cursor-pointer flex flex-col items-center justify-center text-zinc-600 hover:text-emerald-500 min-h-[200px]">
             <i data-lucide="plus-circle" class="w-12 h-12 mb-2 opacity-50 group-hover:opacity-100 transition-opacity"></i>
             <span class="font-bold">Új Bejegyzés</span>
        </a>
    </div>
</div>
