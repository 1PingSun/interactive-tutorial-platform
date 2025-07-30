const pool = require('../utils/database');
const fs = require('fs').promises;
const path = require('path');

const getArticleByTaskId = async (req, res) => {
  try {
    const { taskid } = req.params;
    
    // 從資料庫獲取文章檔案路徑
    const query = 'SELECT file_path FROM articles WHERE task_id = $1';
    const result = await pool.query(query, [taskid]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    const filePath = result.rows[0].file_path;
    const fullPath = path.join(__dirname, '../../content/articles', filePath);
    
    // 讀取 Markdown 檔案內容
    const markdownContent = await fs.readFile(fullPath, 'utf8');
    
    // 設定正確的 Content-Type 為 text/markdown
    res.set('Content-Type', 'text/markdown; charset=utf-8');
    res.send(markdownContent);
    
  } catch (error) {
    console.error('Error fetching article:', error);
    
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Article file not found' });
    }
    
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

module.exports = {
  getArticleByTaskId
};
