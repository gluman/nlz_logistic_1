const express = require('express');
const cors = require('cors'); // Добавлен CORS
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Настройка CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.options('*', cors()); // Обработка предварительных запросов

app.use(express.static(path.join(__dirname, '../operator')));
app.use(express.static(path.join(__dirname, '../driver')));
app.use(express.json());

// Ежедневный бэкап
function backupTasks() {
  const date = new Date().toISOString().split('T')[0];
  const backupPath = path.join(__dirname, `tasks_${date}.json`);
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync('tasks.json', backupPath);
  }
}
setInterval(backupTasks, 24 * 60 * 60 * 1000);

let tasks = [];
try {
  tasks = JSON.parse(fs.readFileSync('tasks.json'));
} catch {
  fs.writeFileSync('tasks.json', '[]');
}

// API Endpoints
app.get('/api/tasks', (req, res) => {
  res.json(tasks.filter(t => !t.deleted));
});

app.post('/api/tasks', (req, res) => {
  const task = {
    ...req.body,
    id: Date.now(),
    timestamp: new Date().toISOString(),
    status: "active",
    deleted: false,
    completedAt: null
  };
  tasks.push(task);
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  tasks = tasks.map(t => {
    if (t.id === parseInt(req.params.id)) {
      return { 
        ...t, 
        status: req.body.status,
        completedAt: req.body.status === "completed" ? new Date().toISOString() : null
      };
    }
    return t;
  });
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
  res.sendStatus(200);
});

app.delete('/api/tasks/:id', (req, res) => {
  tasks = tasks.map(t => 
    t.id === parseInt(req.params.id) ? { ...t, deleted: true } : t
  );
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
  res.sendStatus(200);
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер доступен по адресу: http://192.168.0.156:${PORT}`);
  console.log(`Локальный доступ: http://localhost:${PORT}`);
});