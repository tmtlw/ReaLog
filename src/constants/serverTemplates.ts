
import { DEFAULT_QUESTIONS } from '../constants';

export const SERVER_CODE_JSCRIPT = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'posts');
const BACKUPS_DIR = path.join(__dirname, 'backups');
const IMG_DIR = path.join(__dirname, 'img');

// Data Files
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const TAGS_FILE = path.join(POSTS_DIR, 'tags.json');

// Questions: Default in root, Custom in posts
const DEFAULT_QUESTIONS_FILE = path.join(__dirname, 'questions.json');
const CUSTOM_QUESTIONS_FILE = path.join(POSTS_DIR, 'questions.json');

// Ensure directories exist
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR);
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR);

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
            if (file.endsWith('.json') && file !== 'tags.json' && file !== 'questions.json') {
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

// Recursive delete
const deleteFolderRecursive = (dirPath) => {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                if (file !== 'tags.json' && file !== 'questions.json') {
                    fs.unlinkSync(curPath);
                }
            }
        });
    }
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
        const urlParams = new URLSearchParams(uri.split('?')[1]);
        const action = urlParams.get('action');

        if (action === 'list_backups') {
            const files = fs.readdirSync(BACKUPS_DIR)
                .filter(f => f.endsWith('.json'))
                .map(f => {
                    const stat = fs.statSync(path.join(BACKUPS_DIR, f));
                    return { name: f, size: stat.size, date: stat.mtime.getTime() };
                })
                .sort((a,b) => b.date - a.date);
            send({ backups: files });
        } else {
            // Load logic
            let entries = [];
            let settings = {};
            let questions = [];

            entries = getAllEntries(POSTS_DIR);

            // Fallback for legacy
            const LEGACY_ENTRIES = path.join(__dirname, 'entries.json');
            if (entries.length === 0 && fs.existsSync(LEGACY_ENTRIES)) {
                 try { entries = JSON.parse(fs.readFileSync(LEGACY_ENTRIES, 'utf8')); } catch(e) {}
            }

            if (fs.existsSync(SETTINGS_FILE)) {
                try { settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); } catch(e) {}
            }
            
            // SMART QUESTIONS MERGE: Load Default First, Then Merge Custom
            let defaultQuestions = [];
            if (fs.existsSync(DEFAULT_QUESTIONS_FILE)) {
                 try { defaultQuestions = JSON.parse(fs.readFileSync(DEFAULT_QUESTIONS_FILE, 'utf8')); } catch(e) {}
            }
            
            if (fs.existsSync(CUSTOM_QUESTIONS_FILE)) {
                 try { 
                     const customQuestions = JSON.parse(fs.readFileSync(CUSTOM_QUESTIONS_FILE, 'utf8'));
                     
                     // Create a map for defaults
                     const qMap = {};
                     defaultQuestions.forEach(q => qMap[q.id] = q);
                     
                     // Overwrite with custom (handles status changes) and add new ones
                     customQuestions.forEach(q => qMap[q.id] = q);
                     
                     questions = Object.values(qMap);
                 } catch(e) {
                     questions = defaultQuestions; // Fallback if custom corrupted
                 }
            } else {
                questions = defaultQuestions;
            }
            
            send({ entries, settings, questions });
        }
    }
    else if (method === 'POST') {
        let body = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => body += chunk);
        process.stdin.on('end', () => {
            try {
                const input = JSON.parse(body);
                const action = input.action || 'save';

                if (action === 'backup') {
                    // Create full backup
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const backupFile = path.join(BACKUPS_DIR, \`backup-\${timestamp}.json\`);
                    
                    const entries = getAllEntries(POSTS_DIR);
                    let settings = {};
                    let questions = [];
                    
                    if (fs.existsSync(SETTINGS_FILE)) settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
                    if (fs.existsSync(CUSTOM_QUESTIONS_FILE)) questions = JSON.parse(fs.readFileSync(CUSTOM_QUESTIONS_FILE, 'utf8'));
                    
                    fs.writeFileSync(backupFile, JSON.stringify({ entries, settings, questions }), 'utf8');
                    send({ success: true, file: \`backup-\${timestamp}.json\` });
                }
                else if (action === 'restore') {
                    const filename = input.filename;
                    const backupPath = path.join(BACKUPS_DIR, filename);
                    
                    if (!fs.existsSync(backupPath)) {
                        send({ error: "Backup file not found" }, 404);
                    } else {
                        const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
                        
                        // Clear current posts
                        deleteFolderRecursive(POSTS_DIR);
                        if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);

                        // Save restored data using standard save logic (calling inner save logic function would be better but simple copy here)
                        if (data.questions) fs.writeFileSync(CUSTOM_QUESTIONS_FILE, JSON.stringify(data.questions), 'utf8');
                        if (data.settings) fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data.settings), 'utf8');
                        
                        if (data.entries) {
                            const grouped = {};
                            const allTags = {};
                            data.entries.forEach(entry => {
                                const date = new Date(entry.timestamp);
                                const year = date.getFullYear();
                                const week = getWeekNumber(date);
                                const key = \`\${year}/\${week}\`;
                                if (!grouped[key]) grouped[key] = [];
                                grouped[key].push(entry);
                                
                                if (entry.tags) {
                                    entry.tags.forEach(tag => {
                                        if (!allTags[tag]) allTags[tag] = [];
                                        allTags[tag].push({ id: entry.id, title: entry.title, path: \`posts/\${key}.json\` });
                                    });
                                }
                            });
                            
                            Object.keys(grouped).forEach(key => {
                                const [year, week] = key.split('/');
                                const yearDir = path.join(POSTS_DIR, year);
                                if (!fs.existsSync(yearDir)) fs.mkdirSync(yearDir, { recursive: true });
                                fs.writeFileSync(path.join(yearDir, \`\${week}.json\`), JSON.stringify(grouped[key]), 'utf8');
                            });
                            fs.writeFileSync(TAGS_FILE, JSON.stringify(allTags), 'utf8');
                        }
                        
                        send({ success: true });
                    }
                }
                else if (action === 'reset') {
                    // Clear posts but keep settings and custom questions
                    deleteFolderRecursive(POSTS_DIR);
                    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
                    
                    // Re-save custom questions if they exist in memory or just keep them?
                    // "Reset Diary" usually implies clearing entries.
                    // If we delete folder, we lose custom questions.
                    // The prompt says "törölné, minden bejegyzést" (delete all entries).
                    
                    // We should PRESERVE custom questions if possible, or just delete entries.
                    // Ideally read questions first, delete dir, restore questions.
                    
                    let questions = null;
                    if (fs.existsSync(CUSTOM_QUESTIONS_FILE)) questions = fs.readFileSync(CUSTOM_QUESTIONS_FILE);
                    
                    deleteFolderRecursive(POSTS_DIR); // This is aggressive, removes folders
                    // Recreate structure
                    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
                    
                    if (questions) fs.writeFileSync(CUSTOM_QUESTIONS_FILE, questions);
                    
                    send({ success: true });
                }
                else {
                    // Standard Save
                    if (input.questions) {
                        fs.writeFileSync(CUSTOM_QUESTIONS_FILE, JSON.stringify(input.questions), 'utf8');
                    }
                    if (input.settings) {
                        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(input.settings), 'utf8');
                    }
                    
                    if (input.entries) {
                        const grouped = {};
                        const allTags = {};
                        input.entries.forEach(entry => {
                            const date = new Date(entry.timestamp);
                            const year = date.getFullYear();
                            const week = getWeekNumber(date);
                            const key = \`\${year}/\${week}\`;
                            if (!grouped[key]) grouped[key] = [];
                            grouped[key].push(entry);
                            if (entry.tags) {
                                entry.tags.forEach(tag => {
                                    if (!allTags[tag]) allTags[tag] = [];
                                    allTags[tag].push({ id: entry.id, title: entry.title, path: \`posts/\${key}.json\` });
                                });
                            }
                        });
                        Object.keys(grouped).forEach(key => {
                            const [year, week] = key.split('/');
                            const yearDir = path.join(POSTS_DIR, year);
                            if (!fs.existsSync(yearDir)) fs.mkdirSync(yearDir, { recursive: true });
                            fs.writeFileSync(path.join(yearDir, \`\${week}.json\`), JSON.stringify(grouped[key]), 'utf8');
                        });
                        fs.writeFileSync(TAGS_FILE, JSON.stringify(allTags), 'utf8');
                    }
                    send({ success: true });
                }
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
$backupsDir = __DIR__ . '/backups';
$imgDir = __DIR__ . '/img';

$settingsFile = __DIR__ . '/settings.json';
$tagsFile = $postsDir . '/tags.json';

// Questions logic: Default in root, Custom in posts
$defaultQuestionsFile = __DIR__ . '/questions.json';
$customQuestionsFile = $postsDir . '/questions.json';

if (!file_exists($imgDir)) mkdir($imgDir, 0755, true);
if (!file_exists($postsDir)) mkdir($postsDir, 0755, true);
if (!file_exists($backupsDir)) mkdir($backupsDir, 0755, true);

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

if ($method === 'OPTIONS') { exit(0); }

// Helper to recursive delete
function rmdir_recursive($dir) {
    foreach(scandir($dir) as $file) {
        if ('.' === $file || '..' === $file) continue;
        if (is_dir("$dir/$file")) rmdir_recursive("$dir/$file");
        else {
            // Don't delete questions and tags if specific logic requires, but for RESET we clear posts
            // But we want to preserve questions.json if it exists in posts/
            if ($file !== 'questions.json' && $file !== 'tags.json') unlink("$dir/$file");
        }
    }
    // rmdir($dir); // Keep the main directory
}

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
    
    $year = date('Y');
    $targetDir = $imgDir . '/' . $year;
    if (!file_exists($targetDir)) mkdir($targetDir, 0755, true);

    $filename = uniqid() . '.' . $ext;
    $targetPath = $targetDir . '/' . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode(['url' => "img/$year/$filename"]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
    }
    exit;
}

if ($method === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'list_backups') {
        $backups = [];
        $files = glob($backupsDir . '/*.json');
        foreach($files as $file) {
            $backups[] = [
                'name' => basename($file),
                'size' => filesize($file),
                'date' => filemtime($file) * 1000
            ];
        }
        usort($backups, function($a, $b) { return $b['date'] - $a['date']; });
        echo json_encode(['backups' => $backups]);
    } else {
        $entries = [];
        $settings = [];
        $questions = [];

        // Recursively find JSONs
        $files = glob($postsDir . '/*/*.json');
        foreach ($files as $file) {
            if (basename($file) === 'tags.json' || basename($file) === 'questions.json') continue;
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
        
        // SMART MERGE: Default + Custom
        $qMap = [];
        if (file_exists($defaultQuestionsFile)) {
            $content = file_get_contents($defaultQuestionsFile);
            $defQ = json_decode($content, true);
            if (is_array($defQ)) {
                foreach($defQ as $q) $qMap[$q['id']] = $q;
            }
        }
        
        if (file_exists($customQuestionsFile)) {
            $content = file_get_contents($customQuestionsFile);
            $cusQ = json_decode($content, true);
            if (is_array($cusQ)) {
                foreach($cusQ as $q) $qMap[$q['id']] = $q;
            }
        }
        $questions = array_values($qMap);

        echo json_encode([
            'entries' => $entries,
            'settings' => $settings,
            'questions' => $questions
        ]);
    }

} elseif ($method === 'POST') {
    $input = file_get_contents('php://input');
    $json = json_decode($input, true);

    if ($json === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
    } else {
        $action = isset($json['action']) ? $json['action'] : 'save';

        if ($action === 'backup') {
            $timestamp = date('Y-m-d-H-i-s');
            $backupFile = $backupsDir . "/backup-$timestamp.json";
            
            // Collect all data
            $entries = [];
            $files = glob($postsDir . '/*/*.json');
            foreach ($files as $file) {
                if (basename($file) === 'tags.json' || basename($file) === 'questions.json') continue;
                $c = file_get_contents($file);
                $d = json_decode($c, true);
                if (is_array($d)) $entries = array_merge($entries, $d);
            }
            
            $settings = file_exists($settingsFile) ? json_decode(file_get_contents($settingsFile), true) : [];
            $questions = file_exists($customQuestionsFile) ? json_decode(file_get_contents($customQuestionsFile), true) : [];
            
            file_put_contents($backupFile, json_encode(['entries' => $entries, 'settings' => $settings, 'questions' => $questions]));
            echo json_encode(['success' => true, 'file' => "backup-$timestamp.json"]);
        }
        elseif ($action === 'restore') {
            $filename = basename($json['filename']);
            $backupPath = $backupsDir . '/' . $filename;
            
            if (!file_exists($backupPath)) {
                http_response_code(404);
                echo json_encode(['error' => 'Backup not found']);
            } else {
                $data = json_decode(file_get_contents($backupPath), true);
                
                // Clear posts
                rmdir_recursive($postsDir);
                
                // Restore settings/questions
                if (isset($data['settings'])) file_put_contents($settingsFile, json_encode($data['settings']));
                if (isset($data['questions'])) file_put_contents($customQuestionsFile, json_encode($data['questions']));
                
                // Restore entries
                if (isset($data['entries'])) {
                    $grouped = [];
                    $allTags = [];
                    foreach ($data['entries'] as $entry) {
                        $ts = $entry['timestamp'] / 1000;
                        $year = date('Y', $ts);
                        $week = date('W', $ts);
                        $key = "$year/$week";
                        if (!isset($grouped[$key])) $grouped[$key] = [];
                        $grouped[$key][] = $entry;
                        
                        if (isset($entry['tags']) && is_array($entry['tags'])) {
                            foreach ($entry['tags'] as $tag) {
                                if (!isset($allTags[$tag])) $allTags[$tag] = [];
                                $allTags[$tag][] = ['id' => $entry['id'], 'title' => $entry['title'] ?? $entry['dateLabel'], 'path' => "posts/$key.json"];
                            }
                        }
                    }
                    foreach ($grouped as $key => $weekEntries) {
                        list($year, $week) = explode('/', $key);
                        $dir = $postsDir . '/' . $year;
                        if (!file_exists($dir)) mkdir($dir, 0755, true);
                        file_put_contents($dir . '/' . $week . '.json', json_encode($weekEntries));
                    }
                    file_put_contents($tagsFile, json_encode($allTags));
                }
                echo json_encode(['success' => true]);
            }
        }
        elseif ($action === 'reset') {
            // Delete all JSONs in posts subfolders, preserve questions.json if needed
            rmdir_recursive($postsDir);
            echo json_encode(['success' => true]);
        }
        else {
            // Standard Save
            if (isset($json['questions'])) {
                file_put_contents($customQuestionsFile, json_encode($json['questions']));
            }
            if (isset($json['settings'])) {
                file_put_contents($settingsFile, json_encode($json['settings']));
            }
            if (isset($json['entries'])) {
                $grouped = [];
                $allTags = [];
                foreach ($json['entries'] as $entry) {
                    $ts = $entry['timestamp'] / 1000;
                    $year = date('Y', $ts);
                    $week = date('W', $ts);
                    $key = "$year/$week";
                    if (!isset($grouped[$key])) $grouped[$key] = [];
                    $grouped[$key][] = $entry;
                    if (isset($entry['tags']) && is_array($entry['tags'])) {
                        foreach ($entry['tags'] as $tag) {
                            if (!isset($allTags[$tag])) $allTags[$tag] = [];
                            $allTags[$tag][] = ['id' => $entry['id'], 'title' => isset($entry['title']) ? $entry['title'] : $entry['dateLabel'], 'path' => "posts/$key.json"];
                        }
                    }
                }
                foreach ($grouped as $key => $weekEntries) {
                    list($year, $week) = explode('/', $key);
                    $dir = $postsDir . '/' . $year;
                    if (!file_exists($dir)) mkdir($dir, 0755, true);
                    file_put_contents($dir . '/' . $week . '.json', json_encode($weekEntries));
                }
                file_put_contents($tagsFile, json_encode($allTags));
            }
            echo json_encode(['success' => true]);
        }
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
