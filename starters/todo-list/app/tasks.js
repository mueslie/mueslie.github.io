// State + data access: the task list mirrored from $store, and the writes.
(function () {
  let tasks = [];

  /** Snapshot of all tasks as last delivered by $store. */
  function all() {
    return tasks;
  }

  /** Tasks for a route ('/' = open, '/done' = completed), soonest due date first. */
  function forRoute(route) {
    const showDone = route === '/done';
    return tasks
      .filter((task) => Boolean(task.done) === showDone)
      .sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999')));
  }

  /** Subscribes to the collection; `onChange` runs on every synced update. */
  function watch(onChange) {
    return $store.subscribe('tasks', {}, (records) => {
      tasks = records;
      onChange();
    });
  }

  function add(title, dueDate) {
    return $store.create('tasks', { title, done: false, ...(dueDate ? { dueDate } : {}) });
  }

  function remove(id) {
    return $store.delete('tasks', id);
  }

  async function toggle(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const done = !task.done;
    await $store.update('tasks', id, { done });
    if (done) {
      await $events.publish('task.completed', {
        taskId: task.id,
        title: task.title,
        completedAt: new Date().toISOString(),
      });
    }
  }

  globalThis.Todo = Object.assign(globalThis.Todo || {}, { tasks: { all, forRoute, watch, add, remove, toggle } });
})();
