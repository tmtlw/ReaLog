<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$entriesFile = __DIR__ . '/entries.json';
$settingsFile = __DIR__ . '/settings.json';
$questionsFile = __DIR__ . '/questions.json';
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

if ($method === 'GET') {
    $entries = [];
    $settings = [];
    $questions = [];

    if (file_exists($entriesFile)) {
        $content = file_get_contents($entriesFile);
        $decoded = json_decode($content, true);
        if ($decoded) $entries = $decoded;
    }
    if (file_exists($settingsFile)) {
        $content = file_get_contents($settingsFile);
        $decoded = json_decode($content, true);
        if ($decoded) $settings = $decoded;
    }
    if (file_exists($questionsFile)) {
        $content = file_get_contents($questionsFile);
        $decoded = json_decode($content, true);
        if ($decoded) $questions = $decoded;
    }

    echo json_encode([
        'entries' => $entries,
        'settings' => $settings,
        'questions' => $questions
    ]);

} elseif ($method === 'POST') {
    $input = file_get_contents('php://input');
    $json = json_decode($input, true);

    if ($json === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Érvénytelen JSON']);
    } else {
        if (isset($json['questions'])) {
            file_put_contents($questionsFile, json_encode($json['questions']));
        }
        if (isset($json['entries'])) {
            file_put_contents($entriesFile, json_encode($json['entries']));
        }
        if (isset($json['settings'])) {
            file_put_contents($settingsFile, json_encode($json['settings']));
        }

        echo json_encode(['success' => true]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'A metódus nem engedélyezett']);
}
?>