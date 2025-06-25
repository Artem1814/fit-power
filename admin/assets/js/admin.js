document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeBtn');
  const paint = () =>
      btn.textContent = document.body.classList.contains('dark') ? '☀️' : '⚫';

  if (localStorage.getItem('theme') === 'dark')
      document.body.classList.add('dark');

  paint();

  btn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('theme',
        document.body.classList.contains('dark') ? 'dark' : 'light');
      paint();
  });
});