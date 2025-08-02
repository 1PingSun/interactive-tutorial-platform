import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const SubmitBtn = ({ questionId, onSubmit, disabled = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef(null);

  const handleClick = async () => {
    // 找到同級的輸入框
    const inputElement = document.querySelector(`input[data-question-id="${questionId}"]`) ||
                        // 備用方案：找最近的輸入框
                        inputRef.current?.closest('.question-block')?.querySelector('input');
    
    if (!inputElement) {
      console.error('Could not find input element');
      return;
    }

    const userAnswer = inputElement.value.trim();
    
    if (!userAnswer) {
      setFeedback('請輸入答案');
      return;
    }

    setIsSubmitting(true);
    setFeedback('');

    try {
      const result = await onSubmit(questionId, userAnswer);
      
      if (result.correct) {
        setFeedback('✓ 答案正確！');
        inputElement.disabled = true;
        inputElement.style.backgroundColor = '#565b65';
      } else {
        setFeedback('✗ 答案錯誤，請再試一次');
        inputElement.focus();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedback('提交失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledWrapper ref={inputRef}>
      <button 
        onClick={handleClick} 
        disabled={disabled || isSubmitting}
        style={{
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 74 74" height={34} width={34}>
          <circle strokeWidth={3} stroke="black" r="35.5" cy={37} cx={37} />
          <path fill="black" d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z" />
        </svg>
      </button>
      {feedback && (
        <div style={{
          fontSize: '14px',
          marginTop: '5px',
          color: feedback.includes('✓') ? 'green' : 'red'
        }}>
          {feedback}
        </div>
      )}
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  
  button {
    cursor: pointer;
    font-weight: 700;
    transition: all 0.2s;
    padding: 8px 12px;
    border-radius: 100px;
    background: #cfef00;
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    font-size: 16px;
  }

  button:hover:not(:disabled) {
    background: #c4e201;
  }

  button > svg {
    width: 16px;
    margin-left: 8px;
    transition: transform 0.3s ease-in-out;
  }

  button:hover:not(:disabled) svg {
    transform: translateX(5px);
  }

  button:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export default SubmitBtn;
