import { DEFAULT_QUESTIONS } from '../constants';

export const SERVER_CODE_JSCRIPT = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'posts');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const QUESTIONS_FILE = path.join(__dirname, 'questions.json');
const IMG_DIR = path.join(__dirname, 'img');

// Ensure directories exist
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR);
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);

// Helper to get ISO week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}

// Helper to send JSON response
const send = (data, status = 200) => {
    console.log("Content-Type: application/json; charset=utf-8");
    console.log(""); 
    console.log(JSON.stringify(data));
    process.exit(0);
};

// Recursive file search
const getAllEntries = (dir, fileList = []) => {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllEntries(filePath, fileList);
        } else {
            if (file.endsWith('.json')) {
                try {
                    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (Array.isArray(content)) {
                        fileList.push(...content);
                    }
                } catch(e) {}
            }
        }
    });
    return fileList;
};

try {
    const uri = process.env.REQUEST_URI || '';
    const method = process.env.REQUEST_METHOD || 'GET';
    
    if (uri.includes('/status')) {
        send({ status: 'online', nodeVersion: process.version, type: 'nodejs (structured)' });
    }
    else if (uri.includes('/upload') && method === 'POST') {
        send({ error: "Képfeltöltés Node.js alatt extra könyvtárak nélkül korlátozott. Kérlek használj PHP módot." });
    }
    else if (method === 'GET') {
        let entries = [];
        let settings = {};
        let questions = [];

        // Load structured posts
        entries = getAllEntries(POSTS_DIR);

        // Fallback for legacy entries.json if posts dir is empty but file exists
        const LEGACY_ENTRIES = path.join(__dirname, 'entries.json');
        if (entries.length === 0 && fs.existsSync(LEGACY_ENTRIES)) {
             try { entries = JSON.parse(fs.readFileSync(LEGACY_ENTRIES, 'utf8')); } catch(e) {}
        }

        if (fs.existsSync(SETTINGS_FILE)) {
            try { settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); } catch(e) {}
        }
        if (fs.existsSync(QUESTIONS_FILE)) {
             try { questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8')); } catch(e) {}
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
                if (input.settings) {
                    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(input.settings), 'utf8');
                }
                
                if (input.entries) {
                    // Group entries by Year/Week
                    const grouped = {};
                    input.entries.forEach(entry => {
                        const date = new Date(entry.timestamp);
                        const year = date.getFullYear();
                        const week = getWeekNumber(date);
                        const key = \`\${year}/\${week}\`;
                        if (!grouped[key]) grouped[key] = [];
                        grouped[key].push(entry);
                    });

                    // Save to structured files
                    Object.keys(grouped).forEach(key => {
                        const [year, week] = key.split('/');
                        const yearDir = path.join(POSTS_DIR, year);
                        if (!fs.existsSync(yearDir)) fs.mkdirSync(yearDir, { recursive: true });
                        
                        const weekFile = path.join(yearDir, \`\${week}.json\`);
                        fs.writeFileSync(weekFile, JSON.stringify(grouped[key]), 'utf8');
                    });
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

$postsDir = __DIR__ . '/posts';
$settingsFile = __DIR__ . '/settings.json';
$questionsFile = __DIR__ . '/questions.json';
$imgDir = __DIR__ . '/img';

if (!file_exists($imgDir)) mkdir($imgDir, 0755, true);
if (!file_exists($postsDir)) mkdir($postsDir, 0755, true);

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

if ($method === 'OPTIONS') { exit(0); }

// Status check
if (strpos($uri, '/status') !== false) {
    echo json_encode(['status' => 'online', 'type' => 'php (structured)', 'version' => phpversion()]);
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
    
    // Create Year Folder
    $year = date('Y');
    $targetDir = $imgDir . '/' . $year;
    if (!file_exists($targetDir)) mkdir($targetDir, 0755, true);

    $filename = uniqid() . '.' . $ext;
    $targetPath = $targetDir . '/' . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Return relative path
        echo json_encode(['url' => "img/$year/$filename"]);
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

    // Recursively find JSONs in posts/YYYY/WW.json
    $files = glob($postsDir . '/*/*.json');
    foreach ($files as $file) {
        $content = file_get_contents($file);
        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            $entries = array_merge($entries, $decoded);
        }
    }

    // Fallback legacy
    $legacyFile = __DIR__ . '/entries.json';
    if (empty($entries) && file_exists($legacyFile)) {
        $content = file_get_contents($legacyFile);
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
        if (isset($json['settings'])) {
            file_put_contents($settingsFile, json_encode($json['settings']));
        }
        
        if (isset($json['entries'])) {
            $grouped = [];
            foreach ($json['entries'] as $entry) {
                // Timestamp is in ms from JS
                $ts = $entry['timestamp'] / 1000;
                $year = date('Y', $ts);
                $week = date('W', $ts);
                $key = "$year/$week";
                if (!isset($grouped[$key])) $grouped[$key] = [];
                $grouped[$key][] = $entry;
            }

            foreach ($grouped as $key => $weekEntries) {
                list($year, $week) = explode('/', $key);
                $dir = $postsDir . '/' . $year;
                if (!file_exists($dir)) mkdir($dir, 0755, true);
                
                file_put_contents($dir . '/' . $week . '.json', json_encode($weekEntries));
            }
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