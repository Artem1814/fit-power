/** calc.js
 * Логика «Калькулятора калорий».
 */

// Предположим, что кнопка "Выйти" нужна везде:
const logoutBtn = document.getElementById('logout-btn');
const notification = document.getElementById('notification');
const calcForm = document.getElementById('calc-form');
const calcResultDiv = document.getElementById('calc-result');

// Проверяем user_id
const userId = localStorage.getItem('user_id');
if(!userId){
  // Если нет user_id, перенаправляем на login.html
  window.location.href='login.html';
}

// Кнопка "ВЫЙТИ"
logoutBtn.onclick = () => {
  localStorage.removeItem('user_id');
localStorage.removeItem('role');
  window.location.href='login.html';
};

// При сабмите формы считаем калории
calcForm.onsubmit = (e) => {
  e.preventDefault();
  
  // Считываем поля
  const genderVal   = document.getElementById('gender-input').value;
  const ageVal      = parseInt(document.getElementById('age-input').value, 10);
  const heightVal   = parseInt(document.getElementById('height-input').value, 10);
  const weightVal   = parseFloat(document.getElementById('weight-input').value);
  const activityVal = parseFloat(document.getElementById('activity-input').value);
  
  // Можно сделать простую проверку
  if(isNaN(ageVal) || isNaN(heightVal) || isNaN(weightVal)){
    showNotification('Ошибка: Проверьте поля возраста, роста, веса.');
    return;
  }
  
  // Формула Миффлина–Сан Жеора или Харриса-Бенедикта
  // Например, используем Mifflin-St Jeor:
  // Мужчины: BMR = 10*вес + 6.25*рост - 5*возраст + 5
  // Женщины: BMR = 10*вес + 6.25*рост - 5*возраст - 161
  let bmr;
  if(genderVal === 'male'){
    bmr = (10 * weightVal) + (6.25 * heightVal) - (5 * ageVal) + 5;
  } else {
    bmr = (10 * weightVal) + (6.25 * heightVal) - (5 * ageVal) - 161;
  }
  
  // Умножаем на коэффициент активности
  const maintenanceCals = Math.round(bmr * activityVal);
  
  // Для набора, похудения и т.д.:
  // - Похудение: maintenance - 15% ~ 20%
  // - Набор: maintenance + 15% ~ 20%
  const loseWeight = Math.round(maintenanceCals * 0.8);  // -20%
  const gainWeight = Math.round(maintenanceCals * 1.2);  // +20%
  
  // Выводим результат
  calcResultDiv.innerHTML = `
    <p>Поддержание веса: <b>${maintenanceCals}</b> ккал/день</p>
    <p>Для похудения (примерно -20%): <b>${loseWeight}</b> ккал/день</p>
    <p>Для набора (примерно +20%): <b>${gainWeight}</b> ккал/день</p>
  `;
};

// Всплывающее сообщение
function showNotification(msg){
  notification.textContent= msg;
  notification.classList.remove('hidden');
  setTimeout(()=> notification.classList.add('hidden'),2500);
}
