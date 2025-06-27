import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChatEvents } from "../../../utils/socket/ChatEventHooks/ChatEventHooks";
import moment from "moment";
import "../../../styles/globalStyles.css";
import "./Messages.css";
import Loader from "../../../utils/customLoader/Loader";

const Messages = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const { getChatById, currentChat, sendMessage, setCurrentChat } =
    ChatEvents();

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        setError(null);

        if (location.state?.chat) {
          setCurrentChat(location.state.chat);
          return;
        }

        if (chatId) {
          await getChatById(chatId);
        }
      } catch (err) {
        console.error("Failed to fetch chat:", err);
        setError("Failed to load chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId, location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMsg = {
        sender: "SUPERADMIN",
        text: message,
        sentAt: new Date().toISOString(),
      };

      // Optimistic UI update
      setCurrentChat((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), newMsg] } : prev
      );

      sendMessage(chat?._id, "SUPERADMIN", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader />
        <p>Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const chat = currentChat || location.state?.chat;

  if (!chat) {
    return (
      <div className="no-chat-container">
        <p>No chat found</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  return (
    <section id="chat-screen-container">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <div className="user-info">
          <img
            src={chat.user?.profilePicture || "default-profile.png"}
            alt={chat.user?.userName}
            className="user-avatar"
            onError={(e) => {
              e.target.src = "default-profile.png";
            }}
          />
          <div className="user-details">
            <h3>{chat.user?.userName || "Unknown User"}</h3>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {chat.messages?.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "USER" ? "received" : "sent"}`}
          >
            <div className="message-content">
              <p>{msg.userName}</p>
              <p>{msg.text}</p>
              <span className="message-time">
                {moment(msg.sentAt).format("h:mm A")}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-area">
        <div className="input-container">
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <button className="send-button" onClick={handleSendMessage}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </section>
  );
};

export default Messages;
