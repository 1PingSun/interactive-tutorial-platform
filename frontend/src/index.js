import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AnswerBox from './AnswerBox';
import Navbar from './Navbar';
import yaml from 'js-yaml';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    fetch('/config.yml')
      .then(response => response.text())
      .then(yamlText => {
        const config = yaml.load(yamlText);
        setTasks(config.tasks);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading config:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
  <div>
      <div>
        <Navbar />
      </div>

      {tasks.map(task => (
        <AnswerBox key={task.taskID} taskData={task} />
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
