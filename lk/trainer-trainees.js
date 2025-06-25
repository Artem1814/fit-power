const logoutBtn      = document.getElementById('logout-btn');
const notification   = document.getElementById('notification');
const traineesListDiv= document.getElementById('trainees-list');

// Проверяем, что user_id, role
const userId   = localStorage.getItem('user_id');
const userRole = localStorage.getItem('role');
if (!userId || userRole!=='trainer') {
  window.location.href='login.html';
}

logoutBtn.onclick=()=>{
  localStorage.removeItem('user_id');
  localStorage.removeItem('role');
  window.location.href='login.html';
};

loadTrainees();

async function loadTrainees(){
  traineesListDiv.textContent='Загрузка списка...';
  try {
    const res= await fetch(`https://shvzzrccmuquidejwojh.supabase.co/functions/v1/trainer-dashboard/trainees?trainer_id=${userId}`);
    const data= await res.json();

    if (!res.ok) {
      traineesListDiv.innerHTML= `<p style="color:red;">${data.error||'Ошибка при загрузке.'}</p>`;
      return;
    }
    if (!data.trainees || !data.trainees.length) {
      traineesListDiv.innerHTML= `<p>У вас пока нет подопечных.</p>`;
      return;
    }
    renderTrainees(data.trainees);
  } catch(err){
    traineesListDiv.innerHTML= `<p style="color:red;">Ошибка сети: ${err.message}</p>`;
  }
}

function renderTrainees(trainees){
  const html= trainees.map(t => {
    const fullName= `${t.first_name||''} ${t.last_name||''}`.trim() || t.email;
    return `
      <div class="trainee-card" data-id="${t.id}">
        <div class="trainee-header">
          <div class="trainee-name">${fullName} <span style="color:#aaa;">(${t.email})</span></div>
          <button class="toggle-details-btn">Раскрыть</button>
        </div>

        <div class="trainee-details">
          <div class="trainee-profile"></div>
          <div class="trainee-workouts"></div>
          <div class="trainee-achievements"></div>
          <div class="trainee-stats"></div>
        </div>
      </div>
    `;
  }).join('');
  traineesListDiv.innerHTML= html;

  // Ставим обработчик на "Раскрыть"
  document.querySelectorAll('.toggle-details-btn').forEach(btn=>{
    btn.onclick= async ()=>{
      const card= btn.closest('.trainee-card');
      const detailsDiv= card.querySelector('.trainee-details');
      if (detailsDiv.style.display==='block') {
        // Свернуть
        detailsDiv.style.display='none';
        btn.textContent='Раскрыть';
      } else {
        // Раскрыть
        detailsDiv.style.display='block';
        btn.textContent='Свернуть';

        if (!detailsDiv.dataset.loaded) {
          detailsDiv.dataset.loaded='1';
          const traineeId= card.dataset.id;
          loadTraineeData(traineeId, detailsDiv);
        }
      }
    };
  });
}

async function loadTraineeData(traineeId, container){
  try {
    const res= await fetch(`https://shvzzrccmuquidejwojh.supabase.co/functions/v1/trainer-dashboard/trainee-data?trainer_id=${userId}&trainee_id=${traineeId}`);
    const data= await res.json();
    if (!res.ok || data.error) {
      container.innerHTML= `<p style="color:red;">${data.error||'Ошибка при загрузке данных.'}</p>`;
      return;
    }
    fillProfile(container.querySelector('.trainee-profile'), data.profile);
    fillWorkouts(container.querySelector('.trainee-workouts'), data.workouts);
    fillAchievements(container.querySelector('.trainee-achievements'), data.achievements);
    fillStats(container.querySelector('.trainee-stats'), data.stats, data.workouts);
  } catch(err){
    container.innerHTML=`<p style="color:red;">Ошибка сети: ${err.message}</p>`;
  }
}

