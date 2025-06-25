

/*  Создание глобального клиента Supabase  */
(function () {
  const URL = 'https://shvzzrccmuquidejwojh.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNodnp6cmNjbXVxdWlkZWp3b2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTg5ODcsImV4cCI6MjA2MzU5NDk4N30.0ZF3zrw97_kd8mZyK2JcfcEKoAI0k5MyP1XqM86F8Fs';

  /* Ждём, пока библиотека подхватится (defer гарантирует порядок, но на случай кеша) */
  if (typeof window.supabase?.createClient !== 'function') {
    console.error('Библиотека Supabase JS не загружена');
    return;
  }

  /* Создаём клиент ➜ window.supabaseClient,
     а window.supabase оставляем как есть (не затираем объект библиотеки) */
  window.supabaseClient = window.supabase.createClient(URL, KEY);
})();