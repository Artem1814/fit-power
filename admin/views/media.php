<h2>Медиабиблиотека</h2>
<div class="drop-zone" id="dz">Перетащите картинки сюда или кликните</div><hr>
<?php foreach (scandir(IMG_DIR) as $f):
        $ext=strtolower(pathinfo($f,PATHINFO_EXTENSION));
        if(in_array($ext, IMG_EXT)): ?>
  <div class="kartinka">
    <img src="/img/<?=$f?>?<?=rand()?>" height="110"><br>img/<?=$f?>
  </div>
<?php endif; endforeach ?>

<script>
const dz=document.getElementById('dz'), up=document.createElement('input');
up.type='file';up.accept='image/*';up.multiple=true;
dz.onclick=()=>up.click();
dz.ondragover=e=>{e.preventDefault();dz.classList.add('drag')};
dz.ondragleave=()=>dz.classList.remove('drag');
dz.ondrop=e=>{e.preventDefault();dz.classList.remove('drag');upload(e.dataTransfer.files)};
up.onchange=e=>upload(e.target.files);

function upload(files){
  const fd=new FormData();[...files].forEach(f=>fd.append('files[]',f));
  fetch('?mode=21',{method:'POST',body:fd}).then(()=>location.reload());
}
</script>