function fillProfile(div, profile){
  div.innerHTML= `<h3>Профиль</h3>`;
  if (!profile) {
    div.innerHTML+=`<p>Нет данных профиля.</p>`;
    return;
  }
  div.innerHTML+=`
    <p>Email: ${profile.email}</p>
    <p>Имя: ${profile.first_name||''}</p>
    <p>Фамилия: ${profile.last_name||''}</p>
    <p>Вес: ${profile.weight||''} кг</p>
    <p>Рост: ${profile.height||''} см</p>
    ${profile.avatar_url? `<img src="${profile.avatar_url}" style="max-width:100px;border-radius:50%;" alt="avatar" />`:''}
  `;
}

function fillWorkouts(div, workouts){
  div.innerHTML= `<h3>Тренировки</h3>`;
  if (!workouts || !workouts.length){
    div.innerHTML+= `<p>Нет тренировок.</p>`;
    return;
  }
  let html=``;
  workouts.forEach(w=>{
    html+=`
      <div style="border:1px solid #444;margin-bottom:4px;padding:4px;">
        <b>Дата:</b> ${w.date},
        <b>Тип:</b> ${w.type},
        <b>Длительность:</b> ${w.duration} мин
        ${w.notes? `<div><i>${w.notes}</i></div>`:''}
      </div>
    `;
  });
  div.innerHTML+= html;
}

function fillAchievements(div, achievements){
  div.innerHTML= `<h3>Награды</h3>`;
  if(!achievements||!achievements.length){
    div.innerHTML+= `<p>Нет наград.</p>`;
    return;
  }
  let html=``;
  achievements.forEach(a=>{
    const dateStr= a.awarded_at
      ? new Date(a.awarded_at).toLocaleDateString("ru-RU",{year:"numeric", month:"long", day:"numeric"})
      : '';
    html+=`
      <div style="margin-bottom:4px;">
        <strong>${a.title}</strong> — ${a.description}<br/>
        <small>Получено: ${dateStr}</small>
      </div>
    `;
  });
  div.innerHTML+= html;
}

/**
 * fillStats: 
 * - Фильтр (период, тип)
 * - Три графика: волновой (line), столбчатый (bar), круговой (pie)
 */
