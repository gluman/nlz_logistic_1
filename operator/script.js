document.addEventListener('DOMContentLoaded', () => {
  let selectedOperator = null;
  let selectedBlock = null;

  // Выбор РМ
  document.querySelectorAll('.operator').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.operator').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      selectedOperator = el.getAttribute('value');
    });
  });

  // Выбор блока
  document.querySelectorAll('.block').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.block').forEach(b => b.classList.remove('selected'));
      el.classList.add('selected');
      selectedBlock = el.getAttribute('value');
    });
  });

  // Создание задания
  document.querySelectorAll('.num_st').forEach(el => {
    el.addEventListener('click', async () => {
      if (!selectedOperator || !selectedBlock) {
        alert('Сначала выберите РМ и блок!');
        return;
      }

      const response = await fetch('http://192.168.0.156:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator: selectedOperator,
          block: selectedBlock,
          rod: el.textContent.trim()
        })
      });

      if (response.ok) {
        alert('Задание создано!');
        updateOperatorTasks();
      }
    });
  });

  // Обновление списка заданий
  const updateOperatorTasks = async () => {
    const response = await fetch('http://192.168.0.156:3000/api/tasks');
    const tasks = await response.json();
    const now = Date.now();

    const timeDelta = now - serverTime;

    document.getElementById('operatorTasks').innerHTML = tasks
      .filter(t => !t.deleted && t.status === 'active')
      .map(t => {
        const created = new Date(t.timestamp).getTime();
        const diff = Math.max(0, Math.floor((now - created - timeDelta) / 1000));
        
        return `
          <div class="task-item">
            <div>РМ ${t.operator} → Блок ${t.block} → Стержень ${t.rod}</div>
            <div class="timer">${Math.floor(diff/60).toString().padStart(2, '0')}:${(diff%60).toString().padStart(2, '0')}</div>
            <button class="delete-btn" data-id="${t.id}">❌ Удалить</button>
          </div>
        `;
      }).join('');

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await fetch(`http://192.168.0.156:3000/api/tasks/${btn.dataset.id}`, { method: 'DELETE' });
        updateOperatorTasks();
      });
    });
  };

  setInterval(updateOperatorTasks, 1000);
  updateOperatorTasks();
});