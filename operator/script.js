document.addEventListener('DOMContentLoaded', () => {
    let selectedOperator = null;
    let selectedBlock = null;
    let selectedRod = null;

    document.querySelectorAll('.operator').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.operator').forEach(o => o.classList.remove('selected'));
            el.classList.add('selected');
            selectedOperator = el.getAttribute('value');
        });
    });

    document.querySelectorAll('.block').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.block').forEach(b => b.classList.remove('selected'));
            el.classList.add('selected');
            selectedBlock = el.getAttribute('value');
        });
    });

    document.querySelectorAll('.num_st').forEach(el => {
        el.addEventListener('click', async () => {
            if (!selectedOperator || !selectedBlock) {
                alert('Сначала выберите РМ и блок!');
                return;
            }

            selectedRod = el.textContent;
            const response = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({operator: selectedOperator, block: selectedBlock, rod: selectedRod})
            });

            if (response.ok) {
                alert('Задание создано!');
                document.querySelectorAll('.num_st').forEach(r => r.classList.remove('selected'));
            }
        });
    });

    document.getElementById('exportOperatorBtn').addEventListener('click', async () => {
        // ... логика экспорта ...
    });
});