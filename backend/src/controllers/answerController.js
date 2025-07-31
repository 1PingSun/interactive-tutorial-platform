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
      
      // 檢查該任務的所有問題是否都已完成
      const checkTaskQuery = `
        SELECT COUNT(*) as total_questions,
               COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_questions
        FROM questions 
        WHERE task_id = $1
      `;
      const taskResult = await pool.query(checkTaskQuery, [taskid]);
      const { total_questions, completed_questions } = taskResult.rows[0];
      
      // 如果所有問題都完成了，更新任務狀態為 'done'
      if (parseInt(total_questions) === parseInt(completed_questions)) {
        const updateTaskQuery = `
          UPDATE tasks 
          SET status = 'done' 
          WHERE id = $1
        `;
        await pool.query(updateTaskQuery, [taskid]);
      }
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

const resetAllStatus = async (req, res) => {
  try {
    // 重置所有問題狀態為 'notyet'
    const resetQuestionsQuery = `UPDATE questions SET status = 'notyet'`;
    await pool.query(resetQuestionsQuery);
    
    // 重置所有任務狀態為 'notyet'
    const resetTasksQuery = `UPDATE tasks SET status = 'notyet'`;
    await pool.query(resetTasksQuery);
    
    res.json({
      success: true,
      message: '所有問題和任務狀態已重置為 notyet'
    });
    
  } catch (error) {
    console.error('Error resetting status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset status'
    });
  }
};

module.exports = {
  checkAnswer,
  resetAllStatus
};
