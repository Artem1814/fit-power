// БАЗОВЫЙ URL Edge Function
const BASE_URL = 'https://shvzzrccmuquidejwojh.supabase.co/functions/v1/auth-users';

const form = document.getElementById('register-form');
const msg  = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  msg.style.color = 'red';

  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();

  if (!email || !password) {
    msg.textContent = 'Пожалуйста, заполните все поля.';
    return;
  }

  // 1) check-email
  try {
    const checkRes = await fetch(`${BASE_URL}/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (checkRes.status === 409) {
      msg.textContent = 'Такой аккаунт уже существует!';
      return;
    }
    if (!checkRes.ok) {
      const errData = await checkRes.json();
      msg.textContent = errData.error || 'Ошибка при проверке email.';
      return;
    }
  } catch (err) {
    msg.textContent = 'Ошибка сети (check-email): ' + err.message;
    return;
  }

  // 2) validate password
  if (password.length < 8) {
    msg.textContent = 'Пароль слишком короткий. Минимум 8 символов.';
    return;
  }
  if (!/\d/.test(password)) {
    msg.textContent = 'Пароль должен содержать хотя бы одну цифру.';
    return;
  }

  // 3) register
  try {
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await regRes.json();

    if (!regRes.ok) {
      if (regRes.status === 409) {
        msg.textContent = 'Такой аккаунт уже существует!';
      } else {
        msg.textContent = data.error || 'Ошибка при регистрации.';
      }
    } else {
      msg.style.color = 'green';
      msg.textContent = 'Регистрация успешна! Пожалуйста, проверьте почту для подтверждения.';
    }
  } catch (err) {
    msg.textContent = 'Ошибка сети (register): ' + err.message;
  }
});
