<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Define data directory
define('DATA_DIR', __DIR__ . '/data');
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

$entriesFile = DATA_DIR . '/entries.json';
$settingsFile = DATA_DIR . '/settings.json';
$questionsFile = DATA_DIR . '/questions.json';
$habitsFile = DATA_DIR . '/habits.json';
$imgDir = __DIR__ . '/img';

// Képek mappa létrehozása, ha nem létezik
if (!file_exists($imgDir)) {
    mkdir($imgDir, 0755, true);
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

if ($method === 'OPTIONS') { exit(0); }

// Státusz ellenőrzés
if (strpos($uri, '/status') !== false) {
    echo json_encode(['status' => 'online', 'type' => 'php', 'version' => phpversion()]);
    exit;
}

// Képfeltöltés
if (strpos($uri, '/upload') !== false && $method === 'POST') {
    if (!isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nincs képfájl mellékelve']);
        exit;
    }

    $file = $_FILES['image'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    if (!in_array($ext, $allowed)) {
        http_response_code(400);
        echo json_encode(['error' => 'Érvénytelen fájltípus']);
        exit;
    }

    $filename = uniqid() . '.' . $ext;
    $targetPath = $imgDir . '/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Relatív útvonal visszaadása
        echo json_encode(['url' => 'img/' . $filename]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Fájl mentése sikertelen']);
    }
    exit;
}

// Data Handling (GET/POST)
// Endpoint structure: /api.php/data or just /api.php with query params?
// The JS service usually calls just the base URL or with ?action=...
// Let's support a robust bulk load/save.

if ($method === 'GET') {
    $entries = [];
    $settings = [];
    $questions = [];
    $habits = [];

    if (file_exists($entriesFile)) $entries = json_decode(file_get_contents($entriesFile), true) ?? [];
    if (file_exists($settingsFile)) $settings = json_decode(file_get_contents($settingsFile), true) ?? [];
    if (file_exists($questionsFile)) $questions = json_decode(file_get_contents($questionsFile), true) ?? [];
    if (file_exists($habitsFile)) $habits = json_decode(file_get_contents($habitsFile), true) ?? [];

    echo json_encode([
        'entries' => $entries,
        'settings' => $settings,
        'questions' => $questions,
        'habits' => $habits
    ]);

} elseif ($method === 'POST') {
    $input = file_get_contents('php://input');
    $json = json_decode($input, true);

    if ($json === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Érvénytelen JSON']);
    } else {
        // Handle "action" based requests if any, or just bulk save
        if (isset($json['action']) && $json['action'] === 'save') {
             // Bulk Save from App
            if (isset($json['questions'])) file_put_contents($questionsFile, json_encode($json['questions']));
            if (isset($json['entries'])) file_put_contents($entriesFile, json_encode($json['entries']));
            if (isset($json['settings'])) file_put_contents($settingsFile, json_encode($json['settings']));
            if (isset($json['habits'])) file_put_contents($habitsFile, json_encode($json['habits']));
            echo json_encode(['success' => true]);
        } else {
            // Legacy / Direct Save
            if (isset($json['questions'])) file_put_contents($questionsFile, json_encode($json['questions']));
            if (isset($json['entries'])) file_put_contents($entriesFile, json_encode($json['entries']));
            if (isset($json['settings'])) file_put_contents($settingsFile, json_encode($json['settings']));
            if (isset($json['habits'])) file_put_contents($habitsFile, json_encode($json['habits']));
            echo json_encode(['success' => true]);
        }
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'A metódus nem engedélyezett']);
}
?>
