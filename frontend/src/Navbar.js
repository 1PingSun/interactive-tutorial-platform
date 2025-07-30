import React from 'react';
import './Navbar.css'; 

function Navbar() {
  return (
    <div className="nav">
      <div className="container">
        <div className="btn">Learn</div>
        <div className="btn">Challenge</div>
        <div className="btn">Contact</div>
        <div className="btn">About</div>
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