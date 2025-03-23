document.addEventListener('DOMContentLoaded', () => {
  const updateTasks = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/tasks');
      const tasks = await response.json();
      const now = Date.now();
      
      document.getElementById('driverTasks').innerHTML = tasks.map(t => {
        const created = new Date(t.timestamp);
        const diff = Math.floor((now - created) / 1000);
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        
        return `
          <div class="task-item ${mins >= 2 ? 'alert' : mins >= 1 ? 'warning' : ''}">
            <div>РМ ${t.operator} | Блок ${t.block} | Стержень ${t.rod}</div>
            <div class="timer">${mins}:${secs.toString().padStart(2, '0')}</div>
            <button class="status-btn status-working" 
              data-id="${t.id}" 
              data-status="В работе">Работа</button>
            <button class="status-btn status-completed" 
              data-id="${t.id}" 
              data-status="Выполнено">Готово</button>
          </div>
        `;
      }).join('');

      document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          await fetch(`http://localhost:3000/api/tasks/${btn.dataset.id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: btn.dataset.status})
          });
          updateTasks();
        });
      });

    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  setInterval(updateTasks, 1000);
  updateTasks();
});