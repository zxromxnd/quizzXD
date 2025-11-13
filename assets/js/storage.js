document.addEventListener('DOMContentLoaded', () => {
  // Кнопка створити квіз
  const createBtn = document.getElementById('create-quiz');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      window.location.href = 'create.html';
    });
  }

  // Динамічний рендер тестів
  const topicsRoot = document.getElementById('topics-root');
  if (!topicsRoot) return;

  fetch('../data/tests.json')
    .then(res => res.json())
    .then(data => {
      topicsRoot.innerHTML = '';
      Object.entries(data).forEach(([categoryKey, categoryValue]) => {
        if (!categoryValue || typeof categoryValue !== 'object') return;
        // Пропускаємо якщо немає name
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
          card.addEventListener('click', () => {
            // Передати name, description, questions у localStorage
            const testData = {
              name: testValue.name,
              description: testValue.description,
              questions: testValue.questions
            };
            localStorage.setItem('currentTest', JSON.stringify(testData));
            window.location.href = 'tests.html';
          });
          cardsDiv.appendChild(card);
        });
        topicsRoot.appendChild(sec);
      });
    });
});
