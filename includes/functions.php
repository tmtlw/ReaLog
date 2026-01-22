<?php
// includes/functions.php

// Munkamenet indítása
session_start();

// Alapértelmezett beállítások
define('DATA_DIR', __DIR__ . '/../');
define('ENTRIES_FILE', DATA_DIR . 'entries.json');
define('SETTINGS_FILE', DATA_DIR . 'settings.json');
define('QUESTIONS_FILE', DATA_DIR . 'questions.json');
define('HABITS_FILE', DATA_DIR . 'habits.json');

/**
 * Adatok betöltése JSON fájlból
 */
function load_data($filename) {
    if (file_exists($filename)) {
        $content = file_get_contents($filename);
        return json_decode($content, true) ?? [];
    }
    return [];
}

/**
 * Adatok mentése JSON fájlba
 */
function save_data($filename, $data) {
    file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

/**
 * Bejelentkezés ellenőrzése
 */
function check_auth() {
    if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true) {
        header('Location: /index.php?page=login');
        exit;
    }
}

/**
 * Fordítási segédfüggvény (egyelőre csak placeholder)
 */
function t($key, $params = []) {
    // Itt lehetne implementálni a nyelvi fájlok betöltését
    // Egyelőre visszaadjuk a kulcs végét vagy hardcode-olt magyar szöveget
    $translations = [
        'common.good_morning' => 'Jó reggelt',
        'common.good_afternoon' => 'Szép napot',
        'common.good_evening' => 'Jó estét',
        'app.login_btn' => 'Bejelentkezés',
        'app.password' => 'Jelszó',
        'app.admin_login' => 'Admin Belépés',
        'app.login_subtitle' => 'Add meg a belépési jelszót',
        'nav.dashboard' => 'Irányítópult',
        'nav.calendar' => 'Naptár',
        'nav.atlas' => 'Térkép',
        'nav.entries' => 'Bejegyzések',
        'nav.gallery' => 'Galéria',
        'common.search' => 'Keresés...',
        'nav.habits' => 'Szokások'
    ];

    return $translations[$key] ?? $key;
}

/**
 * Jelszó ellenőrzés (egyszerűsített, a settings.json-ból vagy default)
 */
function verify_password($password) {
    $settings = load_data(SETTINGS_FILE);
    $stored_password = $settings['adminPassword'] ?? 'grind'; // Default jelszó a memóriából

    // A jelenlegi App.tsx sima szövegként tárolja/hasonlítja, de a memória SHA-256-ot említ.
    // Mivel a JSON-ben vélhetően plain text van (vagy a React kódban), most plain text-et nézek.
    // Ha hash lenne: hash('sha256', $password) === $stored_password

    return $password === $stored_password;
}

/**
 * Aktuális napszak szerinti köszönés
 */
function get_greeting() {
    $hour = (int)date('G');
    if ($hour < 5) return "";
    if ($hour < 10) return t('common.good_morning');
    if ($hour < 18) return t('common.good_afternoon');
    return t('common.good_evening');
}
?>
