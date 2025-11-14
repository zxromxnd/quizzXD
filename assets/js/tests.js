document.addEventListener('DOMContentLoaded', () => {
    const testData = JSON.parse(localStorage.getItem('currentTest'));
    if (!testData) {
        document.body.innerHTML = '<div style="text-align:center;margin-top:3em;font-size:1.3em">Дані тесту не знайдено :(</div>';
        return;
    }

    document.getElementById('test-name').textContent = testData.name || '';
    document.getElementById('test-desc').textContent = testData.description || '';

    const questionsList = document.getElementById('questions-list');
    questionsList.innerHTML = '';

    const resultsShown = { value: false };

    // Допоміжна функція: чи вважаємо опцію правильною
    function isOptionCorrect(opt) {
        if (!opt) return false;
        // різні можливі позначення правильної відповіді
        return opt.correct === true
            || opt.isCorrect === true
            || opt.answer === true
            || opt.is_correct === true
            || opt.correct === 'true'
            || opt.isCorrect === 'true'
            || opt.answer === 'true';
    }

    // Побудова питань
    if (testData.questions) {
        const qValues = Object.values(testData.questions);
        qValues.forEach((q, qIdx) => {
            const qCard = document.createElement('div');
            qCard.className = 'question-card';
            qCard.dataset.qidx = qIdx;

            const title = document.createElement('div');
            title.className = 'question-title';
            title.textContent = `${qIdx + 1}. ${q.question || ''}`;
            qCard.appendChild(title);

            const optionsList = document.createElement('div');
            optionsList.className = 'options-list';

            if (q.options) {
                const opts = Object.values(q.options);
                opts.forEach((opt, oIdx) => {
                    const optDiv = document.createElement('div');
                    optDiv.className = 'option-item';
                    optDiv.dataset.qidx = qIdx;
                    optDiv.dataset.oidx = oIdx;
                    optDiv.tabIndex = 0;
                    // відображаємо текст — якщо опція об'єкт з name, беремо name, інакше саму опцію
                    optDiv.textContent = (typeof opt === 'object' && opt !== null) ? (opt.name || opt.label || String(opt)) : String(opt);

                    // Клік/натискання — вибір відповіді (тільки поки не показано результати)
                    optDiv.addEventListener('click', () => {
                        if (resultsShown.value) return;
                        // знімаємо вибір в поточному питанні
                        const siblings = optionsList.querySelectorAll('.option-item');
                        siblings.forEach(s => {
                            s.classList.remove('selected');
                            s.style.outline = '';
                        });
                        optDiv.classList.add('selected');
                        optDiv.style.outline = '2px solid #007bff33';
                    });
                    optDiv.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            optDiv.click();
                        }
                    });

                    optionsList.appendChild(optDiv);
                });
            }

            qCard.appendChild(optionsList);
            questionsList.appendChild(qCard);
        });
    }

    // Кнопка показу результатів і блок для повідомлення
    const controls = document.createElement('div');
    controls.style.marginTop = '1.2em';
    controls.style.textAlign = 'center';

    const btn = document.createElement('button');
    btn.id = 'show-results';
    btn.textContent = 'Показати результати';
    btn.style.padding = '0.6em 1em';
    btn.style.fontSize = '1em';
    btn.style.cursor = 'pointer';
    btn.style.border = '1px solid #444';
    btn.style.borderRadius = '6px';
    btn.style.background = '#fff';

    const resultBox = document.createElement('div');
    resultBox.id = 'result-box';
    resultBox.style.marginTop = '0.8em';
    resultBox.style.fontSize = '1.05em';

    controls.appendChild(btn);
    controls.appendChild(resultBox);
    questionsList.parentNode.appendChild(controls);

    // Показ результатів
    btn.addEventListener('click', () => {
        if (resultsShown.value) return;
        resultsShown.value = true;

        let total = 0;
        let correctCount = 0;

        const qCards = document.querySelectorAll('.question-card');
        qCards.forEach((qCard) => {
            const qIdx = Number(qCard.dataset.qidx);
            const qObj = Object.values(testData.questions)[qIdx];
            const optsArr = Object.values(qObj.options || {});
            total += 1;

            const optDivs = qCard.querySelectorAll('.option-item');
            let selectedIdx = -1;
            optDivs.forEach(od => {
                if (od.classList.contains('selected')) selectedIdx = Number(od.dataset.oidx);
            });

            // позначення правильних/неправильних
            optDivs.forEach(od => {
                const oIdx = Number(od.dataset.oidx);
                const optObj = optsArr[oIdx];
                const correct = isOptionCorrect(optObj);

                // стиль правильних
                if (correct) {
                    od.classList.add('correct');
                    od.style.background = '#d4edda'; // світло-зелений
                    od.style.border = '1px solid #28a74533';
                }

                // якщо вибрано неправильну відповідь — підсвітити в червоний
                if (oIdx === selectedIdx && !correct) {
                    od.classList.add('incorrect');
                    od.style.background = '#f8d7da'; // світло-червоний
                    od.style.border = '1px solid #dc354533';
                }

                // трохи затемнити невибрані неправильні варіанти
                if (!correct && oIdx !== selectedIdx) {
                    od.style.opacity = '0.9';
                }
                // відключаємо подальші кліки
                od.style.pointerEvents = 'none';
            });

            // врахування балів: правильний тільки якщо вибрану опцію позначено як correct
            if (selectedIdx >= 0) {
                const selOpt = optsArr[selectedIdx];
                if (isOptionCorrect(selOpt)) correctCount += 1;
            }
        });

        resultBox.textContent = `Ваш результат: ${correctCount} / ${total}`;
        // додатково показати відсоток
        const percent = Math.round((correctCount / Math.max(total,1)) * 100);
        resultBox.textContent += ` — ${percent}%`;
        btn.textContent = 'Тест пройдено';
        btn.disabled = true;
    });

});
