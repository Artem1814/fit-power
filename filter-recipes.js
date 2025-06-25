document.addEventListener('DOMContentLoaded', function() {
  // 1) Находим все рецепты (карточки)
  const allRecipes = document.querySelectorAll('#recipe-list .recipe-card');

  // 2) Находим кнопки-фильтры по их ID
  const btnAll       = document.getElementById('btn-all');
  const btnBreakfast = document.getElementById('btn-breakfast');
  const btnLunch     = document.getElementById('btn-lunch');
  const btnDinner    = document.getElementById('btn-dinner');
  const btnSnack     = document.getElementById('btn-snack');

  // Собираем кнопки в массив, чтобы потом снимать класс подсветки
  const filterButtons = [btnAll, btnBreakfast, btnLunch, btnDinner, btnSnack];

  // 3) Функция для очистки подсветки (активной кнопки)
  function removeActiveClassFromAll() {
    filterButtons.forEach(btn => {
      btn.style.backgroundColor = '';
      btn.style.color = '';
    });
  }

  // 4) Функция фильтрации
  function filterRecipes(category) {
    allRecipes.forEach(recipe => {
      const recipeCat = recipe.getAttribute('data-category');
      if (category === 'all' || recipeCat === category) {
        recipe.style.display = '';
      } else {
        recipe.style.display = 'none';
      }
    });
  }

  // 5) Навешиваем обработчики клика на кнопки
  btnAll.addEventListener('click', e => {
    e.preventDefault();
    removeActiveClassFromAll();
    btnAll.style.backgroundColor = '#ccc';
    btnAll.style.color = '#ef2904';
    filterRecipes('all');
  });

  btnBreakfast.addEventListener('click', e => {
    e.preventDefault();
    removeActiveClassFromAll();
    btnBreakfast.style.backgroundColor = '#ccc';
    btnBreakfast.style.color = '#ef2904';
    filterRecipes('breakfast');
  });

  btnLunch.addEventListener('click', e => {
    e.preventDefault();
    removeActiveClassFromAll();
    btnLunch.style.backgroundColor = '#ccc';
    btnLunch.style.color = '#ef2904';
    filterRecipes('lunch');
  });

  btnDinner.addEventListener('click', e => {
    e.preventDefault();
    removeActiveClassFromAll();
    btnDinner.style.backgroundColor = '#ccc';
    btnDinner.style.color = '#ef2904';
    filterRecipes('dinner');
  });

  btnSnack.addEventListener('click', e => {
    e.preventDefault();
    removeActiveClassFromAll();
    btnSnack.style.backgroundColor = '#ccc';
    btnSnack.style.color = '#ef2904';
    filterRecipes('snack');
  });

  // 6) При загрузке ставим "Все" по умолчанию
  filterRecipes('all');
  btnAll.style.backgroundColor = '#ccc';
  btnAll.style.color = '#ef2904';
});
