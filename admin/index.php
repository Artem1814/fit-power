<?php
require 'config.php';

/* ───────── 1. Авторизация ───────── */
if (!auth()) {
    include BASE_DIR.'/views/login.php';
    exit;
}

/* ───────── 2. Обработка кнопки «Открыть» ───────── */
if (isset($_POST['pagename'])) {
    $_SESSION['page'] = trim($_POST['pagename']);
    $m = isset($_POST['current_mode']) ? intval($_POST['current_mode']) : -1;
    if ($m === 1) $m = 7;
    if ($m === 3) $m = 0;
    header('Location: ?mode='.$m);
    exit;
}

/* ───────── 3. Текущая страница ───── */
$pageRel = $_SESSION['page'] ?? 'index.html';
$pageAbs = absPath($pageRel) ?: absPath('index.html');
$pageRel = safeRel($pageAbs);
$_SESSION['page'] = $pageRel;
$html    = file_get_contents($pageAbs);
$pageDir = dirname($pageAbs);

/* ───────── 4. Режим (?mode) ─────── */
$mode = isset($_GET['mode']) ? intval($_GET['mode']) : -1;

/* ───────── 5. Роутинг ───────────── */
switch ($mode) {

/* === Т Е К С Т Ы ====================================================== */
case 0:
    preg_match_all('/>([^<>]+)</u', $html, $m);
    $list = array_values(array_filter(array_map('trim', $m[1])));
    render('text', compact('list'));
    break;

case 3:
    $id = (int)($_GET['id'] ?? 0);
    preg_match_all('/>([^<>]+)</u', $html, $m);
    $text = trim($m[1][$id] ?? '');
    render('text_edit', compact('id', 'text'));
    break;

case 4:
    if (isset($_POST['id'], $_POST['newtext'])) {
        $id  = (int)$_POST['id'];
        $new = $_POST['newtext'];
        preg_match_all('/>([^<>]+)</u', $html, $m, PREG_OFFSET_CAPTURE);
        if (isset($m[1][$id])) {
            [$old, $pos] = $m[1][$id];
            backup($pageAbs);
            file_put_contents($pageAbs, substr_replace($html, $new, $pos, strlen($old)));
        }
    }
    header('Location: ?mode=0');
    break;

/* === К А Р Т И Н К И ================================================== */
case 7:
    render('images', compact('html', 'pageDir'));
    break;

case 1:
    $img = $_GET['img'] ?? '';
    render('image_one', compact('img', 'pageDir'));
    break;

case 2:
    if (isset($_GET['img']) && isset($_FILES['file'])) {
        $rel = ltrim($_GET['img'], '/\\');
        $abs = absPath($rel) ?: realpath($pageDir.'/'.$rel);
        if ($abs && filesize($_FILES['file']['tmp_name']) <= MAX_MB*1048576) {
            backup($abs);
            move_uploaded_file($_FILES['file']['tmp_name'], $abs);
        }
    }
    header('Location: ?mode=7');
    break;

/* === H T M L ========================================================== */
case 5:
    render('html', compact('html'));
    break;

case 6:
    if (isset($_POST['code'])) {
        backup($pageAbs);
        file_put_contents($pageAbs, $_POST['code']);
    }
    header('Location: ?mode=5');
    break;

/* === М Е Д И А ======================================================== */
case 20:
    render('media');
    break;

case 21:
    foreach ($_FILES['files']['name'] as $i => $name) {
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($ext, IMG_EXT, true)) continue;
        move_uploaded_file(
            $_FILES['files']['tmp_name'][$i],
            IMG_DIR.'/'.$name
        );
    }
    echo 'ok';
    exit;

/* === К О М М Е Н Т А Р И И =========================================== */
case 30:                             // список
    $json     = file_get_contents(EDGE_COMMENTS_URL.'/list');
    $data     = json_decode($json, true);
    $comments = $data['comments'] ?? [];
    render('comments', compact('comments'));
    break;

case 31:   // удаление (если когда‑то понадобится ссылка, не AJAX)
    if (!empty($_GET['id'])) {
        $cid = $_GET['id'];   // UUID оставить строкой!

        $ch = curl_init(EDGE_COMMENTS_URL.'/delete?comment_id='.$cid);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode(['comment_id' => $cid])
        ]);
        curl_exec($ch);
        curl_close($ch);
    }
    header('Location: ?mode=30');
    break;
/* === Т Р Е Н Е Р Ы ==================================================== */
/* === Т Р Е Н Е Р Ы ==================================================== */
case 40:  // список
    $curl = curl_init(SUPABASE_URL.'/rest/v1/users?role=eq.trainer'
                      .'&select=id,email,first_name,last_name,trainer_key');
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'apikey: '.SERVICE_ROLE,
            'Authorization: Bearer '.SERVICE_ROLE
        ]
    ]);
    $trainers = json_decode(curl_exec($curl), true) ?? [];
    curl_close($curl);
    render('trainers', compact('trainers'));
    break;

case 41:  // форма
    render('trainer_add'); break;

case 42:  // приём формы
    if(isset($_POST['email'], $_POST['pass'])){
        $body = json_encode([
          'email'         => trim($_POST['email']),
          'password_hash' => password_hash($_POST['pass'], PASSWORD_BCRYPT), // PHP‑хэш
          'role'          => 'trainer',
          'first_name'    => $_POST['fname'] ?? '',
          'last_name'     => $_POST['lname'] ?? '',
          'is_verified'   => true,
          'trainer_key'   => bin2hex(random_bytes(10))   // 20‑символьный
        ]);

        $c = curl_init(SUPABASE_URL.'/rest/v1/users');
        curl_setopt_array($c,[
          CURLOPT_RETURNTRANSFER=>true,
          CURLOPT_POST=>true,
          CURLOPT_HTTPHEADER=>[
            'apikey: '.SERVICE_ROLE,
            'Authorization: Bearer '.SERVICE_ROLE,
            'Content-Type: application/json',
            'Prefer: return=representation'
          ],
          CURLOPT_POSTFIELDS=>$body
        ]);
        curl_exec($c); curl_close($c);
    }
    header('Location:?mode=40'); break;

case 43:  // удаление
    if(isset($_GET['id'])){
        $id = $_GET['id'];
        $c = curl_init(SUPABASE_URL.'/rest/v1/users?id=eq.' . urlencode($id));
        curl_setopt_array($c,[
          CURLOPT_RETURNTRANSFER=>true,
          CURLOPT_CUSTOMREQUEST=>'DELETE',
          CURLOPT_HTTPHEADER=>[
            'apikey: '.SERVICE_ROLE,
            'Authorization: Bearer '.SERVICE_ROLE
          ]
        ]);
        curl_exec($c); curl_close($c);
    }
    header('Location:?mode=40'); break;

/* === С П Р А В К А ==================================================== */
default:
    render('help');
}
