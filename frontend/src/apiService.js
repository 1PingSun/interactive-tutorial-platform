// API 服務
const API_BASE_URL = 'http://localhost:3001';

export const apiService = {
  // 獲取所有任務
  async getTasks() {
    const response = await fetch(`${API_BASE_URL}/api/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return await response.json();
  },

  // 獲取文章內容
  async getArticle(taskId) {
    const response = await fetch(`${API_BASE_URL}/api/article/${taskId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    return await response.text();
  },

  // 獲取問題
  async getQuestions(taskId) {
    const response = await fetch(`${API_BASE_URL}/api/questions/${taskId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return await response.json();
  },

  // 獲取狀態
  async getStatus(taskId) {
    const response = await fetch(`${API_BASE_URL}/api/status/${taskId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch status');
    }
    return await response.json();
  },

  // 提交答案
  async submitAnswer(taskId, questionId, answer) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/question/${questionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit answer');
    }
    
    return await response.json();
  },

  // 重置所有狀態
  async resetAllStatus() {
    const response = await fetch(`${API_BASE_URL}/api/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset status');
    }
    
    return await response.json();
  }
};
