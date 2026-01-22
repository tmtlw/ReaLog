<?php
// views/entry_editor.php

$id = $_GET['id'] ?? null;
$entries = load_data(ENTRIES_FILE);
$questions = load_data(QUESTIONS_FILE);
$habits = load_data(HABITS_FILE);

$entry = null;

if ($id) {
    foreach ($entries as $e) {
        if ($e['id'] === $id) {
            $entry = $e;
            break;
        }
    }
}

if (!$entry && $id) {
    echo "Hiba: Bejegyzés nem található.";
    exit;
}

if (!$entry) {
    // Kategória az URL-ből vagy alapértelmezett
    $default_cat = $_GET['category'] ?? 'DAILY';

    $entry = [
        'id' => uniqid(),
        'title' => '',
        'category' => $default_cat,
        'entryMode' => 'structured', // Alapértelmezett: strukturált
        'freeTextContent' => '',
        'mood' => '',
        'tags' => [],
        'responses' => [],
        'habitValues' => [],
        'timestamp' => time() * 1000,
        'dateLabel' => date('Y-m-d'),
        'location' => '',
        'gps' => '' // lat,lng string
    ];
}

$is_editing = (bool)$id;
$current_category = $entry['category'];

// Aktív kérdések lekérése a kategóriához
$active_questions = array_filter($questions, function($q) use ($current_category) {
    return ($q['isActive'] ?? true) && ($q['category'] === $current_category);
});

// Aktív szokások
$active_habits = array_filter($habits, function($h) {
    return ($h['isActive'] ?? true);
});

// GPS koordináták parsing
$lat = 47.4979; // Default Budapest
$lng = 19.0402;
$has_gps = false;
if (!empty($entry['gps'])) {
    $parts = explode(',', $entry['gps']);
    if (count($parts) === 2) {
        $lat = floatval($parts[0]);
        $lng = floatval($parts[1]);
        $has_gps = true;
    }
}
?>

