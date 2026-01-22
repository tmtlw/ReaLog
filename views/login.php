<div class="flex-1 flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative">
        <div class="text-center mb-6">
            <div class="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                <i data-lucide="lock" class="w-8 h-8 text-white"></i>
            </div>
            <h2 class="text-2xl font-bold text-white"><?php echo t('app.admin_login'); ?></h2>
            <p class="text-sm mt-2 text-zinc-400"><?php echo t('app.login_subtitle'); ?></p>
        </div>

        <?php if (isset($error)): ?>
            <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="index.php?page=login" class="space-y-4">
            <div>
                <input
                    type="password"
                    name="password"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-zinc-600"
                    placeholder="<?php echo t('app.password'); ?>"
                    autofocus
                >
            </div>
            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-emerald-900/20">
                <?php echo t('app.login_btn'); ?>
            </button>
        </form>
    </div>
</div>
