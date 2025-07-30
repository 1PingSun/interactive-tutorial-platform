const pool = require('../utils/database');

const getQuestionsByTaskId = async (req, res) => {
  try {
    const { taskid } = req.params;
    
    // 從資料庫獲取指定任務的所有問題，按照 order_index 排序
    const query = `
      SELECT id, question_text, order_index, status 
      FROM questions 
      WHERE task_id = $1 
      ORDER BY order_index ASC
    `;
    const result = await pool.query(query, [taskid]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No questions found for this task' });
    }
    
    const questions = result.rows.map(question => ({
      id: question.id,
      question: question.question_text,
      order_index: question.order_index,
      status: question.status
    }));
    
    res.json({
      taskId: parseInt(taskid),
      questions: questions
    });
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

module.exports = {
  getQuestionsByTaskId
};
