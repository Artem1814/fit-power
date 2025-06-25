// trainer-assign.js

const logoutBtn    = document.getElementById('logout-btn');
const notification = document.getElementById('notification');

const traineeSelect= document.getElementById('trainee-select');
const programSelect= document.getElementById('program-select');
const assignBtn    = document.getElementById('assign-btn');
const assignedList = document.getElementById('assigned-list');

const userId   = localStorage.getItem('user_id');
const userRole = localStorage.getItem('role');

if(!userId || userRole!=='trainer'){
  window.location.href='login.html';
}

logoutBtn.onclick= ()=>{
  localStorage.removeItem('user_id');
  localStorage.removeItem('role');
  window.location.href='login.html';
};

const BASE_URL= 'https://shvzzrccmuquidejwojh.supabase.co/functions/v1/trainer-assign';

loadData();

async function loadData(){
  assignedList.textContent='Загрузка...';

  try {
    // Подопечные
    const podRes= await fetch(`${BASE_URL}/podopichnye?trainer_id=${userId}`);
    const podData= await podRes.json();
    if(!podRes.ok || podData.error){
      showNotification(podData.error||'Ошибка при загрузке подопечных');
      traineeSelect.innerHTML= '<option>(нет подопечных)</option>';
    } else {
      fillTrainees(podData.trainees||[]);
    }

    // Программы
    const progRes= await fetch(`${BASE_URL}/programs`);
    const progData= await progRes.json();
    if(!progRes.ok || progData.error){
      showNotification(progData.error||'Ошибка при загрузке программ');
      programSelect.innerHTML= '<option>(нет программ)</option>';
    } else {
      fillPrograms(progData.programs||[]);
    }

    // Назначенные
    const asRes= await fetch(`${BASE_URL}/assigned?trainer_id=${userId}`);
    const asData= await asRes.json();
    if(!asRes.ok || asData.error){
      showNotification(asData.error||'Ошибка при загрузке назначенных программ');
      assignedList.textContent='Ошибка при загрузке';
    } else {
      renderAssigned(asData.assigned||[]);
    }

  } catch(err){
    showNotification('Ошибка сети: '+ err.message);
    assignedList.textContent='Ошибка сети';
  }
}

function fillTrainees(trainees){
  if(!trainees.length){
    traineeSelect.innerHTML= '<option value="">(Нет подопечных)</option>';
    return;
  }
  let html='';
  trainees.forEach(t=>{
    const fName= `${t.first_name||''} ${t.last_name||''}`.trim() || t.email;
    html+= `<option value="${t.id}">${fName}</option>`;
  });
  traineeSelect.innerHTML= html;
}

function fillPrograms(programs){
  if(!programs.length){
    programSelect.innerHTML= '<option value="">(Нет программ)</option>';
    return;
  }
  let html='';
  programs.forEach(p=>{
    html+= `<option value="${p.id}">${p.title}</option>`;
  });
  programSelect.innerHTML= html;
}

assignBtn.onclick= async ()=>{
  const traineeId= traineeSelect.value;
  const progId= programSelect.value;

  if(!traineeId){
    showNotification('Нет выбранного подопечного!');
    return;
  }
  if(!progId){
    showNotification('Нет выбранной программы!');
    return;
  }

  try {
    const res= await fetch(`${BASE_URL}/assign`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        trainer_id: userId,
        user_id: traineeId,
        program_id: progId
      })
    });
    const data= await res.json();
    if(!res.ok || data.error){
      showNotification(data.error||'Ошибка при назначении');
    } else if(data.success){
      showNotification('Программа назначена!');
      loadData();
    }
  } catch(err){
    showNotification('Ошибка сети: ' + err.message);
  }
};

function renderAssigned(list){
  if(!list.length){
    assignedList.textContent='Пока нет назначенных программ.';
    return;
  }
  let html='';
  list.forEach(a=>{
    const userName= a.users 
      ? `${a.users.first_name||''} ${a.users.last_name||''}`.trim()
      : a.user_id;
    const dateStr= new Date(a.assigned_at).toLocaleString('ru-RU');
    const doneStr= a.completed ? 'Да':'Нет';

    html+= `
      <div class="assigned-card" data-id="${a.id}">
        <button class="assigned-delete-btn">Удалить</button>
        <div class="assigned-title">${a.title}</div>
        ${
          a.description 
            ? `<div class="assigned-desc">${a.description}</div>`
            : ''
        }
        <div class="assigned-info">
          <span class="info-label">Подопечный:</span> ${userName}<br/>
          <span class="info-label">Ссылка:</span> ${
            a.link
              ? `<a href="${a.link}" target="_blank">${a.link}</a>`
              : '(нет ссылки)'
          }<br/>
          <span class="info-label">Выполнено:</span> ${doneStr}<br/>
          <span class="info-label">Назначено:</span> ${dateStr}
        </div>
      </div>
    `;
  });
  assignedList.innerHTML= html;

  document.querySelectorAll('.assigned-delete-btn').forEach(btn=>{
    btn.onclick=()=>{
      const card= btn.closest('.assigned-card');
      const recId= card.dataset.id;
      deleteAssigned(recId);
    };
  });
}

async function deleteAssigned(recId){
  if(!confirm('Удалить назначенную программу?')) return;

  try {
    const url= `${BASE_URL}/assigned?id=${recId}&trainer_id=${userId}`;
    const res= await fetch(url, { method:'DELETE' });
    const data= await res.json();

    if(!res.ok || data.error){
      showNotification(data.error||'Ошибка при удалении');
    } else if(data.success){
      showNotification('Успешно удалено');
      loadData();
    }
  } catch(err){
    showNotification('Ошибка сети: '+ err.message);
  }
}

function showNotification(msg){
  notification.textContent= msg;
  notification.classList.remove('hidden');
  setTimeout(()=> notification.classList.add('hidden'), 3000);
}
