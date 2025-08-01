const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getAllTasks } = require('./controllers/tasksController');
const { getArticleByTaskId } = require('./controllers/articlesController');
const { getQuestionsByTaskId } = require('./controllers/questionsController');
const { getQuestionStatusByTaskId } = require('./controllers/statusController');
const { checkAnswer, resetAllStatus } = require('./controllers/answerController');
const { getRoomInfo } = require('./controllers/roomController');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/room/:roomid', getRoomInfo);
app.get('/api/tasks', getAllTasks);
app.get('/api/article/:taskid', getArticleByTaskId);
app.get('/api/questions/:taskid', getQuestionsByTaskId);
app.get('/api/status/:taskid', getQuestionStatusByTaskId);
app.post('/api/tasks/:taskid/question/:questionid', checkAnswer);
app.post('/api/reset', resetAllStatus);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`The backend server is on http://localhost:${PORT}`);
});

module.exports = app;