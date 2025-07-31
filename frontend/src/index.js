import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AnswerBox from './AnswerBox';
import Navbar from './Navbar';
import { apiService } from './apiService';
import Intro from './Intro';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 從 API 服務獲取任務列表（包含 fallback 邏輯）
    apiService.getTasks()
      .then(tasksData => {
        setTasks(tasksData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading tasks:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px' 
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'red' 
      }}>
        Error: {error}
      </div>
    );
  }

  return (
  <div>
      <div>
        <Navbar />
      </div>

      <div>
        <Intro roomId="1" />
      </div>

      {tasks.map(task => (
        <AnswerBox key={task.id} taskData={task} />
      ))}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
