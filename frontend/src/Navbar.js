import React from 'react';
import './Navbar.css'; 
import { apiService } from './apiService';

function Navbar() {
  const handleReset = async () => {
    if (window.confirm('確定要重置所有進度嗎？這將清除所有已完成的答案。')) {
      try {
        await apiService.resetAllStatus();
        alert('重置成功！請重新整理頁面查看效果。');
        window.location.reload(); // 重新整理頁面
      } catch (error) {
        console.error('Reset failed:', error);
        alert('重置失敗，請稍後再試。');
      }
    }
  };

  return (
    <div className="nav">
      <div className="container">
        <div className="btn">Learn</div>
        <div className="btn">Challenge</div>
        <div className="btn">Contact</div>
        <div className="btn">About</div>
        <div className="btn reset-btn" onClick={handleReset}>Reset</div>
        <svg
          className="outline"
          overflow="visible"
          width="100%"
          height="60"
          viewBox="0 0 100% 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            className="rect"
            pathLength="100"
            x="0"
            y="0"
            width="100%"
            height="60"
            fill="transparent"
            strokeWidth="5"
          ></rect>
        </svg>
      </div>
    </div>
  );
}

export default Navbar;