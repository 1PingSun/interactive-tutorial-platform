const pool = require('../utils/database');

const checkAnswer = async (req, res) => {
  try {
    const { taskid, questionid } = req.params;
    const { answer } = req.body;
    
    if (!answer) {
      return res.status(400).json({ 
        error: 'Answer is required',
        correct: false 
      });
    }
    
    // 從資料庫獲取問題的正確答案
    const query = `
      SELECT id, correct_answer, status 
      FROM questions 
      WHERE id = $1 AND task_id = $2
    `;
    const result = await pool.query(query, [questionid, taskid]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Question not found',
        correct: false 
      });
    }
    
    const question = result.rows[0];
    const correctAnswer = question.correct_answer;
    const userAnswer = answer.trim();
    
    // 檢查答案是否正確（不區分大小寫，去除前後空白）
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    
    // 如果答案正確，更新問題狀態為 'done'
    if (isCorrect && question.status !== 'done') {
      const updateQuery = `
        UPDATE questions 
        SET status = 'done' 
        WHERE id = $1
      `;
      await pool.query(updateQuery, [questionid]);
    }
    
    res.json({
      correct: isCorrect,
      questionId: parseInt(questionid),
      taskId: parseInt(taskid),
      userAnswer: userAnswer,
      message: isCorrect ? '答案正確！' : '答案錯誤，請再試一次。'
    });
    
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ 
      error: 'Failed to check answer',
      correct: false 
    });
  }
};

module.exports = {
  checkAnswer
};
