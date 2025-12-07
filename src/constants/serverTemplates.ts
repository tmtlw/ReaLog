import { DEFAULT_QUESTIONS } from '../constants';

export const SERVER_CODE_JSCRIPT = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ENTRIES_FILE = path.join(__dirname, 'entries.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const QUESTIONS_FILE = path.join(__dirname, 'questions.json');
const IMG_DIR = path.join(__dirname, 'img');

// Ensure img dir exists
if (!fs.existsSync(IMG_DIR)){
    fs.mkdirSync(IMG_DIR);
}

// Helper to send JSON response
const send = (data, status = 200) => {
    // CGI headers: Content-Type + 2 newlines
    console.log("Content-Type: application/json; charset=utf-8");
    console.log(""); 
    console.log(JSON.stringify(data));
    process.exit(0);
};

try {
    const uri = process.env.REQUEST_URI || '';
    const method = process.env.REQUEST_METHOD || 'GET';
    
    if (uri.includes('/status')) {
        send({ status: 'online', nodeVersion: process.version, type: 'nodejs' });
    }
    else if (uri.includes('/upload') && method === 'POST') {
        send({ error: "Képfeltöltés Node.js alatt extra könyvtárak nélkül korlátozott. Kérlek használj PHP módot." });
    }
    else if (method === 'GET') {
        let entries = [];
        let settings = {};
        let questions = [];

        if (fs.existsSync(ENTRIES_FILE)) {
            try {
                entries = JSON.parse(fs.readFileSync(ENTRIES_FILE, 'utf8'));
            } catch(e) {}
        }
        if (fs.existsSync(SETTINGS_FILE)) {
            try {
                settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
            } catch(e) {}
        }
        if (fs.existsSync(QUESTIONS_FILE)) {
             try {
                questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
            } catch(e) {}
        }
        
        send({ entries, settings, questions });
    }
    else if (method === 'POST') {
        let body = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => body += chunk);
        process.stdin.on('end', () => {
            try {
                const input = JSON.parse(body);
                if (input.questions) {
                    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(input.questions), 'utf8');
                }
                if (input.entries) {
                    fs.writeFileSync(ENTRIES_FILE, JSON.stringify(input.entries), 'utf8');
                }
                if (input.settings) {
                    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(input.settings), 'utf8');
                }
                send({ success: true });
            } catch (e) {
                console.log("Status: 400 Bad Request");
                send({ error: "Invalid JSON or Write Error: " + e.message });
            }
        });
    }
    else {
        console.log("Status: 405 Method Not Allowed");
        send({ error: "Method not allowed" });
    }
} catch (err) {
    console.log("Status: 500 Internal Server Error");
    send({ error: err.message });
}`;

export const SERVER_CODE_HTACCESS_NODE = `Options +ExecCGI
AddHandler cgi-script .jscript
DirectoryIndex index.html

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /naplo/

# 1. Route API calls to api.jscript
RewriteRule ^api/(.*)$ api.jscript [L]

# 2. Serve existing files directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# 3. Everything else -> index.html (Client Side Routing)
RewriteRule ^ index.html [L]
</IfModule>`;

export const SERVER_CODE_PHP = `<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$entriesFile = __DIR__ . '/entries.json';
$settingsFile = __DIR__ . '/settings.json';
$questionsFile = __DIR__ . '/questions.json';
$imgDir = __DIR__ . '/img';

if (!file_exists($imgDir)) {
    mkdir($imgDir, 0755, true);
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

if ($method === 'OPTIONS') { exit(0); }

// Status check
if (strpos($uri, '/status') !== false) {
    echo json_encode(['status' => 'online', 'type' => 'php', 'version' => phpversion()]);
    exit;
}

// Image Upload
if (strpos($uri, '/upload') !== false && $method === 'POST') {
    if (!isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No image file provided']);
        exit;
    }
    
    $file = $_FILES['image'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!in_array($ext, $allowed)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type']);
        exit;
    }
    
    $filename = uniqid() . '.' . $ext;
    $targetPath = $imgDir . '/' . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Return relative path from index.html
        echo json_encode(['url' => 'img/' . $filename]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
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
        echo json_encode(['error' => 'Invalid JSON']);
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
    echo json_encode(['error' => 'Method not allowed']);
}
?>`;

export const SERVER_CODE_HTACCESS_PHP = `<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /naplo/

# Route API calls to api.php
RewriteRule ^api/(.*)$ api.php [L,QSA]

# Serve files
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Route everything else to index.html
RewriteRule ^ index.html [L]
</IfModule>`;