function fillStats(div, stats, workouts){
  div.innerHTML= `<h3>Статистика</h3>`;
  if (!stats) {
    div.innerHTML+= `<p>Нет данных.</p>`;
    return;
  }
  // Итоговые цифры
  div.innerHTML+= `
    <p>Всего тренировок: ${stats.total_workouts||0}</p>
    <p>Суммарная длительность: ${stats.total_duration||0} мин</p>
  `;

  // Уникальные типы
  const uniqueTypes = Array.from(new Set(workouts.map(w=>w.type).filter(Boolean)));

  // Фильтр
  div.innerHTML+= `
    <div class="stats-filter">
      <label>Период с:</label>
      <input type="date" class="filter-date-start" />
      <label>по:</label>
      <input type="date" class="filter-date-end" />

      <label>Тип:</label>
      <select class="filter-type">
        <option value="">(все)</option>
        ${
          uniqueTypes.map(t=>`<option value="${t}">${t}</option>`).join('')
        }
      </select>
      <button class="filter-apply-btn">Применить</button>
    </div>

    <div style="display:flex; flex-wrap:wrap; gap:10px;">
      <!-- Волновой -->
      <div class="small-chart-container">
        <canvas class="stats-chart-line"></canvas>
      </div>
      <!-- Столбчатый -->
      <div class="small-chart-container">
        <canvas class="stats-chart-bar"></canvas>
      </div>
      <!-- Круговой -->
      <div class="small-chart-container">
        <canvas class="stats-chart-pie"></canvas>
      </div>
    </div>
  `;

  // DOM
  const startDateInp  = div.querySelector('.filter-date-start');
  const endDateInp    = div.querySelector('.filter-date-end');
  const typeSel       = div.querySelector('.filter-type');
  const applyBtn      = div.querySelector('.filter-apply-btn');

  const lineCanvas    = div.querySelector('.stats-chart-line');
  const barCanvas     = div.querySelector('.stats-chart-bar');
  const pieCanvas     = div.querySelector('.stats-chart-pie');

  let lineChart=null, barChart=null, pieChart=null;

  function renderCharts(filtered){
    // Уничтожаем прежние
    if (lineChart) { lineChart.destroy(); lineChart=null; }
    if (barChart)  { barChart.destroy();  barChart=null; }
    if (pieChart)  { pieChart.destroy();  pieChart=null; }

    if (!filtered.length) {
      // если нет данных, просто очистим canvas
      [lineCanvas, barCanvas, pieCanvas].forEach(cv=>{
        const ctx = cv.getContext('2d');
        ctx.clearRect(0,0, cv.width, cv.height);
        ctx.fillStyle='#fff';
        ctx.fillText('Нет данных',10,50);
      });
      return;
    }

    // Группировка по месяцам
    const monthlyTotals= {}; // {YYYYMM: sum_of_duration}
    filtered.forEach(w=>{
      const d= new Date(w.date);
      const y= d.getFullYear(), m= d.getMonth()+1;
      const key= y*100 + m;
      monthlyTotals[key]= (monthlyTotals[key]||0) + (w.duration||0);
    });
    const keys= Object.keys(monthlyTotals).map(k=> +k).sort((a,b)=>a-b);
    const lineLabels = keys.map(k=>{
      const y= Math.floor(k/100);
      const mm= k%100;
      return `${mm<10?'0':''}${mm}.${y}`;
    });
    const lineValues = keys.map(k=> monthlyTotals[k]);

    // Создаём линейный (wave)
    lineChart= new Chart(lineCanvas.getContext('2d'), {
      type:'line',
      data:{
        labels: lineLabels,
        datasets:[{
          label:'Минуты (мес.)',
          data: lineValues,
          borderColor:'#ff3b00',
          backgroundColor:'rgba(255,59,0,0.2)',
          fill:true,
          tension:0.2
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{ legend:{ onClick:null } }
      }
    });

    // Создаём столбчатый
    barChart= new Chart(barCanvas.getContext('2d'), {
      type:'bar',
      data:{
        labels: lineLabels,
        datasets:[{
          label:'Минуты (мес.)',
          data: lineValues,
          backgroundColor:'#ff3b00'
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{ legend:{ onClick:null } }
      }
    });

    // Круговой (pie) - группировка по type
    const typeMap= {}; // { "Силовая": sum_of_duration, ... }
    filtered.forEach(w=>{
      const t= w.type||'Неизвестно';
      typeMap[t]= (typeMap[t]||0)+(w.duration||0);
    });
    const pieLabels= Object.keys(typeMap);
    const pieValues= Object.values(typeMap);

    pieChart= new Chart(pieCanvas.getContext('2d'), {
      type:'pie',
      data:{
        labels: pieLabels,
        datasets:[{
          label:'Минуты по типам',
          data: pieValues,
          backgroundColor:[
            '#ff3b00','#ff6b32','rgba(255,59,0,0.8)',
            '#fc9873','#fcbba6','#ffd1c4',
            '#ee8063','#ff8e6c','#ffaf92'
          ]
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{ legend:{ onClick:null } }
      }
    });
  }

  function applyFilters(){
    const start= startDateInp.value? new Date(startDateInp.value+'T00:00:00'): null;
    const end  = endDateInp.value?   new Date(endDateInp.value+'T23:59:59'): null;
    const selType= typeSel.value.trim();

    const filtered= workouts.filter(w=>{
      const d= new Date(w.date);
      if (start && d<start) return false;
      if (end && d>end) return false;
      if (selType && w.type!==selType) return false;
      return true;
    });
    renderCharts(filtered);
  }

  applyBtn.onclick= applyFilters;

  // При старте показываем все
  renderCharts(workouts);
}

function showNotification(msg){
  notification.textContent= msg;
  notification.classList.remove('hidden');
  setTimeout(()=> notification.classList.add('hidden'),3000);
}
