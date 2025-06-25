// URL Edge Function
const BASE_URL = 'https://shvzzrccmuquidejwojh.supabase.co/functions/v1/auth-users';

const loginForm = document.getElementById('login-form');
const msg = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  msg.style.color = 'red';

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    msg.textContent = 'Пожалуйста, заполните все поля!';
    return;
  }

  try {
    // Запрос на /auth-users/login
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      // Возможные статусы:
      // 401 => "Invalid credentials (bad password)"
      // 403 => "Email not verified"
      if (res.status === 401) {
        msg.textContent = 'Неверный email или пароль!';
      } else if (res.status === 403) {
        msg.textContent = 'Ваш email не подтверждён. Пожалуйста, проверьте почту (и спам).';
      } else {
        msg.textContent = data.error || 'Ошибка при входе.';
      }
    } else {
      // Успешный вход
      msg.style.color = 'green';
      msg.textContent = 'Вход успешен!';

      // Сохраняем user_id:
      localStorage.setItem('user_id', data.user_id);

      // Если сервер передал role => сохраним.
      // Если нет, пусть будет trainee по умолчанию.
      if (data.role) {
        localStorage.setItem('role', data.role);
      } else {
        localStorage.setItem('role', 'trainee');
      }

      // Перенаправить в зависимости от role:
      setTimeout(() => {
        if (data.role === 'trainer') {
          // Идём в кабинет тренера
          window.location.href = 'trainer-key.html';
        } else {
          // Обычный кабинет
          window.location.href = 'add.html';
        }
      }, 1000);
    }
  } catch (err) {
    msg.textContent = 'Ошибка сети: ' + err.message;
  }
});
