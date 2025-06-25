// my-trainer.js

const logoutBtn          = document.getElementById('logout-btn');
const notification       = document.getElementById('notification');

const trainerFormSection = document.getElementById('trainer-form-section');
const trainerInfoSection = document.getElementById('trainer-info-section');
const trainerInfoText    = document.getElementById('trainer-info-text');

const trainerKeyInput    = document.getElementById('trainer-key');
const bindBtn            = document.getElementById('bind-btn');
const unbindBtn          = document.getElementById('unbind-btn');

const userId= localStorage.getItem('user_id');
if(!userId){
  window.location.href='login.html';
}

// Выход
logoutBtn.onclick= ()=>{
  localStorage.removeItem('user_id');
  localStorage.removeItem('role');
  window.location.href='login.html';
};

const TRAINER_BASE_URL= "https://shvzzrccmuquidejwojh.supabase.co/functions/v1/trainer-users";

// При загрузке — проверяем
checkTrainer();

async function checkTrainer(){
  try {
    const res= await fetch(`${TRAINER_BASE_URL}/info?user_id=${userId}`);
    // Возможен CORS => убедитесь, что OPTIONS отрабатывает
    const data= await res.json();

    // data.trainer === null => нет привязки
    if(!data.trainer){
      showForm();
    } else {
      showTrainerInfo(data.trainer);
    }
  } catch(err){
    showNotification('Ошибка сети: '+ err.message);
    showForm();
  }
}

function showForm(){
  trainerFormSection.style.display='block';
  trainerInfoSection.style.display='none';
}

function showTrainerInfo(trainer){
  trainerFormSection.style.display='none';
  trainerInfoSection.style.display='block';

  const fullName= `${trainer.first_name||''} ${trainer.last_name||''}`.trim();
  trainerInfoText.innerHTML= `
    <span style="color:#ff3b00;font-weight:700;">Ваш тренер:</span>
    ${fullName} (email: ${trainer.email||''})
  `;
}

// «Привязаться»
bindBtn.onclick= async ()=>{
  const tk= trainerKeyInput.value.trim();
  if(!tk){
    showNotification('Введите ключ тренера');
    return;
  }
  try {
    const res= await fetch(`${TRAINER_BASE_URL}/bind`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        user_id: userId,
        trainer_key: tk
      })
    });
    const data= await res.json();
    if(data.error){
      showNotification(data.error);
    } else if(data.success){
      showNotification('Тренер успешно привязан!');
      checkTrainer(); // заново загрузим инфу, покажем trainer-info
    }
  } catch(err){
    showNotification('Ошибка сети: '+ err.message);
  }
};

// «Сменить тренера»
unbindBtn.onclick= async ()=>{
  try {
    const res= await fetch(`${TRAINER_BASE_URL}/unbind`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        user_id: userId
      })
    });
    const data= await res.json();
    if(data.error){
      showNotification(data.error);
    } else if(data.success){
      showNotification('Тренер отвязан. Теперь можно выбрать другого.');
      showForm(); // снова показываем форму, даём ввести ключ
    }
  } catch(err){
    showNotification('Ошибка сети: '+ err.message);
  }
};

function showNotification(msg){
  notification.textContent= msg;
  notification.classList.remove('hidden');
  setTimeout(()=> notification.classList.add('hidden'),3000);
}
