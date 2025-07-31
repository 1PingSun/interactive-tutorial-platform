import React, { useState, useEffect } from 'react';
import "./AnswerBox.css";
import Checkbox from "./CheckBox";
import AnswerInput from './AnswerInput';
import SubmitBtn from './SubmitBtn';
import { marked } from 'marked';
import { apiService } from './apiService';

function AnswerBox({ taskData }) {
    const [isActive, setIsActive] = useState(false);
    const [article, setArticle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [questionStatus, setQuestionStatus] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 並行獲取文章內容、問題和狀態
        Promise.all([
            apiService.getArticle(taskData.id),
            apiService.getQuestions(taskData.id),
            apiService.getStatus(taskData.id)
        ])
        .then(([articleContent, questionsData, statusData]) => {
            setArticle(articleContent);
            setQuestions(questionsData.questions);
            setQuestionStatus(statusData.questions);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error loading task data:', error);
            setLoading(false);
        });
    }, [taskData.id]);

    const handleArrowClick = () => {
        setIsActive(!isActive);
    };

    const handleAnswerSubmit = async (questionId, userAnswer) => {
        try {
            const result = await apiService.submitAnswer(taskData.id, questionId, userAnswer);
            
            if (result.correct) {
                // 更新本地狀態
                setQuestionStatus(prev => 
                    prev.map(q => 
                        q.id === questionId 
                            ? { ...q, status: 'done' }
                            : q
                    )
                );
            }
            return result;
        } catch (error) {
            console.error('Error submitting answer:', error);
            throw error;
        }
    };

    // 檢查所有問題是否都完成
    const isTaskCompleted = questionStatus.length > 0 && 
                           questionStatus.every(q => q.status === 'done');

    if (loading) {
        return (
            <div className="answer-box">
                <div className="header">
                    <h2 className="task-count">Task {taskData.order_index}</h2>
                    <h2 className="task-title">{taskData.title}</h2>
                </div>
                <div className="content">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    const descriptionHtml = marked(article);

    return (
        <div className="answer-box">
            <div className="header" onClick={handleArrowClick}>
                <h2 className="task-count">Task {taskData.order_index}</h2>
                <Checkbox checked={isTaskCompleted} />
                <h2 className="task-title">{taskData.title}</h2>
                <div className={`arrow-down ${isActive ? 'active' : ''}`}></div>
            </div>
            <div className={`content ${isActive ? 'active' : ''}`}>
                <div className="content-container">
                    <div className="description">
                        <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                    </div>
                    <hr />
                    <div className="quiz">
                        {questions.map((questionData, index) => {
                            const status = questionStatus.find(s => s.id === questionData.id);
                            const isCompleted = status?.status === 'done';
                            
                            return (
                                <div key={questionData.id} className="question-block">
                                    <div className="question">
                                        <p>
                                            <strong>問題 {questionData.order_index}:</strong> 
                                            {questionData.question}
                                            {isCompleted && <span style={{color: 'green', marginLeft: '10px'}}>✓</span>}
                                        </p>
                                    </div>
                                    <div className="answer">
                                        <AnswerInput 
                                            placeholder="請輸入答案..."
                                            questionId={questionData.id}
                                            disabled={isCompleted}
                                            data-question-id={questionData.id}
                                        />
                                        <SubmitBtn 
                                            questionId={questionData.id}
                                            onSubmit={handleAnswerSubmit}
                                            disabled={isCompleted}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnswerBox;