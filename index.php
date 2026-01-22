<?php
// index.php
require_once 'includes/functions.php';

// Handle Logout
if (isset($_POST['action']) && $_POST['action'] === 'logout') {
    session_destroy();
    header('Location: index.php');
    exit;
}

// Handle Login POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['page']) && $_GET['page'] === 'login') {
    $password = $_POST['password'] ?? '';
    if (verify_password($password)) {
        $_SESSION['user_logged_in'] = true;
        header('Location: index.php');
        exit;
    } else {
        $error = t('app.wrong_password');
    }
}

// Handle Actions (Save/Delete)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    check_auth(); // Biztonsági ellenőrzés

    $entries = load_data(ENTRIES_FILE);

    if ($_POST['action'] === 'save_entry') {
        $id = $_POST['id'];

        // Responses feldolgozása
        $responses = [];
        if (isset($_POST['response']) && is_array($_POST['response'])) {
            foreach ($_POST['response'] as $qid => $val) {
                if (!empty(trim($val))) {
                    $responses[$qid] = $val;
                }
            }
        }

        // Habit Values feldolgozása
        $habitValues = [];
        if (isset($_POST['habit']) && is_array($_POST['habit'])) {
            foreach ($_POST['habit'] as $hid => $val) {
                // Checkboxnál 'on' jön, ha be van pipálva, value-nál szám/szöveg
                if ($val === 'on') $habitValues[$hid] = true;
                else $habitValues[$hid] = $val; // Pl. számérték
            }
        }

        $new_entry = [
            'id' => $id,
            'title' => $_POST['title'] ?? '',
            'dateLabel' => $_POST['dateLabel'] ?? date('Y-m-d'),
            'timestamp' => (int)($_POST['timestamp'] ?? time() * 1000),
            'category' => $_POST['category'] ?? 'DAILY',
            'mood' => $_POST['mood'] ?? null,
            'freeTextContent' => $_POST['freeTextContent'] ?? '',
            'entryMode' => $_POST['entryMode'] ?? 'free', // structured vagy free
            'tags' => array_map('trim', explode(',', $_POST['tags'] ?? '')),
            'responses' => $responses,
            'habitValues' => $habitValues,
            'isTrashed' => false
        ];

        // Frissítés vagy Hozzáadás
        $found = false;
        foreach ($entries as &$e) {
            if ($e['id'] === $id) {
                $e = array_merge($e, $new_entry);
                $found = true;
                break;
            }
        }
        if (!$found) {
            $entries[] = $new_entry;
        }

        save_data(ENTRIES_FILE, $entries);
        header('Location: index.php?page=entries');
        exit;
    }

    if ($_POST['action'] === 'delete_entry') {
        $id = $_POST['id'];
        foreach ($entries as &$e) {
            if ($e['id'] === $id) {
                $e['isTrashed'] = true; // Soft delete
                break;
            }
        }
        save_data(ENTRIES_FILE, $entries);
        header('Location: index.php?page=entries');
        exit;
    }

    // --- KÉRDÉSEK KEZELÉSE ---
    if ($_POST['action'] === 'save_question') {
        $questions = load_data(QUESTIONS_FILE);
        $id = $_POST['id'] ?: uniqid('q_');
        $new_q = [
            'id' => $id,
            'text' => $_POST['text'],
            'category' => $_POST['category'] ?? 'DAILY',
            'isActive' => isset($_POST['isActive'])
        ];

        $found = false;
        foreach ($questions as &$q) {
            if ($q['id'] === $id) {
                $q = array_merge($q, $new_q);
                $found = true;
                break;
            }
        }
        if (!$found) $questions[] = $new_q;

        save_data(QUESTIONS_FILE, $questions);
        header('Location: index.php?page=questions');
        exit;
    }

    if ($_POST['action'] === 'delete_question') {
        $questions = load_data(QUESTIONS_FILE);
        $questions = array_filter($questions, function($q) {
            return $q['id'] !== $_POST['id'];
        });
        save_data(QUESTIONS_FILE, array_values($questions));
        header('Location: index.php?page=questions');
        exit;
    }

    if ($_POST['action'] === 'toggle_question') {
        $questions = load_data(QUESTIONS_FILE);
        foreach ($questions as &$q) {
            if ($q['id'] === $_POST['id']) {
                $q['isActive'] = !$q['isActive'];
                break;
            }
        }
        save_data(QUESTIONS_FILE, $questions);
        header('Location: index.php?page=questions');
        exit;
    }

    // --- SZOKÁSOK KEZELÉSE ---
    if ($_POST['action'] === 'save_habit') {
        $habits = load_data(HABITS_FILE);
        $id = $_POST['id'] ?: uniqid('h_');
        $new_h = [
            'id' => $id,
            'title' => $_POST['title'],
            'type' => $_POST['type'] ?? 'boolean',
            'icon' => $_POST['icon'] ?? 'activity',
            'unit' => $_POST['unit'] ?? '',
            'isActive' => isset($_POST['isActive'])
        ];

        $found = false;
        foreach ($habits as &$h) {
            if ($h['id'] === $id) {
                $h = array_merge($h, $new_h);
                $found = true;
                break;
            }
        }
        if (!$found) $habits[] = $new_h;

        save_data(HABITS_FILE, $habits);
        header('Location: index.php?page=habits');
        exit;
    }

    if ($_POST['action'] === 'delete_habit') {
        $habits = load_data(HABITS_FILE);
        $habits = array_filter($habits, function($h) {
            return $h['id'] !== $_POST['id'];
        });
        save_data(HABITS_FILE, array_values($habits));
        header('Location: index.php?page=habits');
        exit;
    }

    if ($_POST['action'] === 'toggle_habit') {
        $habits = load_data(HABITS_FILE);
        foreach ($habits as &$h) {
            if ($h['id'] === $_POST['id']) {
                $h['isActive'] = !$h['isActive'];
                break;
            }
        }
        save_data(HABITS_FILE, $habits);
        header('Location: index.php?page=habits');
        exit;
    }

    // --- BEÁLLÍTÁSOK MENTÉSE ---
    if ($_POST['action'] === 'save_settings') {
        $settings = load_data(SETTINGS_FILE);
        $settings['userName'] = $_POST['userName'] ?? $settings['userName'];

        // Ha változik a jelszó
        if (!empty($_POST['adminPassword'])) {
            $settings['adminPassword'] = $_POST['adminPassword'];
        }

        save_data(SETTINGS_FILE, $settings);

        // Ha jelszó változott, kiléptethetnénk, de most maradjunk egyszerűen
        header('Location: index.php?page=settings&tab=account');
        exit;
    }
}

// Routing
$page = $_GET['page'] ?? 'dashboard';

// Ha nincs bejelentkezve, kényszerítsük a login oldalra
if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true) {
    $page = 'login';
}

// Header
require_once 'includes/header.php';

// Navbar (csak ha be vagyunk lépve)
if ($page !== 'login') {
    require_once 'includes/navbar.php';
}

// View Controller
switch ($page) {
    case 'login':
        require_once 'views/login.php';
        break;
    case 'dashboard':
        require_once 'views/dashboard.php';
        break;
    case 'entries':
        require_once 'views/entry_list.php';
        break;
    case 'editor':
        require_once 'views/entry_editor.php';
        break;
    case 'calendar':
        require_once 'views/calendar.php';
        break;
    case 'atlas':
        require_once 'views/atlas.php';
        break;
    case 'questions':
        require_once 'views/questions.php';
        break;
    case 'habits':
        require_once 'views/habits.php';
        break;
    case 'settings':
        require_once 'views/settings.php';
        break;
    default:
        echo '<div class="p-8 text-center text-red-500">404 - Az oldal nem található</div>';
        break;
}

// Footer
require_once 'includes/footer.php';
?>
