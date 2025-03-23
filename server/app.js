const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../operator')));
app.use(express.static(path.join(__dirname, '../driver')));
app.use(express.json());

// Ежедневный бэкап
function backupTasks() {
  const date = new Date().toISOString().split('T')[0];
  const backupFile = path.join(__dirname, `tasks_${date}.json`);
  
  if (!fs.existsSync(backupFile)) {
    fs.copyFileSync('tasks.json', backupFile);
  }
}
setInterval(backupTasks, 24 * 60 * 60 * 1000);

let tasks = [];
try {
  tasks = JSON.parse(fs.readFileSync('tasks.json'));
} catch {
  fs.writeFileSync('tasks.json', '[]');
}

// API
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const task = {
    ...req.body,
    id: Date.now(),
    timestamp: new Date().toISOString(),
    status: 'В работе'
  };
  tasks.push(task);
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  tasks = tasks.map(t => 
    t.id === parseInt(req.params.id) ? {...t, status: req.body.status} : t
  );
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));