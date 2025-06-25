// achievements.js

const logoutBtn = document.getElementById("logout-btn");
const achievementsList = document.getElementById("achievements-list");
const notification = document.getElementById("notification");

// Важно: slug=workouts => "/functions/v1/workouts"
const BASE_URL = "https://shvzzrccmuquidejwojh.supabase.co/functions/v1/workouts";

const userId = localStorage.getItem("user_id");
if (!userId) {
  window.location.href = "login.html";
}

logoutBtn.onclick = () => {
  localStorage.removeItem("user_id");
  window.location.href="login.html";
};

// Загружаем награды
loadAchievements();

async function loadAchievements(){
  achievementsList.textContent = "Загрузка...";
  try {
    // => GET /workouts/achievements/list?userId=...
    const res = await fetch(`${BASE_URL}/achievements/list?userId=${userId}`);
    const data= await res.json();
    if(!res.ok){
      achievementsList.innerHTML= `<p style="color:red;">${data.error||"Ошибка при загрузке наград."}</p>`;
      return;
    }
    renderAchievements(data.achievements||[]);
  } catch(err){
    achievementsList.innerHTML= `<p style="color:red;">Ошибка сети: ${err.message}</p>`;
  }
}

function renderAchievements(achList){
  if(!achList.length){
    achievementsList.innerHTML= "<p>Пока нет полученных наград.</p>";
    return;
  }
  const html= achList.map(a=>{
    const dateStr= a.awarded_at
      ? new Date(a.awarded_at).toLocaleDateString("ru-RU",{year:"numeric",month:"long",day:"numeric"})
      : "";
    return `
      <div class="achievement-card">
        <img src="${a.icon_url||'default_icon.png'}" alt="Icon" class="ach-icon" />
        <div class="ach-info">
          <h3 class="ach-title">${a.title}</h3>
          <p class="ach-desc">${a.description}</p>
          <p class="ach-date">Получено: ${dateStr}</p>
        </div>
      </div>
    `;
  }).join("");
  achievementsList.innerHTML= html;
}

function showNotification(msg){
  notification.textContent= msg;
  notification.classList.remove("hidden");
  setTimeout(()=> notification.classList.add("hidden"),2500);
}
