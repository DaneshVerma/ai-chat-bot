import React from "react";

export default function ChatMain({
  activeChatId,
  messages,
  input,
  setInput,
  onSend,
  onKeyDown,
  textareaRef,
  scrollRef,
  isThinking,
}) {
  return (
    <main className='chat-main'>
      {!activeChatId ? (
        <div className='empty-state'>
          <h1>ToolLiteAi</h1>
          <p>
            Select a chat from the left sidebar or start a new one to begin your
            conversation. Your messages will appear here.
          </p>
          <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
            Tip: Press Enter to send and Shift+Enter for a new line.
          </p>
        </div>
      ) : (
        <>
          <div className='chat-scroll' ref={scrollRef}>
            {messages
              .filter((m) => m.chat === activeChatId)
              .map((msg) => (
                <div
                  key={msg._id}
                  className={`message-block ${msg.role === 'user' ? 'user' : 'ai'}`}
                >
                  <div className={`avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className={`message-content ${msg.role === 'user' ? 'user' : 'ai'}`}>
                    <p>{msg.content}</p>
                    <div className='message-meta'>
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className='chat-input-bar'>
            <div className='input-shell-wide'>
              <textarea
                ref={textareaRef}
                className='chat-textarea'
                placeholder='Message...'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
              />
              <button
                className='send-btn'
                disabled={!input.trim() || isThinking}
                onClick={onSend}
              >
                Send
              </button>
            </div>
            <div className='token-hint'>
              Enter to send • Shift+Enter = newline
            </div>
          </div>
        </>
      )}
    </main>
  );
}
