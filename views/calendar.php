<?php
// views/calendar.php
$entries = load_data(ENTRIES_FILE);

// Aktuális hónap (vagy kiválasztott)
$year = isset($_GET['year']) ? (int)$_GET['year'] : date('Y');
$month = isset($_GET['month']) ? (int)$_GET['month'] : date('n');

// Következő/Előző hónap
$prev_month_ts = mktime(0, 0, 0, $month - 1, 1, $year);
$next_month_ts = mktime(0, 0, 0, $month + 1, 1, $year);
$prev_link = "?page=calendar&year=" . date('Y', $prev_month_ts) . "&month=" . date('n', $prev_month_ts);
$next_link = "?page=calendar&year=" . date('Y', $next_month_ts) . "&month=" . date('n', $next_month_ts);

// Hónap adatai
$days_in_month = cal_days_in_month(CAL_GREGORIAN, $month, $year);
$first_day_of_month = date('N', mktime(0, 0, 0, $month, 1, $year)); // 1 (Hétfő) - 7 (Vasárnap)

// Bejegyzések indexelése nap szerint (YYYY-MM-DD)
$entries_by_date = [];
foreach ($entries as $e) {
    if (!($e['isTrashed'] ?? false)) {
        // Timestamp to Date
        $date_str = date('Y-n-j', ($e['timestamp'] ?? time()) / 1000);
        $entries_by_date[$date_str][] = $e;
    }
}

// Hónap nevek magyarul
$months_hu = [1=>'Január', 2=>'Február', 3=>'Március', 4=>'Április', 5=>'Május', 6=>'Június', 7=>'Július', 8=>'Augusztus', 9=>'Szeptember', 10=>'Október', 11=>'November', 12=>'December'];
$days_hu = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
?>

<div class="max-w-6xl mx-auto w-full p-4">
    <!-- Fejléc -->
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <i data-lucide="calendar" class="w-6 h-6"></i> Naptár
        </h1>
        <div class="flex items-center gap-4 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <a href="<?php echo $prev_link; ?>" class="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white">
                <i data-lucide="chevron-left" class="w-5 h-5"></i>
            </a>
            <span class="font-bold text-lg w-32 text-center select-none">
                <?php echo $year . ' ' . $months_hu[$month]; ?>
            </span>
            <a href="<?php echo $next_link; ?>" class="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white">
                <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </a>
        </div>
    </div>

    <!-- Naptár Rács -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <!-- Napok nevei -->
        <div class="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950/50">
            <?php foreach ($days_hu as $d): ?>
                <div class="py-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <?php echo $d; ?>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Napok -->
        <div class="grid grid-cols-7 auto-rows-fr">
            <?php
            // Üres cellák az elején
            for ($i = 1; $i < $first_day_of_month; $i++) {
                echo '<div class="h-24 md:h-32 border-b border-r border-zinc-800/50 bg-zinc-950/30"></div>';
            }

            // Napok
            for ($day = 1; $day <= $days_in_month; $day++) {
                $date_key = "$year-$month-$day";
                $day_entries = $entries_by_date[$date_key] ?? [];
                $is_today = ($year == date('Y') && $month == date('n') && $day == date('j'));

                // Cella
                echo '<div class="h-24 md:h-32 border-b border-r border-zinc-800/50 p-2 relative group hover:bg-zinc-800/20 transition-colors">';

                // Dátum szám
                echo '<div class="flex justify-between items-start mb-1">';
                echo '<span class="text-sm font-bold ' . ($is_today ? 'bg-emerald-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-zinc-400') . '">' . $day . '</span>';

                // Ha van bejegyzés, "Add New" gomb elrejtve vagy kicsi, ha nincs, "+" gomb
                if (empty($day_entries)) {
                     // Link az új bejegyzéshez az adott dátumra
                     $date_iso = sprintf('%04d-%02d-%02d', $year, $month, $day);
                     // Megjegyzés: Az editor URL-ben át kellene adni a dátumot, de a jelenlegi editor logika nem kezeli a GET date paramétert a form fillhez. Ez egy fejlesztési lehetőség.
                     echo '<a href="index.php?page=editor" class="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-emerald-500 transition-opacity"><i data-lucide="plus" class="w-4 h-4"></i></a>';
                }
                echo '</div>';

                // Bejegyzések listázása (emoji vagy pont)
                echo '<div class="flex flex-col gap-1 overflow-y-auto max-h-[calc(100%-24px)] custom-scrollbar">';
                foreach ($day_entries as $e) {
                    echo '<a href="index.php?page=editor&id=' . $e['id'] . '" class="text-xs bg-zinc-800/80 hover:bg-emerald-500/20 border border-zinc-700/50 hover:border-emerald-500/30 rounded px-1.5 py-1 transition-colors truncate block">';
                    if (!empty($e['mood'])) {
                        echo '<span class="mr-1">' . $e['mood'] . '</span>';
                    }
                    echo htmlspecialchars($e['title'] ?: 'Napló');
                    echo '</a>';
                }
                echo '</div>';

                echo '</div>'; // End cell
            }

            // Maradék üres cellák a végén (hogy teljes legyen a rács, opcionális)
            $remaining = 7 - (($days_in_month + $first_day_of_month - 1) % 7);
            if ($remaining < 7) {
                for ($i = 0; $i < $remaining; $i++) {
                    echo '<div class="h-24 md:h-32 border-b border-r border-zinc-800/50 bg-zinc-950/30"></div>';
                }
            }
            ?>
        </div>
    </div>
</div>
