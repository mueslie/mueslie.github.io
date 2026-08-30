// Rendering: turns the current tasks + route into DOM. No state lives here.
(function () {
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));

  function taskRow(task) {
    return `
      <article class="item ${task.done ? 'done' : ''}">
        <input type="checkbox" aria-label="Toggle ${esc(task.title)}" data-toggle="${esc(task.id)}" ${task.done ? 'checked' : ''}>
        <div class="grow">
          <div class="item-title">${esc(task.title)}</div>
          ${task.dueDate ? `<div class="muted">Due ${esc(task.dueDate)}</div>` : ''}
        </div>
        <div class="actions">
          <button type="button" class="danger" data-delete="${esc(task.id)}">Delete</button>
        </div>
      </article>`;
  }

  function render(route) {
    const total = Todo.tasks.all().length;
    document.getElementById('count').textContent = total + (total === 1 ? ' task' : ' tasks');

    document.querySelectorAll('[data-route]').forEach((button) => {
      button.className = button.dataset.route === route ? '' : 'secondary';
    });

    const visible = Todo.tasks.forRoute(route);
    document.getElementById('tasks').innerHTML = visible.length
      ? visible.map(taskRow).join('')
      : `<div class="empty">${route === '/done' ? 'Nothing completed yet.' : 'Your list is clear.'}</div>`;
  }

  function setStatus(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = message ? 'muted error' : 'muted';
  }

  globalThis.Todo = Object.assign(globalThis.Todo || {}, { view: { render, setStatus } });
})();
