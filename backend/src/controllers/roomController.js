const fs = require('fs').promises;
const path = require('path');
const pool = require('../utils/database');

const getRoomInfo = async (req, res) => {
  try {
    const { roomid } = req.params;
    
    // 從資料庫獲取房間資訊
    const roomQuery = `
      SELECT id, room_id, name, file_path 
      FROM rooms 
      WHERE room_id = $1
    `;
    const roomResult = await pool.query(roomQuery, [roomid]);
    
    let title, markdownContent;
    
    const room = roomResult.rows[0];
    title = room.name;
    try {
        const filePath = path.join(__dirname, '../../content/articles', room.file_path);
        markdownContent = await fs.readFile(filePath, 'utf8');
        
        // 直接回應 markdown 內容
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.send(markdownContent);
        return;
    } catch (fileError) {
        console.error('Error reading markdown file:', fileError);
        res.status(404).setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.send('# 錯誤\n\n找不到指定的文件。');
        return;
    }
    
  } catch (error) {
    console.error('Error getting room info:', error);
    res.status(500).json({ 
      error: 'Failed to get room information',
      title: 'Error',
      content: '# 錯誤\n\n無法載入房間資訊，請稍後再試。'
    });
  }
};

module.exports = {
  getRoomInfo
};
