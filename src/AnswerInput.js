import React from 'react';
import './AnswerInput.css';

const Input = ({ placeholder = "Type your text" }) => {
  return (
    <div className="form">
      <input className="input" placeholder={placeholder} required type="text" />
      <span className="input-border" />
    </div>
  );
}

export default Input;
