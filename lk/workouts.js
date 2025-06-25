/** workouts.js
 * Логика раздела «Мои тренировки».
 */

const BASE_URL = 'https://shvzzrccmuquidejwojh.supabase.co/functions/v1';

// Ссылки на элементы
const logoutBtn      = document.getElementById('logout-btn');
const notification   = document.getElementById('notification');
const workoutsListDiv= document.getElementById('workouts-list');

// Проверка user_id
const userId = localStorage.getItem('user_id');
if (!userId) {
  window.location.href = 'login.html'; // Или своя страница авторизации
}

// "Выйти"
logoutBtn.onclick = () => {
  localStorage.removeItem('user_id');
 localStorage.removeItem('role');
  window.location.href = 'login.html';
};

// При загрузке — сразу подгружаем список
loadWorkouts();

async function loadWorkouts(){
  workoutsListDiv.textContent = 'Загрузка...';
  try {
    // ВАЖНО: используем backticks
    const res = await fetch(`${BASE_URL}/workouts/list?userId=${userId}`);
    const data= await res.json();

    if (!res.ok) {
      workoutsListDiv.innerHTML = `<p style="color:red;">${data.error || 'Ошибка при загрузке.'}</p>`;
    } else {
      renderWorkouts(data.workouts || []);
    }
  } catch(err) {
    workoutsListDiv.innerHTML = `<p style="color:red;">Ошибка сети: ${err.message}</p>`;
  }
}

function renderWorkouts(workouts) {
  if(!workouts.length) {
    workoutsListDiv.innerHTML = '<p>Нет записей о тренировках.</p>';
    return;
  }

  // Генерируем HTML карточек
  const html = workouts.map(w => `
    <div class="workout-card" data-id="${w.id}">
      <div class="date">Дата: ${w.date}</div>
      <div class="type">Тип: ${w.type}</div>
      <div class="duration">Длительность: ${w.duration} мин</div>
      ${w.notes ? `<div class="notes">Заметки: ${w.notes}</div>` : ''}

      <button class="edit-btn">Изменить</button>
      <button class="delete-btn">Удалить</button>

      <form class="edit-form" style="display:none;">
        <div class="edit-group">
          <label>Дата:</label>
          <input type="date" class="edit-date" value="${w.date}" />
        </div>
        <div class="edit-group">
          <label>Тип:</label>
          <input type="text" class="edit-type" value="${w.type}" />
        </div>
        <div class="edit-group">
          <label>Длительность (мин):</label>
          <input type="number" class="edit-duration" value="${w.duration}" />
        </div>
        <div class="edit-group">
          <label>Заметки:</label>
          <input type="text" class="edit-notes" value="${w.notes || ''}" />
        </div>
        <button type="button" class="save-edit-btn">Сохранить</button>
      </form>
    </div>
  `).join('');

  workoutsListDiv.innerHTML = html;

  // «Изменить» — показ/скрытие формы
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const card = btn.closest('.workout-card');
      const form = card.querySelector('.edit-form');
      form.style.display = (form.style.display === 'none') ? 'block' : 'none';
    };
  });

  // «Сохранить»
  document.querySelectorAll('.save-edit-btn').forEach(sBtn => {
    sBtn.onclick = () => {
      const card= sBtn.closest('.workout-card');
      const workoutId= card.dataset.id;

      const dateValue= card.querySelector('.edit-date').value.trim();
      const typeValue= card.querySelector('.edit-type').value.trim();
      const durStr   = card.querySelector('.edit-duration').value.trim();
      const notesVal = card.querySelector('.edit-notes').value.trim();

      if(!dateValue || !typeValue || !durStr){
        showNotification('Ошибка: заполните дату, тип, длительность!');
        return;
      }
      const ndur= parseInt(durStr, 10);
      if(isNaN(ndur) || ndur<=0){
        showNotification('Ошибка: длительность >0!');
        return;
      }
      if(notesVal.length>500){
        showNotification('Ошибка: заметки не более 500 символов!');
        return;
      }

      // Будущее?
      const today=new Date(); today.setHours(0,0,0,0);
      const newDateObj=new Date(dateValue+'T00:00:00');
      if(newDateObj.getTime() > today.getTime()){
        showNotification('Ошибка: дата не может быть в будущем!');
        return;
      }

      editWorkout(workoutId, dateValue, typeValue, ndur, notesVal);
    };
  });

  // «Удалить»
  document.querySelectorAll('.delete-btn').forEach(dBtn => {
    dBtn.onclick = async() => {
      const card= dBtn.closest('.workout-card');
      const workoutId= card.dataset.id;

      try {
        const res= await fetch(`${BASE_URL}/workouts/delete?userId=${userId}&workoutId=${workoutId}`, {
          method:'DELETE'
        });
        const data= await res.json();
        if(!res.ok){
          showNotification(data.error || 'Ошибка при удалении!');
        } else {
          showNotification('Тренировка успешно удалена!');
          loadWorkouts();
        }
      } catch(err){
        showNotification('Ошибка сети:'+ err.message);
      }
    };
  });
}

async function editWorkout(id, date, type, duration, notes) {
  try {
    const res= await fetch(`${BASE_URL}/workouts/edit`, {
      method:'PUT',
      headers:{ 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        workoutId:id,
        date,
        type,
        duration,
        notes
      })
    });
    const data= await res.json();
    if(!res.ok){
      showNotification(data.error||'Ошибка при редактировании!');
    } else {
      showNotification('Тренировка успешно изменена!');
      loadWorkouts();
    }
  } catch(err){
    showNotification('Ошибка сети:'+ err.message);
  }
}

function showNotification(msg){
  notification.textContent= msg;
  notification.classList.remove('hidden');
  setTimeout(()=> notification.classList.add('hidden'),2500);
}
