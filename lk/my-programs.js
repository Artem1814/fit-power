// my-programs.js

const logoutBtn    = document.getElementById('logout-btn');
const notification = document.getElementById('notification');
const programsList = document.getElementById('programs-list');

// user_id
const userId = localStorage.getItem('user_id');
if(!userId){
  window.location.href='login.html';
}

// Кнопка «Выйти»
logoutBtn.onclick= ()=>{
  localStorage.removeItem('user_id');
localStorage.removeItem('role');
  window.location.href='login.html';
};

// ВАЖНО: замените "your-project-id" на реальный slug проекта 
// (Например: "abcxyzcompany.supabase.co")
const BASE_URL= 'https://shvzzrccmuquidejwojh.supabase.co/functions/v1/my-programs';

// При загрузке
loadPrograms();

async function loadPrograms(){
  programsList.textContent='Загрузка...';

  try {
    // GET /my-programs/list?user_id=...
    const res= await fetch(`${BASE_URL}/list?user_id=${userId}`);
    const data= await res.json();

    if(!res.ok || data.error){
      showNotification(data.error||'Ошибка при загрузке');
      programsList.textContent='Ошибка при загрузке';
      return;
    }
    renderPrograms(data.programs||[]);
  } catch(err){
    showNotification('Ошибка сети: '+ err.message);
    programsList.textContent='Ошибка сети';
  }
}

function renderPrograms(programs){
  if(!programs.length){
    programsList.textContent='Нет назначенных программ.';
    return;
  }
  let html='';
  programs.forEach(p=>{
    const dateStr= new Date(p.assigned_at).toLocaleString('ru-RU');
    const doneStr= p.completed ? 'Да':'Нет';
    // Кнопка «Выполнено», только если p.completed=false
    let completeBtnHtml='';
    if(!p.completed){
      completeBtnHtml= `<button class="complete-btn">Выполнено</button>`;
    }

    html+= `
      <div class="program-card" data-id="${p.id}">
        ${completeBtnHtml}
        <div class="program-title">${p.title}</div>
        ${
          p.description
            ? `<div class="program-desc">${p.description}</div>`
            : ''
        }
        <div class="program-info">
          <span class="info-label">Ссылка:</span> ${
            p.link
              ? `<a href="${p.link}" target="_blank">${p.link}</a>`
              : '(нет ссылки)'
          }<br/>
          <span class="info-label">Выполнено:</span> ${doneStr}<br/>
          <span class="info-label">Назначено:</span> ${dateStr}
        </div>
      </div>
    `;
  });
  programsList.innerHTML= html;

  // Навешиваем обработчик на кнопки .complete-btn
  document.querySelectorAll('.complete-btn').forEach(btn=>{
    btn.onclick= ()=>{
      const card= btn.closest('.program-card');
      const recId= card.dataset.id;
      markCompleted(recId);
    };
  });
}

async function markCompleted(recordId){
  if(!confirm('Отметить эту программу выполненной?')) return;

  try {
    // PUT /my-programs/complete
    const res= await fetch(`${BASE_URL}/complete`, {
      method:'PUT',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        user_id: userId,
        record_id: recordId
      })
    });
    const data= await res.json();

    if(!res.ok || data.error){
      showNotification(data.error||'Ошибка при обновлении');
    } else if(data.success){
      showNotification('Программа отмечена выполненной!');
      loadPrograms(); // перезагрузка
    }
  } catch(err){
    showNotification('Ошибка сети: '+ err.message);
  }
}

function showNotification(msg){
  notification.textContent= msg;
  notification.classList.remove('hidden');
  setTimeout(()=> notification.classList.add('hidden'),3000);
}
