document.addEventListener('DOMContentLoaded', () => {
    let selectedOperator = null;
    let selectedBlock = null;
    let selectedRod = null;
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-list';
    document.body.appendChild(tasksContainer);

    // Выбор элементов
    document.querySelectorAll('.operator').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.operator').forEach(o => o.classList.remove('selected'));
            el.classList.add('selected');
            selectedOperator = el.textContent;
            checkSelection();
        });
    });

    document.querySelectorAll('.block').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.block').forEach(b => b.classList.remove('selected'));
            el.classList.add('selected');
            selectedBlock = el.textContent;
            checkSelection();
        });
    });

    document.querySelectorAll('.num_st').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.num_st').forEach(r => r.classList.remove('selected'));
            el.classList.add('selected');
            selectedRod = el.textContent;
            checkSelection();
        });
    });

    function checkSelection() {
        if(selectedOperator && selectedBlock && selectedRod) {
            addTask();
            clearSelection();
        }
    }

    function addTask() {
        const taskId = Date.now();
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div>
                <strong>${selectedOperator}</strong> → 
                Блок: ${selectedBlock} → 
                Стержень: ${selectedRod}
            </div>
            <div class="timer" data-start="${taskId}">0:00</div>
            <button class="remove-btn">Удалить</button>
        `;

        taskElement.querySelector('.remove-btn').addEventListener('click', () => {
            taskElement.remove();
        });

        // Таймер
        const timerElement = taskElement.querySelector('.timer');
        setInterval(() => {
            const seconds = Math.floor((Date.now() - taskId) / 1000);
            timerElement.textContent = `${Math.floor(seconds/60)}:${(seconds%60).toString().padStart(2, '0')}`;
        }, 1000);

        tasksContainer.appendChild(taskElement);
    }

    function clearSelection() {
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        selectedOperator = null;
        selectedBlock = null;
        selectedRod = null;
    }
});