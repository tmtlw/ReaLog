
import { DEFAULT_QUESTIONS } from '../constants';

export const SERVER_CODE_JSCRIPT = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BACKUPS_DIR = path.join(__dirname, 'backups');
const IMG_DIR = path.join(__dirname, 'img');
const FONTS_DIR = path.join(__dirname, 'fonts');
const USERS_FILE = path.join(__dirname, 'users.json');
const USERS_DIR = path.join(__dirname, 'users');

// Legacy Global Paths (for reference/migration)
const LEGACY_POSTS_DIR = path.join(__dirname, 'posts');

// Ensure directories exist
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR);
if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR);
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR);
if (!fs.existsSync(USERS_DIR)) fs.mkdirSync(USERS_DIR);

// Helper to get ISO week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}

const send = (data, status = 200) => {
    console.log("Content-Type: application/json; charset=utf-8");
    console.log(""); 
    console.log(JSON.stringify(data));
    process.exit(0);
};

const getAllEntries = (dir, fileList = []) => {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllEntries(filePath, fileList);
        } else {
            if (file.endsWith('.json') && !['tags.json', 'questions.json', 'habits.json', 'settings.json'].includes(file)) {
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

// ... (Recursive copy/delete helpers omitted for brevity but should be included in real deploy if needed)
// Simplified for this update logic

try {
    const uri = process.env.REQUEST_URI || '';
    const method = process.env.REQUEST_METHOD || 'GET';
    
    if (uri.includes('/status')) {
        send({ status: 'online', nodeVersion: process.version, type: 'nodejs (multi-user)' });
    }
    else if (method === 'GET') {
        const urlParams = new URLSearchParams(uri.split('?')[1]);
        const action = urlParams.get('action');

        if (action === 'get_users') {
            if (fs.existsSync(USERS_FILE)) {
                try { send({ users: JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) }); }
                catch(e) { send({ users: [] }); }
            } else {
                send({ users: [] });
            }
        }
        else if (action === 'get_user_data') {
            const userId = urlParams.get('userId');
            if (!userId) { send({ error: "Missing userId" }); return; }

            const userDir = path.join(USERS_DIR, userId);
            const userPostsDir = path.join(userDir, 'posts');

            let entries = getAllEntries(userPostsDir);
            let settings = {};
            let questions = [];
            let habits = [];

            const SETTINGS_FILE = path.join(userDir, 'settings.json');
            const QUESTIONS_FILE = path.join(userDir, 'questions.json');
            const HABITS_FILE = path.join(userDir, 'habits.json');

            if (fs.existsSync(SETTINGS_FILE)) {
                try { settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); } catch(e) {}
            }
            if (fs.existsSync(QUESTIONS_FILE)) {
                try { questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8')); } catch(e) {}
            }
            if (fs.existsSync(HABITS_FILE)) {
                try { habits = JSON.parse(fs.readFileSync(HABITS_FILE, 'utf8')); } catch(e) {}
            }
            
            send({ entries, settings, questions, habits });
        }
    }
    else if (method === 'POST') {
        let body = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => body += chunk);
        process.stdin.on('end', () => {
            try {
                const input = JSON.parse(body);
                const action = input.action;

                if (action === 'save_users') {
                    if (input.users) fs.writeFileSync(USERS_FILE, JSON.stringify(input.users), 'utf8');
                    send({ success: true });
                }
                else if (action === 'save_user_data') {
                    const userId = input.userId;
                    if (!userId) { send({ error: "Missing userId" }); return; }

                    const userDir = path.join(USERS_DIR, userId);
                    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
                    const userPostsDir = path.join(userDir, 'posts');
                    if (!fs.existsSync(userPostsDir)) fs.mkdirSync(userPostsDir, { recursive: true });

                    if (input.settings) fs.writeFileSync(path.join(userDir, 'settings.json'), JSON.stringify(input.settings), 'utf8');
                    if (input.questions) fs.writeFileSync(path.join(userDir, 'questions.json'), JSON.stringify(input.questions), 'utf8');
                    if (input.habits) fs.writeFileSync(path.join(userDir, 'habits.json'), JSON.stringify(input.habits), 'utf8');

                    if (input.entries) {
                        const grouped = {};
                        input.entries.forEach(entry => {
                            const date = new Date(entry.timestamp);
                            const year = date.getFullYear();
                            const week = getWeekNumber(date);
                            const key = \`\${year}/\${week}\`;
                            if (!grouped[key]) grouped[key] = [];
                            grouped[key].push(entry);
                        });

                        Object.keys(grouped).forEach(key => {
                            const [year, week] = key.split('/');
                            const yearDir = path.join(userPostsDir, year);
                            if (!fs.existsSync(yearDir)) fs.mkdirSync(yearDir, { recursive: true });
                            fs.writeFileSync(path.join(yearDir, \`\${week}.json\`), JSON.stringify(grouped[key]), 'utf8');
                        });
                    }
                    send({ success: true });
                }
                else {
                    send({ error: "Unknown action" });
                }
            } catch (e) {
                send({ error: "Error: " + e.message });
            }
        });
    }
} catch (err) {
    send({ error: err.message });
}`;

export const SERVER_CODE_HTACCESS_NODE = `Options +ExecCGI
AddHandler cgi-script .jscript
DirectoryIndex index.html

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /naplo/
RewriteRule ^api/(.*)$ api.jscript [L]
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
</IfModule>`;

export const SERVER_CODE_PHP = `<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$usersFile = __DIR__ . '/users.json';
$usersDir = __DIR__ . '/users';
$imgDir = __DIR__ . '/img';

if (!file_exists($usersDir)) mkdir($usersDir, 0755, true);
if (!file_exists($imgDir)) mkdir($imgDir, 0755, true);

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') exit(0);

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($_GET['action']) ? $_GET['action'] : ($input['action'] ?? '');

if ($action === 'get_users') {
    if (file_exists($usersFile)) echo file_get_contents($usersFile);
    else echo json_encode(['users' => []]);
    exit;
}

if ($action === 'save_users') {
    if (isset($input['users'])) file_put_contents($usersFile, json_encode($input['users']));
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'get_user_data') {
    $userId = $_GET['userId'] ?? '';
    if (!$userId) { echo json_encode(['error' => 'Missing userId']); exit; }

    $userDir = $usersDir . '/' . $userId;
    $entries = [];
    $settings = [];
    $questions = [];
    $habits = [];

    // Load Entries
    $postsDir = $userDir . '/posts';
    if (file_exists($postsDir)) {
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($postsDir));
        foreach ($files as $file) {
            if ($file->isDir()) continue;
            if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
                $c = json_decode(file_get_contents($file), true);
                if (is_array($c)) $entries = array_merge($entries, $c);
            }
        }
    }

    if (file_exists($userDir . '/settings.json')) $settings = json_decode(file_get_contents($userDir . '/settings.json'), true);
    if (file_exists($userDir . '/questions.json')) $questions = json_decode(file_get_contents($userDir . '/questions.json'), true);
    if (file_exists($userDir . '/habits.json')) $habits = json_decode(file_get_contents($userDir . '/habits.json'), true);

    echo json_encode(['entries' => $entries, 'settings' => $settings, 'questions' => $questions, 'habits' => $habits]);
    exit;
}

if ($action === 'save_user_data') {
    $userId = $input['userId'] ?? '';
    if (!$userId) { echo json_encode(['error' => 'Missing userId']); exit; }

    $userDir = $usersDir . '/' . $userId;
    if (!file_exists($userDir)) mkdir($userDir, 0755, true);

    if (isset($input['settings'])) file_put_contents($userDir . '/settings.json', json_encode($input['settings']));
    if (isset($input['questions'])) file_put_contents($userDir . '/questions.json', json_encode($input['questions']));
    if (isset($input['habits'])) file_put_contents($userDir . '/habits.json', json_encode($input['habits']));

    if (isset($input['entries'])) {
        $postsDir = $userDir . '/posts';
        if (!file_exists($postsDir)) mkdir($postsDir, 0755, true);

        $grouped = [];
        foreach ($input['entries'] as $entry) {
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
    exit;
}

echo json_encode(['status' => 'online', 'type' => 'php (multi-user)']);
?>`;

export const SERVER_CODE_HTACCESS_PHP = `<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /naplo/
RewriteRule ^api/(.*)$ api.php [L,QSA]
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
</IfModule>`;