<div class="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
    <div class="w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden min-h-[80vh]">

        <!-- CLOSE BUTTON (Mobilra is kell, de most a layout a lényeg) -->
        <a href="index.php?page=entries" class="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
        </a>

        <!-- BAL OLDAL: Form (50%) -->
        <div class="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/50">
            <form id="entryForm" action="index.php" method="POST" class="space-y-8">
                <input type="hidden" name="action" value="save_entry">
                <input type="hidden" name="id" value="<?php echo htmlspecialchars($entry['id']); ?>">
                <input type="hidden" name="timestamp" value="<?php echo htmlspecialchars($entry['timestamp']); ?>">
                <input type="hidden" name="gps" id="gpsInput" value="<?php echo htmlspecialchars($entry['gps'] ?? ''); ?>">
                <input type="hidden" name="location" id="locationInput" value="<?php echo htmlspecialchars($entry['location'] ?? ''); ?>">

                <!-- Header: Kategória és Cím -->
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <select name="category" class="bg-zinc-800 text-xs font-bold uppercase tracking-wider text-white px-2 py-1 rounded border-none focus:ring-0 cursor-pointer" onchange="this.form.submit()">
                            <option value="DAILY" <?php echo ($entry['category'] === 'DAILY') ? 'selected' : ''; ?>>Napi Napló</option>
                            <option value="WEEKLY" <?php echo ($entry['category'] === 'WEEKLY') ? 'selected' : ''; ?>>Heti Összegző</option>
                            <option value="MONTHLY" <?php echo ($entry['category'] === 'MONTHLY') ? 'selected' : ''; ?>>Havi Tervező</option>
                        </select>

                        <div class="flex items-center gap-2">
                             <input type="date" name="dateLabel" value="<?php echo htmlspecialchars($entry['dateLabel']); ?>" class="bg-transparent text-sm text-zinc-400 focus:text-white focus:outline-none text-right">
                        </div>
                    </div>

                    <input
                        type="text"
                        name="title"
                        value="<?php echo htmlspecialchars($entry['title']); ?>"
                        class="w-full bg-transparent text-3xl md:text-4xl font-bold text-white placeholder-zinc-700 focus:outline-none"
                        placeholder="Cím nélkül..."
                    >
                </div>

                <!-- Hangulat Választó -->
                <div>
                    <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <?php
                        $moods = ['😭','😔','😐','🙂','😁','🤩','😡','😴','🤒'];
                        foreach ($moods as $m):
                            $active = ($entry['mood'] ?? '') === $m;
                        ?>
                            <label class="cursor-pointer group relative">
                                <input type="radio" name="mood" value="<?php echo $m; ?>" class="peer sr-only" <?php echo $active ? 'checked' : ''; ?>>
                                <div class="text-3xl p-2 rounded-xl transition-all peer-checked:bg-emerald-500/20 peer-checked:scale-110 grayscale peer-checked:grayscale-0 opacity-50 peer-checked:opacity-100 group-hover:opacity-80">
                                    <?php echo $m; ?>
                                </div>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Tags -->
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <i data-lucide="hash" class="w-4 h-4 text-emerald-500"></i>
                        <input
                            type="text"
                            name="tags"
                            value="<?php echo htmlspecialchars(implode(', ', $entry['tags'] ?? [])); ?>"
                            class="bg-transparent w-full text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none"
                            placeholder="Címkék (vesszővel elválasztva)..."
                        >
                    </div>
                </div>

                <hr class="border-zinc-800" />

                <!-- Content Area -->
                <div class="space-y-6">
                    <!-- Mode Switcher -->
                    <div class="flex bg-zinc-900 p-1 rounded-lg w-fit border border-zinc-800">
                        <label class="cursor-pointer px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-2 <?php echo $entry['entryMode'] === 'structured' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-500 hover:text-white'; ?>">
                            <input type="radio" name="entryMode" value="structured" class="sr-only" onchange="document.getElementById('structuredArea').style.display='block'; document.getElementById('freeArea').style.display='none';" <?php echo $entry['entryMode'] === 'structured' ? 'checked' : ''; ?>>
                            <i data-lucide="list-checks" class="w-3 h-3"></i> Kérdések
                        </label>
                        <label class="cursor-pointer px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-2 <?php echo $entry['entryMode'] === 'free' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-500 hover:text-white'; ?>">
                            <input type="radio" name="entryMode" value="free" class="sr-only" onchange="document.getElementById('structuredArea').style.display='none'; document.getElementById('freeArea').style.display='block';" <?php echo $entry['entryMode'] === 'free' ? 'checked' : ''; ?>>
                            <i data-lucide="align-left" class="w-3 h-3"></i> Szabad Szöveg
                        </label>
                    </div>

                    <!-- Structured Area -->
                    <div id="structuredArea" style="display: <?php echo $entry['entryMode'] === 'structured' ? 'block' : 'none'; ?>;">
                        <?php if (empty($active_questions)): ?>
                            <div class="text-center p-8 border border-dashed border-zinc-800 rounded-lg text-zinc-500">
                                <p>Nincsenek aktív kérdések ebben a kategóriában.</p>
                                <a href="index.php?page=questions&category=<?php echo $current_category; ?>" class="text-emerald-500 text-sm font-bold mt-2 inline-block">Kérdések kezelése</a>
                            </div>
                        <?php else: ?>
                            <div class="space-y-6">
                                <?php foreach ($active_questions as $q): ?>
                                    <div class="animate-fade-in">
                                        <label class="block text-sm font-semibold text-emerald-500 mb-2">
                                            <?php echo htmlspecialchars($q['text']); ?>
                                        </label>
                                        <textarea
                                            name="response[<?php echo $q['id']; ?>]"
                                            rows="3"
                                            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm leading-relaxed placeholder-zinc-700 resize-none transition-all"
                                            placeholder="Írd ide a választ..."
                                        ><?php echo htmlspecialchars($entry['responses'][$q['id']] ?? ''); ?></textarea>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <!-- Free Text Area -->
                    <div id="freeArea" style="display: <?php echo $entry['entryMode'] === 'free' ? 'block' : 'none'; ?>;">
                        <textarea
                            name="freeTextContent"
                            rows="15"
                            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-sm leading-relaxed placeholder-zinc-700 resize-none"
                            placeholder="Írd le a gondolataidat..."
                        ><?php echo htmlspecialchars($entry['freeTextContent']); ?></textarea>
                    </div>
                </div>

                <!-- Save Action Bar (Mobile Sticky / Desktop Inline) -->
                <div class="pt-6 mt-6 border-t border-zinc-800 flex justify-between items-center">
                    <button type="button" onclick="if(confirm('Biztosan törlöd?')) { var i = document.createElement('input'); i.name='action'; i.value='delete_entry'; this.form.appendChild(i); this.form.submit(); }" class="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-2">
                        <i data-lucide="trash-2" class="w-4 h-4"></i> Törlés
                    </button>
                    <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 flex items-center gap-2">
                        <i data-lucide="save" class="w-4 h-4"></i> Mentés
                    </button>
                </div>
            </form>
        </div>

        <!-- JOBB OLDAL: Map & Habits (50%) -->
        <div class="w-full md:w-1/2 flex flex-col h-full bg-zinc-900">

            <!-- Map Section (Fixed Height or Flex) -->
            <div class="h-64 md:h-1/2 relative border-b border-zinc-800 w-full group">
                <div id="editorMap" class="w-full h-full z-0"></div>
                <div class="absolute top-4 left-4 z-[400] bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-white pointer-events-none">
                    <i data-lucide="map-pin" class="w-3 h-3 inline mr-1"></i>
                    <span id="coordsDisplay"><?php echo $has_gps ? "$lat, $lng" : "Nincs pozíció"; ?></span>
                </div>
                <div class="absolute bottom-4 right-4 z-[400] opacity-50 group-hover:opacity-100 transition-opacity">
                    <button type="button" id="locateBtn" class="p-2 bg-zinc-800 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors" title="Jelenlegi pozícióm">
                        <i data-lucide="crosshair" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- Habits Section -->
            <div class="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-zinc-950/30">
                <h3 class="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <i data-lucide="activity" class="w-4 h-4"></i> Szokások
                </h3>

                <?php if (empty($active_habits)): ?>
                    <p class="text-sm text-zinc-500 italic">Nincsenek aktív szokások.</p>
                <?php else: ?>
                    <div class="grid grid-cols-1 gap-3">
                        <?php foreach ($active_habits as $h):
                            $val = $entry['habitValues'][$h['id']] ?? null;
                            $inputId = "habit_" . $h['id'];
                        ?>
                            <div class="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
                                <label for="<?php echo $inputId; ?>" class="flex items-center gap-3 cursor-pointer flex-1">
                                    <div class="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                                        <i data-lucide="<?php echo $h['icon'] ?? 'circle'; ?>" class="w-4 h-4"></i>
                                    </div>
                                    <span class="font-medium text-sm text-zinc-200"><?php echo htmlspecialchars($h['title']); ?></span>
                                </label>

                                <?php if ($h['type'] === 'boolean'): ?>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="<?php echo $inputId; ?>" name="habit[<?php echo $h['id']; ?>]" form="entryForm" class="peer sr-only" <?php echo $val ? 'checked' : ''; ?>>
                                        <div class="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                <?php else: ?>
                                    <div class="flex items-center gap-2">
                                        <input
                                            type="number"
                                            id="<?php echo $inputId; ?>"
                                            name="habit[<?php echo $h['id']; ?>]"
                                            form="entryForm"
                                            value="<?php echo htmlspecialchars($val ?? ''); ?>"
                                            class="w-20 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-right text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            placeholder="0"
                                        >
                                        <span class="text-xs text-zinc-500 font-bold"><?php echo htmlspecialchars($h['unit'] ?? ''); ?></span>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        lucide.createIcons();

        // Térkép inicializálása
        const map = L.map('editorMap', { zoomControl: false }).setView([<?php echo $lat; ?>, <?php echo $lng; ?>], <?php echo $has_gps ? 13 : 11; ?>);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
        L.control.zoom({ position: 'topright' }).addTo(map);

        let marker = null;
        <?php if ($has_gps): ?>
            marker = L.marker([<?php echo $lat; ?>, <?php echo $lng; ?>], {draggable: true}).addTo(map);
        <?php endif; ?>

        // Térkép kattintás -> Marker
        map.on('click', function(e) {
            const lat = e.latlng.lat.toFixed(6);
            const lng = e.latlng.lng.toFixed(6);

            if (marker) {
                marker.setLatLng(e.latlng);
            } else {
                marker = L.marker(e.latlng, {draggable: true}).addTo(map);
                marker.on('dragend', updateInput);
            }
            updateInput();
        });

        function updateInput() {
            if (!marker) return;
            const pos = marker.getLatLng();
            const val = `${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
            document.getElementById('gpsInput').value = val;
            document.getElementById('coordsDisplay').textContent = val;

            // Reverse Geocoding (opcionális, kliens oldali OpenStreetMap Nominatim)
            // Itt most csak a koordinátát mentjük, a szerver oldali vagy komolyabb geokódolás bonyolítaná
        }

        if (marker) marker.on('dragend', updateInput);

        // Saját pozíció gomb
        document.getElementById('locateBtn').addEventListener('click', function() {
            map.locate({setView: true, maxZoom: 16});
        });

        map.on('locationfound', function(e) {
            if (marker) marker.setLatLng(e.latlng);
            else {
                marker = L.marker(e.latlng, {draggable: true}).addTo(map);
                marker.on('dragend', updateInput);
            }
            updateInput();
        });

        // Map méret frissítés (ha a layout változik, vagy betöltés után)
        setTimeout(() => map.invalidateSize(), 200);
    });
</script>
