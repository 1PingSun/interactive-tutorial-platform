const pool = require('../utils/database');

const getAllTasks = async (req, res) => {
  try {
    const query = 'SELECT id, name, order_index, status FROM tasks ORDER BY order_index ASC';
    const result = await pool.query(query);
    
    const tasks = result.rows.map(task => ({
      id: task.id,
      title: task.name,
      order_index: task.order_index,
      status: task.status
    }));
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

module.exports = {
  getAllTasks
};
