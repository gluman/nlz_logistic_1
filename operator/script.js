document.addEventListener('DOMContentLoaded', () => {
  let selectedOperator = null;
  let selectedBlock = null;

  // Загрузка настроек сети
  fetch("/config.json")
    .then(response => response.json())
    .then(config => {
      const { ip, port } = config.server;
      const apiUrl = `http://${ip}:${port}/api/tasks`;

      // Выбор РМ
      document.querySelectorAll('.operator').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          document.querySelectorAll('.operator').forEach(o => o.classList.remove('selected'));
          el.classList.add('selected');
          selectedOperator = el.getAttribute('value');
          console.log('Выбран оператор:', selectedOperator); // Логирование для отладки
        });
      });

      // Выбор блока
      document.querySelectorAll('.block').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          document.querySelectorAll('.block').forEach(b => b.classList.remove('selected'));
          el.classList.add('selected');
          selectedBlock = el.getAttribute('value');
          console.log('Выбран блок:', selectedBlock); // Логирование для отладки
        });
      });

      // Создание задания
      document.querySelectorAll('.num_st').forEach(el => {
        el.addEventListener('click', async (e) => {
          e.preventDefault();
          
          if (!selectedOperator) {
            alert('Сначала выберите РМ!');
            return;
          }
          
          if (!selectedBlock) {
            alert('Сначала выберите блок!');
            return;
          }

          const rodNumber = el.textContent.trim();
          console.log(`Попытка создания задания: РМ ${selectedOperator}, блок ${selectedBlock}, стержень ${rodNumber}`);

          try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                operator: selectedOperator,
                block: selectedBlock,
                rod: rodNumber,
                status: 'active'
              })
            });

            if (response.ok) {
              const newTask = await response.json();
              console.log('Задание создано:', newTask);
              updateOperatorTasks();
            } else {
              const error = await response.json();
              console.error('Ошибка сервера:', error);
              alert('Ошибка при создании задания: ' + (error.message || 'неизвестная ошибка'));
            }
          } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Ошибка сети при создании задания');
          }
        });
      });

      // ... остальной код (экспорт, обновление задач и т.д.)
      const updateOperatorTasks = async () => {
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          const activeTasks = data.tasks.filter(t => t.status === 'active');
          const serverTime = data.serverTime;
          const now = Date.now();
          const timeDelta = now - serverTime;

          document.getElementById('operatorTasks').innerHTML = activeTasks
            .map(t => {
              const created = new Date(t.timestamp).getTime();
              const diff = Math.max(0, Math.floor((now - created - timeDelta) / 1000));
              
              return `
                <div class="task-item">
                  <div>Блок ${t.block} → Стержень ${t.rod} → РМ ${t.operator}</div>
                  <div class="timer">${Math.floor(diff/60).toString().padStart(2, '0')}:${(diff%60).toString().padStart(2, '0')}</div>
                  <button class="delete-btn" data-id="${t.id}">❌ Удалить</button>
                </div>
              `;
            }).join('');

          document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              e.preventDefault();
              try {
                await fetch(`${apiUrl}/${btn.dataset.id}`, { method: 'DELETE' });
                updateOperatorTasks();
              } catch (error) {
                console.error('Ошибка удаления:', error);
              }
            });
          });
        } catch (error) {
          console.error('Ошибка обновления:', error);
        }
      };

      setInterval(updateOperatorTasks, 1000);
      updateOperatorTasks();
    })
    .catch(error => {
      console.error('Ошибка загрузки настроек сети:', error);
      alert('Ошибка загрузки конфигурации сервера');
    });
});

// const debugBtn = document.createElement('button');
// debugBtn.textContent = 'Проверить выбор';
// debugBtn.addEventListener('click', () => {
//   alert(`Выбрано: РМ ${selectedOperator}, Блок ${selectedBlock}`);
// });
// document.body.prepend(debugBtn);