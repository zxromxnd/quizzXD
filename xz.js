// xz.js — логіка квізу (перенесено з inline-скрипта)
(() => {
	const dataEl = document.getElementById('quiz-data');
	let data = { questions: [] };
	try { data = JSON.parse(dataEl.textContent); } catch (e) { console.warn('invalid quiz-data'); }

	const choicesEl = document.getElementById('choices');
	const qText = document.getElementById('question-text');
	const qNumber = document.getElementById('q-number');
	const progressBar = document.getElementById('progress-bar');
	const prevBtn = document.getElementById('prev-btn');
	const nextBtn = document.getElementById('next-btn');
	const resultsEl = document.getElementById('results');
	const scoreEl = document.getElementById('score');
	const summaryEl = document.getElementById('summary');

	let index = 0;
	const answers = new Array(data.questions.length).fill(null);

	function render() {
		const q = data.questions[index];
		if (!q) return;
		qText.textContent = q.text;
		qNumber.textContent = (index + 1) + '/' + data.questions.length;
		choicesEl.innerHTML = '';
		q.options.forEach((opt, i) => {
			const li = document.createElement('li');
			li.className = 'choice';
			li.setAttribute('role', 'button');
			li.tabIndex = 0;
			li.dataset.index = i;
			li.innerHTML = '<span class="label">' + String.fromCharCode(65 + i) + '.</span> <span class="detail">' + opt + '</span>';
			if (answers[index] === i) li.classList.add('selected');
			li.addEventListener('click', () => select(i));
			li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); } });
			choicesEl.appendChild(li);
		});
		prevBtn.disabled = index === 0;
		nextBtn.textContent = index === data.questions.length - 1 ? 'Завершити' : 'Далі';
		const pct = Math.round((index / data.questions.length) * 100);
		progressBar.style.width = pct + '%';
	}

	function select(optionIdx) {
		answers[index] = optionIdx;
		Array.from(choicesEl.children).forEach(li => {
			li.classList.toggle('selected', Number(li.dataset.index) === optionIdx);
		});
	}

	prevBtn.addEventListener('click', () => { if (index > 0) { index--; render(); } });
	nextBtn.addEventListener('click', () => {
		if (index < data.questions.length - 1) { index++; render(); return; }
		// завершення — підрахунок
		let correct = 0;
		data.questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
		document.getElementById('question-card').classList.add('hidden');
		resultsEl.classList.remove('hidden');
		resultsEl.setAttribute('aria-hidden', 'false');
		scoreEl.textContent = correct + ' / ' + data.questions.length;
		summaryEl.textContent = 'Ви відповіли правильно на ' + correct + ' з ' + data.questions.length + ' питань.';
	});

	document.getElementById('restart-btn').addEventListener('click', () => {
		answers.fill(null); index = 0; resultsEl.classList.add('hidden'); document.getElementById('question-card').classList.remove('hidden'); render();
	});

	// початковий рендер
	if (data.questions.length === 0) { qText.textContent = 'Питань немає.'; nextBtn.disabled = true; }
	render();

})();
