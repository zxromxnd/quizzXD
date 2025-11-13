document.addEventListener('DOMContentLoaded', () => {
// ... existing code ...
const form = document.getElementById('create-form');
if (!form) return;

const storageKey = 'userQuizzes';
const addQuestionBtn = document.getElementById('add-question');
const questionsList = document.getElementById('questions-list');
const titleInput = document.getElementById('quiz-title');
const descInput = document.getElementById('quiz-desc');
let questionCounter = 0;

const createOptionRow = (questionId, optionIndex) => {
  const row = document.createElement('div');
  row.className = 'option-row';
  row.innerHTML = `
    <input type="radio" name="correct-${questionId}" class="correct-radio" value="${optionIndex}" ${optionIndex === 0 ? 'checked' : ''}>
    <input type="text" class="option-input" placeholder="Варіант відповіді" required>
  `;
  return row;
};

const createQuestionBlock = () => {
  const questionId = questionCounter++;
  const wrapper = document.createElement('div');
  wrapper.className = 'question-item';
  wrapper.dataset.questionId = String(questionId);
  wrapper.innerHTML = `
    <label>Питання</label>
    <input type="text" class="question-text" placeholder="Введіть текст питання" required>
    <div class="options-grid"></div>
    <button type="button" class="btn small danger remove-question">Видалити питання</button>
  `;

  const optionsGrid = wrapper.querySelector('.options-grid');
  optionsGrid.appendChild(createOptionRow(questionId, 0));
  optionsGrid.appendChild(createOptionRow(questionId, 1));

  const removeBtn = wrapper.querySelector('.remove-question');
  removeBtn.addEventListener('click', () => {
    wrapper.remove();
  });

  return wrapper;
};

const addQuestion = () => {
  const block = createQuestionBlock();
  questionsList.appendChild(block);
};

if (addQuestionBtn && questionsList) {
  addQuestionBtn.addEventListener('click', addQuestion);
  addQuestion();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = titleInput.value.trim();
  const description = descInput.value.trim();
  const questionItems = Array.from(questionsList.querySelectorAll('.question-item'));

  if (!name) {
    alert('Будь ласка, введіть назву квізу.');
    return;
  }

  if (questionItems.length === 0) {
    alert('Додайте хоча б одне питання.');
    return;
  }

  const questions = [];
  let hasValidationError = false;

  questionItems.forEach((item, qIndex) => {
    const questionTextEl = item.querySelector('.question-text');
    const optionsRows = Array.from(item.querySelectorAll('.option-row'));

    const questionText = questionTextEl?.value.trim();
    if (!questionText) {
      hasValidationError = true;
      questionTextEl?.focus();
      alert('У кожного питання має бути текст.');
      return;
    }

    const options = [];
    let hasCorrect = false;

    optionsRows.forEach((row, optIndex) => {
      const optionInput = row.querySelector('.option-input');
      const optionValue = optionInput?.value.trim();
      const isCorrect = row.querySelector('.correct-radio')?.checked ?? false;

      if (!optionValue) {
        hasValidationError = true;
        optionInput?.focus();
        alert('Будь ласка, заповніть усі варіанти відповідей.');
        return;
      }

      if (isCorrect) {
        hasCorrect = true;
      }

      options.push({
        name: optionValue,
        answer: isCorrect,
      });
    });

    if (hasValidationError) {
      return;
    }

    if (!hasCorrect) {
      hasValidationError = true;
      alert('Виберіть правильну відповідь для кожного питання.');
      return;
    }

    const optionsObj = {};
    options.forEach((opt, index) => {
      optionsObj[`id_${index}`] = opt;
    });

    questions.push({
      id: `id_${qIndex}`,
      question: questionText,
      options: optionsObj,
    });
  });

  if (hasValidationError) {
    return;
  }

  const questionsObj = {};
  questions.forEach((question, index) => {
    questionsObj[`id_${index}`] = question;
  });

  const newQuiz = {
    id: `user_${Date.now()}`,
    name,
    description,
    questions: questionsObj,
    createdAt: new Date().toISOString(),
  };

  const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
  existing.push(newQuiz);
  localStorage.setItem(storageKey, JSON.stringify(existing));

  form.reset();
  questionsList.innerHTML = '';
  questionCounter = 0;
  addQuestion();

  alert('Квіз успішно збережено! Його можна знайти на головній сторінці в розділі "Тести від користувачів".');
  window.location.href = 'index.html';
});
});
