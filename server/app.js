const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { stringify } = require('csv-stringify');
const app = express();

// Загрузка настроек сети из config.json
const config = JSON.parse(fs.readFileSync('config.json'));
const { ip, port } = config.server;

// Настройка CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.options('*', cors());

app.use(express.static(path.join(__dirname, '../operator')));
app.use(express.static(path.join(__dirname, '../driver')));
app.use(express.json());

// Загрузка настроек времени
const timeSettings = JSON.parse(fs.readFileSync('timeSettings.json'));

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

// Запись задач в CSV
function saveTasksToCSV() {
  const csvFilePath = path.join(__dirname, 'tasks.csv');
  const columns = [
    { key: 'block', header: 'Блок' },
    { key: 'rod', header: 'Стержень' },
    { key: 'operator', header: 'РМ' },
    { key: 'timestamp', header: 'Время создания' },
    { key: 'status', header: 'Статус' },
    { key: 'completedAt', header: 'Время завершения' }
  ];

  const writableStream = fs.createWriteStream(csvFilePath);
  const stringifier = stringify({ header: true, columns });
  tasks.forEach(task => stringifier.write(task));
  stringifier.pipe(writableStream);
}

// API Endpoints
app.get('/api/tasks', (req, res) => {
  res.json({
    tasks: tasks.filter(t => !t.deleted),
    serverTime: Date.now(),
    timeSettings // Отправляем настройки времени на фронтенд
  });
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
  saveTasksToCSV(); // Сохраняем задачи в CSV
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
  saveTasksToCSV(); // Сохраняем задачи в CSV
  res.sendStatus(200);
});

app.delete('/api/tasks/:id', (req, res) => {
  tasks = tasks.map(t => 
    t.id === parseInt(req.params.id) ? { ...t, deleted: true } : t
  );
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
  saveTasksToCSV(); // Сохраняем задачи в CSV
  res.sendStatus(200);
});

// Запуск сервера с настройками из config.json
app.listen(port, ip, () => {
  console.log(`Сервер доступен по адресу: http://${ip}:${port}`);
  console.log(`Локальный доступ: http://localhost:${port}`);
});