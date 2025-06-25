const logoutBtn          = document.getElementById('logout-btn');
const trainerKeyDisplay  = document.getElementById('trainer-key-display');
const notification       = document.getElementById('notification');

// Проверяем, что user_id есть и role='trainer'
const userId  = localStorage.getItem('user_id');
const userRole= localStorage.getItem('role');

if (!userId || userRole!=='trainer') {
  window.location.href='login.html';
}

logoutBtn.onclick=()=>{
  localStorage.removeItem('user_id');
  localStorage.removeItem('role');
  window.location.href='login.html';
};

loadTrainerKey();

// Запрашиваем ключ
async function loadTrainerKey(){
  trainerKeyDisplay.textContent= 'Загрузка...';

  try {
    // GET /auth-users/trainer-key?user_id=...
    const res= await fetch(`https://shvzzrccmuquidejwojh.supabase.co/functions/v1/auth-users/trainer-key?user_id=${userId}`);
    const data= await res.json();

    if (!res.ok) {
      trainerKeyDisplay.textContent= data.error || 'Ошибка при загрузке ключа';
      return;
    }
    if (data.error) {
      trainerKeyDisplay.textContent= data.error;
    } else {
      // data.trainer_key
      trainerKeyDisplay.textContent= data.trainer_key || '(Ключ не задан)';
    }
  } catch(err){
    trainerKeyDisplay.textContent='Ошибка сети: '+ err.message;
  }
}
