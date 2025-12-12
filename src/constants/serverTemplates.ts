
import { DEFAULT_QUESTIONS } from '../constants';

export const SERVER_CODE_JSCRIPT = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'posts');
const BACKUPS_DIR = path.join(__dirname, 'backups');
const IMG_DIR = path.join(__dirname, 'img');
const FONTS_DIR = path.join(__dirname, 'fonts');

// Data Files
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const TAGS_FILE = path.join(POSTS_DIR, 'tags.json');

// Questions: Default in root, Custom in posts
const DEFAULT_QUESTIONS_FILE = path.join(__dirname, 'questions.json');
const CUSTOM_QUESTIONS_FILE = path.join(POSTS_DIR, 'questions.json');

// Ensure directories exist
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR);
if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR);
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

// Recursive copy for backup
const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
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
            
            // SMART QUESTIONS MERGE
            let defaultQuestions = [];
            if (fs.existsSync(DEFAULT_QUESTIONS_FILE)) {
                 try { defaultQuestions = JSON.parse(fs.readFileSync(DEFAULT_QUESTIONS_FILE, 'utf8')); } catch(e) {}
            }
            
            if (fs.existsSync(CUSTOM_QUESTIONS_FILE)) {
                 try { 
                     const customQuestions = JSON.parse(fs.readFileSync(CUSTOM_QUESTIONS_FILE, 'utf8'));
                     const qMap = {};
                     defaultQuestions.forEach(q => qMap[q.id] = q);
                     customQuestions.forEach(q => qMap[q.id] = q);
                     questions = Object.values(qMap);
                 } catch(e) {
                     questions = defaultQuestions;
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
                else if (action === 'system_backup') {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const backupFolder = path.join(BACKUPS_DIR, \`system_backup_\${timestamp}\`);
                    if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder);
                    
                    // Specific files to backup
                    ['index.html', 'style.css', 'sw.js', 'manifest.json', 'package.json'].forEach(f => {
                        const src = path.join(__dirname, f);
                        if (fs.existsSync(src)) fs.copyFileSync(src, path.join(backupFolder, f));
                    });
                    
                    // Recursive copy src folder
                    const srcFolder = path.join(__dirname, 'src');
                    if (fs.existsSync(srcFolder)) copyRecursiveSync(srcFolder, path.join(backupFolder, 'src'));
                    
                    send({ success: true, path: backupFolder });
                }
                else if (action === 'restore') {
                    const filename = input.filename;
                    const backupPath = path.join(BACKUPS_DIR, filename);
                    if (!fs.existsSync(backupPath)) {
                        send({ error: "Backup file not found" }, 404);
                    } else {
                        const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
                        deleteFolderRecursive(POSTS_DIR);
                        if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
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
                    deleteFolderRecursive(POSTS_DIR);
                    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
                    let questions = null;
                    if (fs.existsSync(CUSTOM_QUESTIONS_FILE)) questions = fs.readFileSync(CUSTOM_QUESTIONS_FILE);
                    deleteFolderRecursive(POSTS_DIR);
                    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
                    if (questions) fs.writeFileSync(CUSTOM_QUESTIONS_FILE, questions);
                    send({ success: true });
                }
                else if (action === 'save_font') {
                    if (!input.name || !input.data) {
                        send({ error: "Missing name or data" }, 400);
                        return;
                    }
                    const fontPath = path.join(FONTS_DIR, input.name);
                    const base64Data = input.data.replace(/^data:.*?;base64,/, "");
                    fs.writeFileSync(fontPath, Buffer.from(base64Data, 'base64'));
                    send({ success: true, path: 'fonts/' + input.name });
                }
                else if (action === 'update_system') {
                    if (!input.files || typeof input.files !== 'object') {
                        send({ error: "No files provided" }, 400);
                        return;
                    }
                    Object.keys(input.files).forEach(filePath => {
                        if (filePath.includes('..')) return; // Safety
                        const fullPath = path.join(__dirname, filePath);
                        const dir = path.dirname(fullPath);
                        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                        fs.writeFileSync(fullPath, input.files[filePath], 'utf8');
                    });
                    send({ success: true });
                }
                else {
                    // Standard Save
                    if (input.questions) fs.writeFileSync(CUSTOM_QUESTIONS_FILE, JSON.stringify(input.questions), 'utf8');
                    if (input.settings) fs.writeFileSync(SETTINGS_FILE, JSON.stringify(input.settings), 'utf8');
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

// Increase limit for uploads
ini_set('memory_limit', '256M');
ini_set('post_max_size', '30M');
ini_set('upload_max_filesize', '30M');

$postsDir = __DIR__ . '/posts';
$backupsDir = __DIR__ . '/backups';
$imgDir = __DIR__ . '/img';
$fontsDir = __DIR__ . '/fonts';

$settingsFile = __DIR__ . '/settings.json';
$tagsFile = $postsDir . '/tags.json';

// Questions logic: Default in root, Custom in posts
$defaultQuestionsFile = __DIR__ . '/questions.json';
$customQuestionsFile = $postsDir . '/questions.json';

if (!file_exists($imgDir)) mkdir($imgDir, 0755, true);
if (!file_exists($fontsDir)) mkdir($fontsDir, 0755, true);
if (!file_exists($postsDir)) mkdir($postsDir, 0755, true);
if (!file_exists($backupsDir)) mkdir($backupsDir, 0755, true);

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

if ($method === 'OPTIONS') { exit(0); }

function rmdir_recursive($dir) {
    foreach(scandir($dir) as $file) {
        if ('.' === $file || '..' === $file) continue;
        if (is_dir("$dir/$file")) rmdir_recursive("$dir/$file");
        else {
            if ($file !== 'questions.json' && $file !== 'tags.json') unlink("$dir/$file");
        }
    }
}

function copy_recursive($src, $dst) {
    $dir = opendir($src);
    @mkdir($dst);
    while(false !== ( $file = readdir($dir)) ) {
        if (( $file != '.' ) && ( $file != '..' )) {
            if ( is_dir($src . '/' . $file) ) {
                copy_recursive($src . '/' . $file,$dst . '/' . $file);
            } else {
                copy($src . '/' . $file,$dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

if (strpos($uri, '/status') !== false) {
    echo json_encode(['status' => 'online', 'type' => 'php (structured)', 'version' => phpversion()]);
    exit;
}

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
        $files = glob($postsDir . '/*/*.json');
        foreach ($files as $file) {
            if (basename($file) === 'tags.json' || basename($file) === 'questions.json') continue;
            $content = file_get_contents($file);
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                $entries = array_merge($entries, $decoded);
            }
        }
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
        $qMap = [];
        if (file_exists($defaultQuestionsFile)) {
            $content = file_get_contents($defaultQuestionsFile);
            $defQ = json_decode($content, true);
            if (is_array($defQ)) foreach($defQ as $q) $qMap[$q['id']] = $q;
        }
        if (file_exists($customQuestionsFile)) {
            $content = file_get_contents($customQuestionsFile);
            $cusQ = json_decode($content, true);
            if (is_array($cusQ)) foreach($cusQ as $q) $qMap[$q['id']] = $q;
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
        elseif ($action === 'system_backup') {
            $timestamp = date('Y-m-d-H-i-s');
            $backupFolder = $backupsDir . "/system_backup_$timestamp";
            mkdir($backupFolder, 0755, true);
            
            // Backup critical files
            foreach(['index.html', 'style.css', 'sw.js', 'manifest.json', 'package.json'] as $f) {
                if(file_exists(__DIR__ . '/' . $f)) copy(__DIR__ . '/' . $f, $backupFolder . '/' . $f);
            }
            // Backup src folder
            if(is_dir(__DIR__ . '/src')) copy_recursive(__DIR__ . '/src', $backupFolder . '/src');
            
            echo json_encode(['success' => true]);
        }
        elseif ($action === 'restore') {
            $filename = basename($json['filename']);
            $backupPath = $backupsDir . '/' . $filename;
            if (!file_exists($backupPath)) {
                http_response_code(404);
                echo json_encode(['error' => 'Backup not found']);
            } else {
                $data = json_decode(file_get_contents($backupPath), true);
                rmdir_recursive($postsDir);
                if (isset($data['settings'])) file_put_contents($settingsFile, json_encode($data['settings']));
                if (isset($data['questions'])) file_put_contents($customQuestionsFile, json_encode($data['questions']));
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
            rmdir_recursive($postsDir);
            echo json_encode(['success' => true]);
        }
        elseif ($action === 'save_font') {
            if (!isset($json['name']) || !isset($json['data'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing name or data']);
                exit;
            }
            $fontPath = $fontsDir . '/' . basename($json['name']);
            $base64Data = preg_replace('#^data:.*?;base64,#', '', $json['data']);
            file_put_contents($fontPath, base64_decode($base64Data));
            echo json_encode(['success' => true, 'path' => 'fonts/' . basename($json['name'])]);
        }
        elseif ($action === 'update_system') {
            if (!isset($json['files']) || !is_array($json['files'])) {
                http_response_code(400);
                echo json_encode(['error' => 'No files provided']);
                exit;
            }
            foreach ($json['files'] as $path => $content) {
                if (strpos($path, '..') !== false) continue;
                $fullPath = __DIR__ . '/' . $path;
                $dir = dirname($fullPath);
                if (!file_exists($dir)) mkdir($dir, 0755, true);
                file_put_contents($fullPath, $content);
            }
            echo json_encode(['success' => true]);
        }
        else {
            if (isset($json['questions'])) file_put_contents($customQuestionsFile, json_encode($json['questions']));
            if (isset($json['settings'])) file_put_contents($settingsFile, json_encode($json['settings']));
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
