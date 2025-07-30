const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getAllTasks } = require('./controllers/tasksController');
const { getArticleByTaskId } = require('./controllers/articlesController');
const { getQuestionsByTaskId } = require('./controllers/questionsController');
const { getQuestionStatusByTaskId } = require('./controllers/statusController');
const { checkAnswer } = require('./controllers/answerController');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/tasks', getAllTasks);
app.get('/api/article/:taskid', getArticleByTaskId);
app.get('/api/questions/:taskid', getQuestionsByTaskId);
app.get('/api/status/:taskid', getQuestionStatusByTaskId);
app.post('/api/tasks/:taskid/question/:questionid', checkAnswer);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`The backend server is on http://localhost:${PORT}`);
});

module.exports = app;

/*
GET /api/tasks
GET /api/article/:taskid
GET /api/questions/:taskid
GET /api/status/:taskid
POST /api/tasks/:taskid/question/:questionid
*/