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
	if (testData.questions) {
		Object.values(testData.questions).forEach((q, idx) => {
			const qCard = document.createElement('div');
			qCard.className = 'question-card';
			qCard.innerHTML = `
				<div class="question-title">${idx + 1}. ${q.question || ''}</div>
				<div class="options-list"></div>
			`;
			const optionsList = qCard.querySelector('.options-list');
			if (q.options) {
				Object.values(q.options).forEach(opt => {
					const optDiv = document.createElement('div');
					optDiv.className = 'option-item';
					optDiv.textContent = opt.name;
					optionsList.appendChild(optDiv);
				});
			}
			questionsList.appendChild(qCard);
		});
	}
});
