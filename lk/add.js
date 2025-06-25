// add.js

const BASE_URL = 'https://shvzzrccmuquidejwojh.supabase.co/functions/v1';

const logoutBtn   = document.getElementById('logout-btn');
const addForm     = document.getElementById('add-form');
const notification= document.getElementById('notification');

const userId = localStorage.getItem('user_id');
if(!userId){
  window.location.href='login.html';
}

// "Выйти"
logoutBtn.onclick = () => {
  localStorage.removeItem('user_id');
localStorage.removeItem('role');
  window.location.href='login.html';
};

addForm.onsubmit = async (e) => {
  e.preventDefault();

  const dateValue  = document.getElementById('date-input').value.trim();
  let   typeValue  = document.getElementById('type-input').value.trim();
  const durStr     = document.getElementById('duration-input').value.trim();
  const notes      = document.getElementById('workout-notes').value.trim();

  if (!dateValue || !typeValue || !durStr) {
    showNotification('Ошибка: заполните дату, тип и длительность!');
    return;
  }

  // Приводим поле "type" к формату "Первая буква большая, остальные строчные"
  if (typeValue.length > 0) {
    typeValue = typeValue.charAt(0).toUpperCase() + typeValue.slice(1).toLowerCase();
  }

  const duration = parseInt(durStr, 10);
  if (isNaN(duration) || duration <= 0) {
    showNotification('Ошибка: длительность должна быть > 0!');
    return;
  }
  if (notes.length > 500) {
    showNotification('Ошибка: заметки не более 500 символов!');
    return;
  }

  // Проверка "не будущее"
  const today = new Date();
  today.setHours(0,0,0,0);
  const wDate = new Date(dateValue + 'T00:00:00');
  if (wDate.getTime() > today.getTime()) {
    showNotification('Ошибка: дата не может быть в будущем!');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/workouts/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        date: dateValue,
        type: typeValue, // <-- уже с заглавной первой буквой
        duration,
        notes: notes || null
      })
    });
    const data = await res.json();

    if (!res.ok) {
      showNotification(data.error || 'Ошибка при добавлении.');
    } else {
      // 1) Сообщаем об успехе
      showNotification('Тренировка успешно добавлена!');

      // 2) Проверяем новые награды
      if (data.newAchievements && data.newAchievements.length > 0) {
        const achievementsList = data.newAchievements.join(', ');
        showNotification(
          `Получены новые награды: ${achievementsList}\n` +
          `. Проверьте раздел "Мои награды"!`
        );
      }

      // Сбрасываем поля формы
      addForm.reset();
    }
  } catch (err) {
    showNotification('Ошибка сети: ' + err.message);
  }
};

function showNotification(msg) {
  notification.textContent = msg;
  notification.classList.remove('hidden');
  setTimeout(() => notification.classList.add('hidden'), 2500);
}
