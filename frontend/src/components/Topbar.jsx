import React from "react";

export default function Topbar({ onMenuClick, onLogout, title = "ToolLiteAi" }) {
  return (
    <header className='topbar'>
      <button
        className='icon-btn menu-btn'
        aria-label='Open menu'
        onClick={onMenuClick}
      >
        ☰
      </button>
      <div className='topbar-title'>{title}</div>
      <button className='logout-btn' onClick={onLogout}>Logout</button>
    </header>
  );
}
