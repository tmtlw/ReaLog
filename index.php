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
        $new_entry = [
            'id' => $id,
            'title' => $_POST['title'] ?? '',
            'dateLabel' => $_POST['dateLabel'] ?? date('Y-m-d'),
            'timestamp' => (int)($_POST['timestamp'] ?? time() * 1000),
            'category' => $_POST['category'] ?? 'DAILY',
            'mood' => $_POST['mood'] ?? null,
            'freeTextContent' => $_POST['freeTextContent'] ?? '',
            'entryMode' => 'free',
            'tags' => array_map('trim', explode(',', $_POST['tags'] ?? '')),
            'responses' => [], // Egyszerűsített
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
    default:
        echo '<div class="p-8 text-center text-red-500">404 - Az oldal nem található</div>';
        break;
}

// Footer
require_once 'includes/footer.php';
?>
