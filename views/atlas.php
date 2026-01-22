<?php
// views/atlas.php
$entries = load_data(ENTRIES_FILE);

// Szűrjük azokat a bejegyzéseket, amelyeknek van GPS koordinátája (bár a mostani struktúrában nincs explicit GPS mező a formban, de feltételezzük a jövőbeli kompatibilitást vagy a meglévő adatokat).
// A jelenlegi editorban nincs GPS mező, de ha lenne, 'gps' kulcs alatt lenne 'lat,lng' string.
// Mivel az editorban nincs, most csak placeholder adatokat vagy a meglévő entry-k "location" mezőjét (ha van geokódolva) használhatnánk, de maradjunk a technikai megvalósításnál.
// Ha nincs adat, mutassunk egy alap térképet.

// Teszt adat generálása a demóhoz, ha nincs valódi GPS adat
$map_entries = array_filter($entries, function($e) {
    return !empty($e['gps']) || !empty($e['location']);
});

// JSON előkészítése JS-nek
$entries_json = json_encode(array_values($map_entries));
?>

<div class="max-w-6xl mx-auto w-full p-4 h-[calc(100vh-80px)] flex flex-col">
    <div class="flex items-center justify-between mb-4 shrink-0">
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <i data-lucide="map-pin" class="w-6 h-6"></i> Térkép (Atlasz)
        </h1>
    </div>

    <div class="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden relative z-0">
        <div id="map" class="w-full h-full"></div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Térkép inicializálása
        const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([47.4979, 19.0402], 5); // Budapest kezdőpont

        // Sötét térkép stílus (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const entries = <?php echo $entries_json; ?>;
        const markers = [];

        // Ha vannak koordináták, markerek hozzáadása
        entries.forEach(entry => {
            if (entry.gps) {
                const [lat, lng] = entry.gps.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                    const marker = L.marker([lat, lng])
                        .addTo(map)
                        .bindPopup(`
                            <div class="text-zinc-900">
                                <div class="font-bold">${entry.title || entry.dateLabel}</div>
                                <div class="text-xs">${new Date(entry.timestamp).toLocaleDateString()}</div>
                                <a href="index.php?page=editor&id=${entry.id}" class="text-emerald-600 hover:underline text-xs font-bold block mt-1">Megnyitás</a>
                            </div>
                        `);
                    markers.push(marker);
                }
            }
        });

        // Ha vannak markerek, igazítsuk a nézetet rájuk
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        } else {
             // Ha nincs adat, de demót akarunk mutatni (opcionális), vagy csak jelzünk
             // Most hagyjuk az alapnézetet
        }
    });
</script>
