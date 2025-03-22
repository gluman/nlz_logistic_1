const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static('../operator'));
app.use(express.static('../driver'));
app.use(express.json());

let tasks = JSON.parse(fs.readFileSync('tasks.json') || '[]');

// API Endpoints
app.get('/api/tasks', (req, res) => {
    let filteredTasks = tasks;
    if (req.query.operator) {
        filteredTasks = tasks.filter(t => t.operator === req.query.operator);
    }
    res.json(filteredTasks);
});

app.post('/api/tasks', (req, res) => {
    const task = {
        ...req.body,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        completed: false
    };
    tasks.push(task);
    saveTasks();
    res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
    tasks = tasks.map(t => 
        t.id === parseInt(req.params.id) ? {...t, completed: true} : t
    );
    saveTasks();
    res.sendStatus(200);
});

app.get('/api/export', (req, res) => {
    const csv = tasks
        .filter(t => !t.completed)
        .map(t => `${t.operator},${t.block},${t.rod},${t.timestamp}`)
        .join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('tasks.csv');
    res.send(csv);
});

function saveTasks() {
    fs.writeFileSync('tasks.json', JSON.stringify(tasks));
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));