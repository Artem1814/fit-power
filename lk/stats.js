// stats.js

const BASE_URL = 'https://shvzzrccmuquidejwojh.supabase.co/functions/v1';

const logoutBtn     = document.getElementById('logout-btn');
const notification  = document.getElementById('notification');

const statsInfo     = document.getElementById('stats-info');
const chartsWrap    = document.getElementById('charts-wrapper');
const filterDiv     = document.getElementById('stats-filter');
const startDateInp  = document.getElementById('date-start');
const endDateInp    = document.getElementById('date-end');
const typeSelect    = document.getElementById('workout-type');
const applyBtn      = document.getElementById('apply-btn');

// Canvas
const waveCanvas    = document.getElementById('stats-wave-chart')?.getContext('2d');
const barCanvas     = document.getElementById('stats-bar-chart')?.getContext('2d');
const pieCanvas     = document.getElementById('stats-pie-chart')?.getContext('2d');

let waveChart=null, barChart=null, pieChart=null;
let allWorkouts=[];

const userId= localStorage.getItem('user_id');
if(!userId){
  window.location.href='login.html';
}

// Выйти
logoutBtn.onclick= ()=>{
  localStorage.removeItem('user_id');
localStorage.removeItem('role');
  window.location.href='login.html';
};

// При загрузке
buildStats();

async function buildStats(){
  statsInfo.textContent='Загрузка...';

  try {
    const res= await fetch(`${BASE_URL}/workouts/list?userId=${userId}`);
    const data= await res.json();

    if(!res.ok){
      statsInfo.textContent= data.error || 'Ошибка при получении статистики.';
      destroyCharts();
      return;
    }

    allWorkouts= data.workouts||[];
    if(!allWorkouts.length){
      statsInfo.textContent='Нет данных для статистики.';
      destroyCharts();
      return;
    }

    // Показать фильтр+графики
    filterDiv.style.display='flex';
    chartsWrap.classList.remove('hidden');

    // Заполним select типами
    fillTypes(allWorkouts);

    // Рендер без фильтров
    renderCharts(allWorkouts);

    // Итог минут
    const total= allWorkouts.reduce((acc,w)=> acc+(w.duration||0),0);
    statsInfo.textContent=`Всего тренировочных минут: ${total}`;
  } catch(err){
    statsInfo.textContent='Ошибка сети: '+ err.message;
    destroyCharts();
  }
}

// Сохраняем уникальные типы
function fillTypes(list){
  const uniqueTypes= Array.from(new Set(list.map(w=>w.type).filter(Boolean)));
  let html= `<option value="">(все)</option>`;
  uniqueTypes.forEach(t=>{
    html+= `<option value="${t}">${t}</option>`;
  });
  typeSelect.innerHTML= html;
}

// "Применить"
applyBtn.onclick= ()=>{
  const filtered= applyFilters(allWorkouts);
  renderCharts(filtered);
  const total= filtered.reduce((acc,w)=> acc+(w.duration||0),0);
  statsInfo.textContent=`Всего тренировочных минут (после фильтра): ${total}`;
};

function applyFilters(list){
  const start= startDateInp.value? new Date(startDateInp.value+'T00:00:00'):null;
  const end  = endDateInp.value?   new Date(endDateInp.value+'T23:59:59'):null;
  const selType= typeSelect.value.trim();

  return list.filter(w=>{
    const d= new Date(w.date);
    if(start && d<start) return false;
    if(end && d>end)     return false;
    if(selType && w.type!==selType) return false;
    return true;
  });
}

function renderCharts(workouts){
  destroyCharts();
  if(!workouts.length) return;

  // Группируем по месяцу (wave+bar)
  const monthlyTotals={};
  workouts.forEach(w=>{
    const d= new Date(w.date);
    const y= d.getFullYear(), m= d.getMonth()+1;
    const key= y*100+m;
    monthlyTotals[key]= (monthlyTotals[key]||0)+(w.duration||0);
  });
  const keys= Object.keys(monthlyTotals).map(k=> +k).sort((a,b)=>a-b);
  const rusMonths= ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  const labels= keys.map(k=>{
    const y=Math.floor(k/100);
    const mm= k%100;
    return `${rusMonths[mm-1]} ${y}`;
  });
  const values= keys.map(k=> monthlyTotals[k]);

  // (A) Волновой
  waveChart= new Chart(waveCanvas, {
    type:'line',
    data:{
      labels,
      datasets:[{
        label:'Трен.минуты',
        data: values,
        borderColor:'#ff3b00',
        backgroundColor:'rgba(255,59,0,0.2)',
        fill:true,
        tension:0.3
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{ legend:{ onClick:null } }
    }
  });

  // (B) Столбчатый
  barChart= new Chart(barCanvas, {
    type:'bar',
    data:{
      labels,
      datasets:[{
        label:'Трен.минуты',
        data: values,
        backgroundColor:'#ff3b00'
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{ legend:{ onClick:null } }
    }
  });

  // (C) Круговой
  const typeMap={};
  workouts.forEach(w=>{
    const t= w.type||'Неизвестно';
    typeMap[t]= (typeMap[t]||0)+(w.duration||0);
  });
  const pieLabels= Object.keys(typeMap);
  const pieValues= Object.values(typeMap);

  pieChart= new Chart(pieCanvas, {
    type:'pie',
    data:{
      labels: pieLabels,
      datasets:[{
        label:'Длительность по типам',
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

function destroyCharts(){
  chartsWrap.classList.add('hidden');
  if(waveChart){ waveChart.destroy(); waveChart=null; }
  if(barChart){  barChart.destroy();  barChart=null; }
  if(pieChart){  pieChart.destroy();  pieChart=null; }
}

// Toast
function showNotification(msg){
  notification.textContent= msg;
  notification.classList.remove('hidden');
  setTimeout(()=> notification.classList.add('hidden'),2500);
}
