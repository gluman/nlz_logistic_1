document.addEventListener('DOMContentLoaded', () => {
    const updateTasks = async () => {
        const response = await fetch('http://localhost:3000/api/tasks');
        const tasks = await response.json();
        
        document.getElementById('driverTasks').innerHTML = tasks
            .filter(t => !t.completed)
            .map(t => `
                <div class="task-item driver">
                    <div>
                        РМ ${t.operator} → 
                        Блок: ${t.block} → 
                        Стержень: ${t.rod}
                    </div>
                    <div class="timer">${new Date(t.timestamp).toLocaleString()}</div>
                    <button class="complete-btn" data-id="${t.id}">✅ Выполнено</button>
                </div>
            `).join('');

        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                await fetch(`http://localhost:3000/api/tasks/${btn.dataset.id}`, {method: 'PATCH'});
                updateTasks();
            });
        });
    };

    setInterval(updateTasks, 2000);
    updateTasks();
});