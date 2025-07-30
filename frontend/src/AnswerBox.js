import React, { useState } from 'react';
import "./AnswerBox.css";
import Checkbox from "./CheckBox";
import AnswerInput from './AnswerInput';
import SubmitBtn from './SubmitBtn';
import { marked } from 'marked';

function AnswerBox({ taskData }) {
    const [isActive, setIsActive] = useState(false);

    const handleArrowClick = () => {
        setIsActive(!isActive);
    };

    const descriptionHtml = marked(taskData.description);

    return (
        <div className="answer-box">
            <div className="header" onClick={handleArrowClick}>
                <h2 className="task-count">Task {taskData.taskID}</h2>
                <Checkbox />
                <h2 className="task-title">{taskData.taskTitle}</h2>
                <div className={`arrow-down ${isActive ? 'active' : ''}`}></div>
            </div>
            <div className={`content ${isActive ? 'active' : ''}`}>
                <div className="content-container">
                    <div className="description">
                        <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                    </div>
                    <hr />
                    <div className="quiz">
                        {taskData.questions.map((questionData, index) => (
                            <div key={index} className="question-block">
                                <div className="question">
                                    <p><strong>問題 {index + 1}:</strong> {questionData.question}</p>
                                </div>
                                <div className="answer">
                                    <AnswerInput placeholder={questionData.placeholder} />
                                    <SubmitBtn expectedAnswer={questionData.answer} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnswerBox;