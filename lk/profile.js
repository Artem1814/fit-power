/** profile.js
 * Логика раздела «Мой профиль».
 * После выбора файла — хотим автоматически обновить аватар?
 * Показываем превью сразу, а если нужно — мгновенно отправляем на сервер.
 */

const BASE_URL = 'https://shvzzrccmuquidejwojh.supabase.co/functions/v1';

// Элементы
const logoutBtn      = document.getElementById('logout-btn');
const notification   = document.getElementById('notification');

const emailInput     = document.getElementById('email');
const firstNameInput = document.getElementById('first_name');
const lastNameInput  = document.getElementById('last_name');
const weightInput    = document.getElementById('weight');
const heightInput    = document.getElementById('height');

const avatarFile     = document.getElementById('avatar-file');
const avatarPreview  = document.getElementById('avatar-preview');

const saveProfileBtn = document.getElementById('save-profile-btn');
const changePassBtn  = document.getElementById('change-pass-btn');

const oldPasswordInp = document.getElementById('old_password');
const newPasswordInp = document.getElementById('new_password');

const userId = localStorage.getItem('user_id');
if (!userId) {
  window.location.href = 'login.html';
}

// Выйти
logoutBtn.onclick = () => {
  localStorage.removeItem('user_id');
localStorage.removeItem('role');
  window.location.href = 'login.html';
};

// При загрузке — подгружаем профиль
loadProfile();

// 1) Загрузить данные профиля
async function loadProfile() {
  try {
    const res = await fetch(`${BASE_URL}/profile-users/me?user_id=${userId}`);
    const data = await res.json();
    if (!res.ok) {
      showNotification(data.error || 'Ошибка при загрузке профиля');
      return;
    }

    emailInput.value       = data.email       || '';
    firstNameInput.value   = data.first_name  || '';
    lastNameInput.value    = data.last_name   || '';
    weightInput.value      = data.weight      || '';
    heightInput.value      = data.height      || '';
    if (data.avatar_url) {
      avatarPreview.src    = data.avatar_url;
    }
  } catch (err) {
    showNotification('Ошибка сети: ' + err.message);
  }
}

// 2) Реакция на выбор файла - сразу отображаем превью
avatarFile.onchange = async () => {
  const file = avatarFile.files[0];
  if (file) {
    // Мгновенно показываем превью локально
    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.src = reader.result;
    };
    reader.readAsDataURL(file);

    // Если хотим «автоматически» сохранять аватар (без нажатия "Сохранить")
    // 1) Конвертируем в base64
    const base64 = await fileToBase64(file);
    // 2) Делаем запрос (POST /profile-users/me)
    await updateProfile({ avatar_base64: base64 });
    // 3) reload profile if needed
    loadProfile();
  }
};

// 3) Сохранить профиль (по кнопке)
saveProfileBtn.onclick = async () => {
  const first_name = firstNameInput.value.trim();
  const last_name  = lastNameInput.value.trim();
  const weightVal  = parseFloat(weightInput.value) || null;
  const heightVal  = parseFloat(heightInput.value) || null;

  // Посылаем запрос
  await updateProfile({
    first_name,
    last_name,
    weight: weightVal,
    height: heightVal
  });

  // reload
  loadProfile();
};

// 4) Смена пароля
changePassBtn.onclick = async () => {
  const old_password = oldPasswordInp.value.trim();
  const new_password = newPasswordInp.value.trim();

  if (!old_password || !new_password) {
    showNotification('Укажите старый и новый пароль');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/profile-users/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, old_password, new_password })
    });
    const data = await res.json();
    if (!res.ok) {
      showNotification(data.error || 'Ошибка при смене пароля');
      return;
    }
    showNotification('Пароль успешно изменён!');
    oldPasswordInp.value = '';
    newPasswordInp.value = '';
  } catch (err) {
    showNotification('Ошибка сети: ' + err.message);
  }
};

// Функция отправки обновлений профиля
async function updateProfile(fields) {
  try {
    // fields может содержать { first_name, last_name, weight, height, avatar_base64 }
    const body = { user_id: userId, ...fields };

    const res = await fetch(`${BASE_URL}/profile-users/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      showNotification(data.error || 'Ошибка при обновлении профиля');
    } else {
      showNotification('Профиль обновлён!');
    }
  } catch (err) {
    showNotification('Ошибка сети: ' + err.message);
  }
}

function showNotification(msg) {
  notification.textContent = msg;
  notification.classList.remove('hidden');
  setTimeout(() => notification.classList.add('hidden'), 3000);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror= (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

