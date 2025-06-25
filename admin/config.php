<?php
/* ═══════════  КОНСТАНТЫ  ═══════════ */
define('BASE_DIR', __DIR__);
define('ROOT_DIR', dirname(BASE_DIR));        // корень сайта
define('IMG_DIR',  ROOT_DIR . '/img');
define('BACKUP_DIR', BASE_DIR . '/backup');

define('PASS_HASH', '$2y$12$f3YEdnkkBnGlXfxfcQE7hOJ.8RzrQ9lXOjwZ0higm9lOQE04vzNHa'); // fit‑power

const TXT_EXT = ['html','htm'];
const IMG_EXT = ['jpg','jpeg','png','gif','webp'];
const MAX_MB  = 5;

/* ═══════════  ФУНКЦИИ  ═══════════ */
function absPath(string $rel): ?string {
    $full = realpath(ROOT_DIR . '/' . ltrim($rel,'/\\'));
    return ($full && str_starts_with($full, ROOT_DIR)) ? $full : null;
}
function safeRel(string $abs): string {
    return ltrim(str_replace(ROOT_DIR, '', $abs), '/\\');
}
function listFiles(array $ext): array {
    $out=[]; $it=new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(ROOT_DIR, FilesystemIterator::SKIP_DOTS)
    );
    foreach($it as $f)
       if($f->isFile() && in_array(strtolower($f->getExtension()),$ext,true))
          $out[] = safeRel($f->getPathname());
    sort($out,SORT_NATURAL); return $out;
}
function backup(string $file): void {
    if(!is_dir(BACKUP_DIR)) mkdir(BACKUP_DIR,0775,true);
    copy($file, BACKUP_DIR.'/'.date('Y-m-d-H-i-s_').basename($file));
}

/* ═══════  РЕНДЕР  (общий layout) ═══════ */
function render(string $view, array $vars = []): void {
    global $mode;                     // чтобы передать текущий режим
    $vars['mode'] = $mode;
    extract($vars);
    ob_start();
    include BASE_DIR."/views/$view.php";
    $content = ob_get_clean();
    include BASE_DIR.'/views/layout.php';
}

/* ═══════   АВТОРИЗАЦИЯ  ═══════ */
function auth(): bool {
    session_start();
    if (isset($_SESSION['adm']) && $_SESSION['adm'] === PASS_HASH) return true;

    if ($_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['pass']) &&
        password_verify($_POST['pass'], PASS_HASH)) {
        $_SESSION['adm'] = PASS_HASH;
        return true;
    }
    return false;
}
/* … существующий код … */
define('EDGE_COMMENTS_URL', 'https://shvzzrccmuquidejwojh.supabase.co/functions/v1/comments'); // базовый URL
define('SUPABASE_URL',  'https://shvzzrccmuquidejwojh.supabase.co');           // если ещё не было
define('SERVICE_ROLE',  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNodnp6cmNjbXVxdWlkZWp3b2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTg5ODcsImV4cCI6MjA2MzU5NDk4N30.0ZF3zrw97_kd8mZyK2JcfcEKoAI0k5MyP1XqM86F8Fs');           // ключ SRK
