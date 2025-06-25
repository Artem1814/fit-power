// base-start-comments.js

// Идентификатор поста (программы), например "base-start"
const POST_ID = "progressive-load";

// Ваш endpoint Edge Function:
// Предположим, что он: /functions/v1/comments
// Меняйте при необходимости (например, https://.../comments)
const BASE_URL = "https://shvzzrccmuquidejwojh.supabase.co/functions/v1/comments";

// user_id из localStorage
const userId = localStorage.getItem("user_id");

// При загрузке документа — загружаем комментарии
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Если неавторизован → можем скрыть форму
  const formEl = document.getElementById("comment-form");
  if (!userId) {
    if (formEl) formEl.style.display = "none";
  }

  // 2. Загружаем комментарии
  await loadComments();
});

// Функция загрузки списка комментариев
async function loadComments() {
  try {
    const res = await fetch(`${BASE_URL}/list?post_id=${encodeURIComponent(POST_ID)}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("Ошибка при загрузке комментариев:", data.error);
      return;
    }
    // У нас data.comments
    renderComments(data.comments || []);
  } catch (err) {
    console.error("Сетевая ошибка:", err);
  }
}

// Рендерим комментарии
function renderComments(comments) {
  const listEl = document.getElementById("comment-list");
  if (!listEl) return;

  listEl.innerHTML = ""; // очистим

  if (!comments.length) {
    listEl.innerHTML = "<p>Пока нет комментариев.</p>";
    return;
  }

  comments.forEach((c) => {
    // c.body, c.created_at, c.user.display_name, c.user.avatar_url
    const card = document.createElement("div");
    card.className = "comment-card";

    const header = document.createElement("div");
    header.className = "comment-header";

    // Аватар
    const img = document.createElement("img");
    img.className = "comment-avatar";
    img.src = c.user.avatar_url || "../img/default-avatar.png";
    img.alt = "avatar";
    header.appendChild(img);

    // Имя автора
    const authorDiv = document.createElement("div");
    authorDiv.className = "comment-author";
    authorDiv.textContent = c.user.display_name || c.user.email || "Без имени";
    header.appendChild(authorDiv);

    // Текст
    const bodyEl = document.createElement("div");
    bodyEl.className = "comment-text";
    bodyEl.textContent = c.body;

    // Дата
    const dateEl = document.createElement("div");
    dateEl.className = "comment-date";
    const dateObj = new Date(c.created_at);
    dateEl.textContent = dateObj.toLocaleString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    card.appendChild(header);
    card.appendChild(bodyEl);
    card.appendChild(dateEl);

    listEl.appendChild(card);
  });
}

// Ловим клик на кнопке «Отправить»
const submitBtn = document.getElementById("submit-comment");
if (submitBtn) {
  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Только авторизованные пользователи могут оставлять комментарии!");
      return;
    }

    const textArea = document.getElementById("comment-text");
    if (!textArea) return;

    const body = textArea.value.trim();
    if (!body) {
      alert("Введите текст комментария");
      return;
    }

    // POST /comments/add
    try {
      const res = await fetch(`${BASE_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          post_id: POST_ID,
          body
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || "Ошибка при добавлении комментария");
        return;
      }
      // Успешно
      textArea.value = "";
      // Перезагрузить список
      await loadComments();
    } catch (err) {
      console.error("Ошибка сети при добавлении комментария:", err);
      alert("Ошибка сети, попробуйте позже");
    }
  });
}
