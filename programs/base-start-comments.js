/* ---------- Константы ---------- */
const POST_ID  = "base-start";
const BASE_URL = "https://shvzzrccmuquidejwojh.supabase.co/functions/v1/comments";
const userId   = localStorage.getItem("user_id");              // UUID автора

/* ---------- При загрузке ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  if (!userId) document.getElementById("comment-form").style.display = "none";
  await loadComments();
});

/* ---------- Загрузка списка ---------- */
async function loadComments() {
  const list = document.getElementById("comment-list");
  list.textContent = "Загрузка…";

  try {
    const res  = await fetch(`${BASE_URL}/list?post_id=${encodeURIComponent(POST_ID)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);

    renderComments(data.comments || []);

  } catch (e) {
    list.innerHTML = `<p style="color:red">Ошибка: ${e}</p>`;
  }
}

function renderComments(arr) {
  const list = document.getElementById("comment-list");
  list.innerHTML = "";

  if (!arr.length) {
    list.innerHTML = "<p>Пока нет комментариев.</p>";
    return;
  }

  arr.forEach(c => {
    /* — проверочный вывод, чтобы убедиться, что id совпадают — */
    console.log('localStorage:', userId, '| comment:', c.user_id);

    const card = document.createElement("div");
    card.className  = "comment-card";
    card.dataset.id = c.id;

    /* header */
    card.innerHTML = `
      <div class="comment-header">
        <img class="comment-avatar" src="${c.user.avatar_url}" alt="">
        <span class="comment-author">${c.user.display_name}</span>
      </div>

      <div class="comment-text">${c.body}</div>

      <div class="comment-footer">
        <span class="comment-date">
          ${new Date(c.created_at).toLocaleString("ru-RU", {
              year:"numeric", month:"long", day:"numeric",
              hour:"2-digit", minute:"2-digit"
          })}
        </span>
      </div>
    `;

    /* кнопка видна ТОЛЬКО автору */
    if (userId && userId === c.user_id) {
      const btn = document.createElement("button");
      btn.className = "comment-del";
      btn.textContent = "Удалить";
      card.querySelector(".comment-footer").appendChild(btn);
    }

    list.appendChild(card);
  });
}



/* ---------- Делегированный обработчик удаления ---------- */
/* ---------- Делегированный обработчик удаления ---------- */
document.getElementById("comment-list").addEventListener("click", async e => {
  const btn = e.target.closest(".comment-del");
  if (!btn) return;

  const list = document.getElementById("comment-list");
  const card = btn.closest(".comment-card");
  const cid  = card.dataset.id;

  try {
    const res = await fetch(`${BASE_URL}/delete?comment_id=${cid}`, {
      method : "POST",
      headers: { "Content-Type":"application/json" },
      body   : JSON.stringify({ comment_id: cid })
    });
    const j = await res.json();
    if (!res.ok || !j.success) throw new Error(j.error || res.statusText);

    /* удаляем карточку из DOM */
    card.remove();

    /* --- если карточек не осталось, выводим заглушку --- */
    if (!list.querySelector(".comment-card")) {
      list.innerHTML = "<p>Пока нет комментариев.</p>";
    }

  } catch (err) {
    alert("Не удалось удалить: " + err);
  }
});


/* ---------- Отправка нового комментария ---------- */
document.getElementById("submit-comment").addEventListener("click", async e => {
  e.preventDefault();

  if (!userId) return alert("Авторизуйтесь, чтобы писать комментарии.");

  const ta   = document.getElementById("comment-text");
  const text = ta.value.trim();
  if (!text) return alert("Введите текст комментария");

  try {
    const res = await fetch(`${BASE_URL}/add`, {
      method : "POST",
      headers: { "Content-Type":"application/json" },
      body   : JSON.stringify({ user_id:userId, post_id:POST_ID, body:text })
    });
    const j = await res.json();
    if (!res.ok || !j.success) throw new Error(j.error || res.statusText);

    ta.value = "";
    await loadComments();

  } catch (err) {
    alert("Ошибка: " + err);
  }
});
