// xz.js — only minimal wiring: open editor from Create button
document.addEventListener('DOMContentLoaded', () => {
  const createBtn = document.getElementById('create-quiz');
  if (createBtn) {
	createBtn.addEventListener('click', () => {
	  window.location.href = 'create.html';
	});
  }
});
