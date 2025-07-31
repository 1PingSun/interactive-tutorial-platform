import React, { useState } from 'react';
import './AnswerInput.css';

const AnswerInput = ({ placeholder = "Type your text", questionId, disabled = false, onAnswerChange, ...props }) => {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onAnswerChange) {
      onAnswerChange(questionId, newValue);
    }
  };

  return (
    <div className="form">
      <input 
        className="input" 
        placeholder={placeholder} 
        required 
        type="text" 
        value={value}
        onChange={handleChange}
        disabled={disabled}
        {...props}
        style={{ 
          backgroundColor: disabled ? '#565b65' : '',
          cursor: disabled ? 'not-allowed' : 'text',
          ...props.style
        }}
      />
      <span className="input-border" />
    </div>
  );
}

export default AnswerInput;
