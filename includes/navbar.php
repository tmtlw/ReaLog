<?php
// includes/navbar.php
$active_page = $_GET['page'] ?? 'dashboard';
?>
<nav class="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <div class="flex items-center gap-3">
                <a href="?page=dashboard" class="flex items-center gap-2 group">
                    <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        R
                    </div>
                    <span class="text-xl font-lobster text-emerald-500" style="font-family: 'Lobster', cursive;">ReaLog</span>
                </a>
            </div>

            <!-- Desktop Nav -->
            <div class="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                <a href="?page=dashboard" class="px-4 py-2 rounded-lg text-sm font-bold transition-all <?php echo $active_page === 'dashboard' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'; ?>">
                    <i data-lucide="layout-grid" class="w-4 h-4 inline-block mr-1"></i> <?php echo t('nav.dashboard'); ?>
                </a>
                <a href="?page=entries" class="px-4 py-2 rounded-lg text-sm font-bold transition-all <?php echo $active_page === 'entries' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'; ?>">
                    <i data-lucide="list" class="w-4 h-4 inline-block mr-1"></i> <?php echo t('nav.entries'); ?>
                </a>
                <a href="?page=calendar" class="px-4 py-2 rounded-lg text-sm font-bold transition-all <?php echo $active_page === 'calendar' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'; ?>">
                    <i data-lucide="calendar" class="w-4 h-4 inline-block mr-1"></i> <?php echo t('nav.calendar'); ?>
                </a>
                <a href="?page=atlas" class="px-4 py-2 rounded-lg text-sm font-bold transition-all <?php echo $active_page === 'atlas' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'; ?>">
                    <i data-lucide="map-pin" class="w-4 h-4 inline-block mr-1"></i> <?php echo t('nav.atlas'); ?>
                </a>
            </div>

            <!-- Right Side -->
            <div class="flex items-center gap-2">
                <form action="index.php" method="POST" class="inline">
                    <input type="hidden" name="action" value="logout">
                    <button type="submit" class="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors" title="Kijelentkezés">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                    </button>
                </form>
            </div>
        </div>
    </div>
</nav>
