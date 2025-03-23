document.addEventListener('DOMContentLoaded', () => {
  // Загрузка настроек сети
  fetch('config.json')
    .then(response => response.json())
    .then(config => {
      const { ip, port } = config.server;
      const apiUrl = `http://${ip}:${port}/api/tasks`;

      const updateDriverTasks = async () => {
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          const pendingTasks = data.tasks.filter(t => t.status !== 'completed');
          const serverTime = data.serverTime;
          const now = Date.now();
          const timeDelta = now - serverTime;

          document.getElementById('driverTasks').innerHTML = pendingTasks
            .map(t => {
              const created = new Date(t.timestamp).getTime();
              const diff = Math.max(0, Math.floor((now - created - timeDelta) / 1000));
              const mins = Math.floor(diff / 60);
              const secs = diff % 60;

              // Используем настройки времени из timeSettings.json
              const warningTime = data.timeSettings.warningTime;
              const alertTime = data.timeSettings.alertTime;

              return `
                <div class="task-item ${diff >= alertTime ? 'alert' : diff >= warningTime ? 'warning' : ''}">
                  <div>Блок ${t.block} → Стержень ${t.rod} → РМ ${t.operator}</div>
                  <div class="timer">${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}</div>
                  <button class="complete-btn" data-id="${t.id}">✅ Выполнено</button>
                </div>
              `;
            }).join('');

          document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
              await fetch(`${apiUrl}/${btn.dataset.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' })
              });
              updateDriverTasks();
            });
          });
        } catch (error) {
          console.error('Ошибка обновления:', error);
        }
      };

      setInterval(updateDriverTasks, 1000);
      updateDriverTasks();
    })
    .catch(error => console.error('Ошибка загрузки настроек сети:', error));
});