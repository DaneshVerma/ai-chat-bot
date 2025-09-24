import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import axios from "axios";
import { io } from "socket.io-client";
import Topbar from "../components/Topbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ChatMain from "../components/ChatMain.jsx";

export default function Home() {
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);

  const [messages, setMessages] = useState([]); // all messages across chats
  const [activeChatId, setActiveChatId] = useState(null);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const textareaRef = useRef(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 860 : false);

  const activeChat = chats.find((c) => c._id === activeChatId);

  // === Create Chat ===
  function createChat() {
    const chatTitle = prompt("Enter chat title:");
    if (!chatTitle) return;

    axios
      .post("/api/chats", { title: chatTitle }, { withCredentials: true })
      .then((res) => {
        setChats((prev) => [res.data.chat, ...prev]);
      })
      .catch((err) => console.error("Error creating chat:", err));
  }

  // === Logout ===
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (e) {
      // ignore errors; still navigate away
    } finally {
      navigate("/login", { replace: true });
    }
  };

  // === Add message helper ===
  const addMessage = (role, content, _id, chatId = activeChatId) => {
    const newMsg = { role, content, _id, chat: chatId };
    setMessages((prev) => [...prev, newMsg]);
  };

  // === Handle Send ===
  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    addMessage("user", trimmed);

    socket.emit("ai-message", { chat: activeChatId, text: trimmed });

    setInput("");
  }

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [input]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, isThinking]);

  // Autofocus the input when a chat becomes active
  useEffect(() => {
    if (activeChatId && textareaRef.current) {
      // slight delay to ensure element is mounted
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [activeChatId]);

  // Ensure sidebar state doesn't leak into desktop view and track isMobile
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 860;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    // call once on mount
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // === Fetch chats ===
  useEffect(() => {
    axios
      .get("/api/chats", { withCredentials: true })
      .then((res) => setChats(res.data.chats))
      .catch((err) => console.error("Error fetching chats:", err));
  }, []);

  // === Setup Socket ===
  useEffect(() => {
    const newSocket = io({ withCredentials: true });

    newSocket.on("ai-response", (data) => {
      setMessages((prev) => {
        // If last message is same _id, append text
        if (prev[prev.length - 1]?._id === data._id) {
          return prev.map((m) =>
            m._id === data._id ? { ...m, content: m.content + data.text } : m
          );
        }
        // Otherwise push new one
        return [
          ...prev,
          { _id: data._id, role: "model", content: data.text, chat: data.chat },
        ];
      });
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Handle Enter key
  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // === Fetch messages for chat ===
  const fetchChatMessages = async (chatId) => {
    try {
      const response = await axios.get(`/api/chats/${chatId}/messages`, {
        withCredentials: true,
      });
      // Normalize: convert "text" to "content"
      const normalized = response.data.messages.map((m) => ({
        _id: m._id,
        chat: chatId,
        role: m.role,
        content: m.text,
      }));
      setMessages((prev) => [
        ...prev.filter((msg) => msg.chat !== chatId),
        ...normalized,
      ]);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  return (
    <div className='home-root'>
      {/* === Topbar (visible on mobile) === */}
      <Topbar onMenuClick={() => setIsSidebarOpen(true)} onLogout={handleLogout} />
      <div className='content'>
        {/* === Sidebar === */}
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          isOpen={isSidebarOpen}
          onCreateChat={createChat}
          onLogout={handleLogout}
          onSelectChat={(id) => {
            setActiveChatId(id);
            fetchChatMessages(id);
            setIsSidebarOpen(false);
          }}
        />
        {/* Backdrop for mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <div className='sidebar-backdrop' onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* === Chat Main === */}
        <ChatMain
          activeChatId={activeChatId}
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onKeyDown={handleKey}
          textareaRef={textareaRef}
          scrollRef={scrollRef}
          isThinking={isThinking}
        />
      </div>
    </div>
  );
}
