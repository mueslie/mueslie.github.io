// Wiring: boots once the Dapp SDK is ready and connects DOM events to Todo.tasks.
(function () {
  let route = '/';
  const rerender = () => Todo.view.render(route);

  Dapp.onReady(async () => {
    route = $router.current();
    $router.subscribe((next) => {
      route = next;
      rerender();
    });
    await Todo.tasks.watch(rerender);
  });

  // Route tabs — only routes declared in manifest.yaml are accepted by $router.
  document.querySelector('.nav').addEventListener('click', (event) => {
    const target = event.target.dataset.route;
    if (target) $router.navigate(target);
  });

  document.getElementById('add-task').addEventListener('click', async () => {
    const title = document.getElementById('title');
    const due = document.getElementById('due');
    if (!title.reportValidity()) return;
    try {
      await Todo.tasks.add(title.value.trim(), due.value);
      title.value = '';
      due.value = '';
      title.focus();
      Todo.view.setStatus('');
    } catch (error) {
      Todo.view.setStatus(error instanceof Error ? error.message : String(error));
    }
  });

  document.getElementById('tasks').addEventListener('click', async (event) => {
    const { toggle, delete: remove } = event.target.dataset;
    if (remove) await Todo.tasks.remove(remove);
    if (toggle) await Todo.tasks.toggle(toggle);
  });
})();
