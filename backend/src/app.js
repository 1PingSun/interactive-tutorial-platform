const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


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
GET /api/questions
GET /api/status/questions
POST /api/tasks/:taskid/question/:questionid
*/