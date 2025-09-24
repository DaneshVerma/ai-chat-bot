import React from "react";

export default function Sidebar({
  chats = [],
  activeChatId,
  onSelectChat,
  onCreateChat,
  onLogout,
  isOpen = false,
}) {
  return (
    <aside className={`chat-sidebar ${isOpen ? "open" : ""}`}>
      <div className='sidebar-header'>
        <span>Chats</span>
        <button className='sidebar-logout-btn' onClick={onLogout}>Logout</button>
      </div>
      <button className='new-chat-btn' onClick={onCreateChat}>
        + New Chat
      </button>
      <div className='chat-list'>
        {chats.map((chat) => (
          <button
            key={chat._id}
            className={`chat-item ${chat._id === activeChatId ? "active" : ""}`}
            onClick={() => onSelectChat(chat._id)}
          >
            <span style={{ flex: 1 }}>{chat.title}</span>
          </button>
        ))}
      </div>
      <div className='sidebar-footer'>Demo chat UI • Local state only</div>
    </aside>
  );
}
