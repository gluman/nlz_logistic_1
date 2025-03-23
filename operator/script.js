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

  // Выбор стержня
  document.querySelectorAll('.num_st').forEach(el => {
    el.addEventListener('click', async () => {
      if (!selectedOperator || !selectedBlock) {
        alert('Сначала выберите РМ и блок!');
        return;
      }

      document.querySelectorAll('.num_st').forEach(r => r.classList.remove('selected'));
      el.classList.add('selected');
      
      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          operator: selectedOperator,
          block: selectedBlock,
          rod: el.textContent
        })
      });

      if (response.ok) {
        alert('Задание создано!');
        el.classList.remove('selected');
      }
    });
  });

  // Экспорт
  document.getElementById('exportOperatorBtn').addEventListener('click', () => {
    const csv = tasks.map(t => 
      `${t.operator},${t.block},${t.rod},${t.status},${new Date(t.timestamp).toLocaleString()}`
    ).join('\n');
    
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  });
});