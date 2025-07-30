const pool = require('../utils/database');

const getQuestionStatusByTaskId = async (req, res) => {
  try {
    const { taskid } = req.params;
    
    // 從資料庫獲取指定任務的所有問題狀態，按照 order_index 排序
    const query = `
      SELECT id, status, order_index 
      FROM questions 
      WHERE task_id = $1 
      ORDER BY order_index ASC
    `;
    const result = await pool.query(query, [taskid]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No questions found for this task' });
    }
    
    const questionStatus = result.rows.map(question => ({
      id: question.id,
      status: question.status,
      order_index: question.order_index
    }));
    
    // 計算整體統計
    const totalQuestions = questionStatus.length;
    const completedQuestions = questionStatus.filter(q => q.status === 'done').length;
    const completionRate = totalQuestions > 0 ? (completedQuestions / totalQuestions * 100).toFixed(1) : 0;
    
    res.json({
      taskId: parseInt(taskid),
      totalQuestions: totalQuestions,
      completedQuestions: completedQuestions,
      completionRate: parseFloat(completionRate),
      questions: questionStatus
    });
    
  } catch (error) {
    console.error('Error fetching question status:', error);
    res.status(500).json({ error: 'Failed to fetch question status' });
  }
};

module.exports = {
  getQuestionStatusByTaskId
};
