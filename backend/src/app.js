const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中介軟體
app.use(cors());
app.use(express.json());

// 基本路由測試
app.get('/', (req, res) => {
  res.json({ message: '後端 API 正常運行！' });
});

// 測試用的 API
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '這是測試 API',
    timestamp: new Date().toISOString()
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '伺服器內部錯誤' });
});

app.listen(PORT, () => {
  console.log(`🚀 後端伺服器運行在 http://localhost:${PORT}`);
});

module.exports = app;