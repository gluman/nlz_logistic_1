document.addEventListener('DOMContentLoaded', () => {
  const updateDriverTasks = async () => {
    const response = await fetch('http://localhost:3000/api/tasks');
    const tasks = await response.json();
    const now = Date.now();

    document.getElementById('driverTasks').innerHTML = tasks
      .filter(t => !t.deleted && t.status !== 'completed')
      .map(t => {
        const created = new Date(t.timestamp);
        const diff = Math.floor((now - created) / 1000);
        return `
          <div class="task-item ${diff >= 120 ? 'alert' : diff >= 60 ? 'warning' : ''}">
            <div>РМ ${t.operator} → Блок ${t.block} → Стержень ${t.rod}</div>
            <div class="timer">${Math.floor(diff/60)}:${(diff%60).toString().padStart(2, '0')}</div>
            <button class="complete-btn" data-id="${t.id}">✅ Выполнено</button>
          </div>
        `;
      }).join('');

    document.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await fetch(`http://localhost:3000/api/tasks/${btn.dataset.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' })
        });
        updateDriverTasks();
      });
    });
  };

  setInterval(updateDriverTasks, 1000);
  updateDriverTasks();
});