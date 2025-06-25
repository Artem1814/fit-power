<?php
function cur(int $m): string {
    $current = $GLOBALS['mode'] ?? -1;
    if ($current === 1) $current = 7;
    if ($current === 3) $current = 0;
    return $current === $m ? ' current' : '';
}
?>
<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="/img/fav.png">
<title>Админ Fit‑Power</title>

<link rel="stylesheet" href="/admin/assets/css/admin.css">
<style>.btn,.btn-sec,#top select{cursor:pointer}</style>
</head>
<body>

<header id="top">
  <button id="themeBtn" class="btn-sec">...</button>

  <form method="post" style="display:inline-block;margin-left:6px">
    <select name="pagename">
      <?php foreach (listFiles(TXT_EXT) as $f):
              $sel = ($f === ($_SESSION['page'] ?? '')) ? 'selected' : ''; ?>
        <option <?=$sel?>><?=$f?></option>
      <?php endforeach ?>
    </select>
    <input type="hidden" name="current_mode" value="<?=$mode?>">
    <button class="btn-sec">Открыть</button>
  </form>

  <a class="btn<?=cur(0)?>"  href="?mode=0">Текст</a>
  <a class="btn<?=cur(7)?>"  href="?mode=7">Картинки</a>
  <a class="btn<?=cur(5)?>"  href="?mode=5">HTML</a>
  <a class="btn<?=cur(20)?>" href="?mode=20">Медиа</a>
  <a class="btn<?=cur(30)?>" href="?mode=30">Комментарии</a>
  <a class="btn<?=cur(40)?>" href="?mode=40">Тренеры</a>
  <a class="btn<?=cur(-1)?>" href="?">Помощь</a>
  <a class="btn"            href="/" target="_blank">Сайт</a>
</header>

<?= $content ?>

<script src="/admin/assets/js/admin.js"></script>
</body>
</html>
