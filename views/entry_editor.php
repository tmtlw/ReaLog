<?php
// views/entry_editor.php

$id = $_GET['id'] ?? null;
$entries = load_data(ENTRIES_FILE);
$entry = null;

if ($id) {
    foreach ($entries as $e) {
        if ($e['id'] === $id) {
            $entry = $e;
            break;
        }
    }
}

// Ha nincs entry, de szerkeszteni akarunk, az hiba, vagy új entry
if (!$entry && $id) {
    echo "Hiba: Bejegyzés nem található.";
    exit;
}

// Default értékek új bejegyzéshez
if (!$entry) {
    $entry = [
        'id' => uniqid(),
        'title' => '',
        'category' => 'DAILY',
        'entryMode' => 'free',
        'freeTextContent' => '',
        'mood' => '',
        'tags' => [],
        'timestamp' => time() * 1000,
        'dateLabel' => date('Y-m-d')
    ];
}

$is_editing = (bool)$id;
?>

<div class="max-w-4xl mx-auto w-full p-4">
    <div class="flex items-center gap-4 mb-6">
        <a href="index.php?page=entries" class="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <i data-lucide="arrow-left" class="w-5 h-5 text-zinc-400"></i>
        </a>
        <h1 class="text-2xl font-bold text-white">
            <?php echo $is_editing ? 'Bejegyzés Szerkesztése' : 'Új Bejegyzés'; ?>
        </h1>
    </div>

    <form action="index.php" method="POST" class="space-y-6">
        <input type="hidden" name="action" value="save_entry">
        <input type="hidden" name="id" value="<?php echo htmlspecialchars($entry['id']); ?>">
        <input type="hidden" name="timestamp" value="<?php echo htmlspecialchars($entry['timestamp']); ?>">

        <!-- Fő adatok -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-bold text-zinc-500 uppercase mb-2">Cím</label>
                <input
                    type="text"
                    name="title"
                    value="<?php echo htmlspecialchars($entry['title']); ?>"
                    class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Adj címet a napodnak..."
                >
            </div>
            <div>
                <label class="block text-xs font-bold text-zinc-500 uppercase mb-2">Dátum</label>
                <input
                    type="date"
                    name="dateLabel"
                    value="<?php echo htmlspecialchars($entry['dateLabel']); ?>"
                    class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
            </div>
        </div>

        <!-- Hangulat -->
        <div>
            <label class="block text-xs font-bold text-zinc-500 uppercase mb-2">Hangulat</label>
            <div class="flex gap-2 overflow-x-auto pb-2">
                <?php
                $moods = ['😭','😔','😐','🙂','😁','🤩','😡','😴','🤒'];
                foreach ($moods as $m):
                    $active = ($entry['mood'] ?? '') === $m;
                ?>
                    <label class="cursor-pointer">
                        <input type="radio" name="mood" value="<?php echo $m; ?>" class="peer sr-only" <?php echo $active ? 'checked' : ''; ?>>
                        <div class="text-3xl p-2 rounded-lg border border-transparent hover:bg-zinc-800 peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 grayscale peer-checked:grayscale-0 transition-all opacity-50 peer-checked:opacity-100">
                            <?php echo $m; ?>
                        </div>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Kategória -->
        <div>
            <label class="block text-xs font-bold text-zinc-500 uppercase mb-2">Kategória</label>
            <select name="category" class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white">
                <option value="DAILY" <?php echo ($entry['category'] === 'DAILY') ? 'selected' : ''; ?>>Napi</option>
                <option value="WEEKLY" <?php echo ($entry['category'] === 'WEEKLY') ? 'selected' : ''; ?>>Heti</option>
                <option value="MONTHLY" <?php echo ($entry['category'] === 'MONTHLY') ? 'selected' : ''; ?>>Havi</option>
            </select>
        </div>

        <!-- Tartalom (Free Text) -->
        <div>
            <label class="block text-xs font-bold text-zinc-500 uppercase mb-2">Tartalom</label>
            <textarea
                name="freeTextContent"
                rows="10"
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm leading-relaxed"
                placeholder="Írd le a gondolataidat..."
            ><?php echo htmlspecialchars($entry['freeTextContent']); ?></textarea>
            <p class="text-xs text-zinc-500 mt-1">HTML tagek használhatók (pl. &lt;b&gt;, &lt;i&gt;)</p>
        </div>

        <!-- Tags -->
        <div>
            <label class="block text-xs font-bold text-zinc-500 uppercase mb-2">Címkék (vesszővel elválasztva)</label>
            <input
                type="text"
                name="tags"
                value="<?php echo htmlspecialchars(implode(', ', $entry['tags'] ?? [])); ?>"
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="munka, pihenés, sport"
            >
        </div>

        <!-- Gombok -->
        <div class="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <a href="index.php?page=entries" class="px-6 py-2 rounded-lg font-bold text-zinc-400 hover:text-white transition-colors">Mégse</a>
            <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i> Mentés
            </button>
        </div>
    </form>
</div>
