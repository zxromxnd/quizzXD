document.addEventListener('DOMContentLoaded', () => {
  // Кнопка створити квіз
  const createBtn = document.getElementById('create-quiz');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      window.location.href = 'create.html';
    });
  }

  const USER_QUIZZES_KEY = 'userQuizzes';

  // Динамічний рендер тестів
  const topicsRoot = document.getElementById('topics-root');
  if (!topicsRoot) return;

  const openQuiz = (testValue) => {
    const testData = {
      name: testValue.name,
      description: testValue.description,
      questions: testValue.questions,
    };
    localStorage.setItem('currentTest', JSON.stringify(testData));
    window.location.href = 'tests.html';
  };

  const renderUserQuizzes = () => {
    const raw = localStorage.getItem(USER_QUIZZES_KEY);
    if (!raw) return;

    let userQuizzes;
    try {
      userQuizzes = JSON.parse(raw);
    } catch (err) {
      console.warn('Помилка читання користувацьких тестів:', err);
      return;
    }

    if (!Array.isArray(userQuizzes) || userQuizzes.length === 0) {
      return;
    }

    let userSection = Array.from(topicsRoot.querySelectorAll('.topic-section')).find(sec => {
      const titleEl = sec.querySelector('.topic-title');
      if (!titleEl) return false;
      const titleText = titleEl.textContent || '';
      return titleText.trim().includes('Тести від користувачів');
    });

    if (!userSection) {
      userSection = document.createElement('section');
      userSection.className = 'topic-section';
      userSection.id = 'user-quizzes-section';
      userSection.innerHTML = `
        <h2 class="topic-title">👥 Тести від користувачів</h2>
        <div class="cards"></div>
      `;
      topicsRoot.appendChild(userSection);
    }

    const cardsDiv = userSection.querySelector('.cards');
    if (!cardsDiv) return;

    Array.from(cardsDiv.querySelectorAll('.quiz-card[data-source="user"]')).forEach(card => card.remove());

    userQuizzes.forEach((quiz, index) => {
      if (!quiz || !quiz.name) return;
      const card = document.createElement('article');
      card.className = 'quiz-card';
      card.dataset.id = quiz.id || `user_${index}`;
      card.dataset.topic = 'user';
      card.dataset.source = 'user';
      card.innerHTML = `
        <h3 class="quiz-card-title">${quiz.name}</h3>
        <p class="quiz-card-desc">${quiz.description || ''}</p>
      `;
      card.addEventListener('click', () => openQuiz(quiz));
      cardsDiv.appendChild(card);
    });
  };

  fetch('../data/tests.json')
    .then(res => res.json())
    .then(data => {
      topicsRoot.innerHTML = '';
      Object.entries(data).forEach(([categoryKey, categoryValue]) => {
        if (!categoryValue || typeof categoryValue !== 'object') return;
        if (!categoryValue.name) return;
        const sec = document.createElement('section');
        sec.className = 'topic-section';
        sec.innerHTML = `
          <h2 class="topic-title">${categoryValue.name}</h2>
          <div class="cards"></div>
        `;
        const cardsDiv = sec.querySelector('.cards');
        Object.entries(categoryValue).forEach(([testKey, testValue]) => {
          if (!testKey.startsWith('id_')) return;
          const card = document.createElement('article');
          card.className = 'quiz-card';
          card.setAttribute('data-id', testKey);
          card.setAttribute('data-topic', categoryKey);
          card.innerHTML = `
            <h3 class="quiz-card-title">${testValue.name || testKey}</h3>
            <p class="quiz-card-desc">${testValue.description || ''}</p>
          `;
          card.addEventListener('click', () => openQuiz(testValue));
          cardsDiv.appendChild(card);
        });
        topicsRoot.appendChild(sec);
      });
      renderUserQuizzes();
    })
    .catch(err => {
      console.warn('Не вдалося завантажити tests.json:', err);
      renderUserQuizzes();
    });
});
