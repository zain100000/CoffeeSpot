import { useEffect, useState } from "react";
import { useSocket } from "../socket/SocketContext";

export const ChatEvent = () => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);

  const startChat = (userId, initialMessage = "") => {
    socket.emit("startChat", { userId, initialMessage });
  };

  const sendMessage = (chatId, text) => {
    socket.emit("sendMessage", { chatId, text });
  };

  const closeChat = (chatId) => {
    socket.emit("closeChat", { chatId });
  };

  useEffect(() => {
    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    socket.on("chatHistory", (data) => {
      setMessages(data.messages);
      setChatId(data.chatId);
    });

    socket.on("newChat", (data) => {
      setChatId(data.chatId);
      setMessages([data.initialMessage]);
    });

    socket.on("chatClosed", () => {
      setChatId(null);
      setMessages([]);
    });

    return () => {
      socket.off("newMessage");
      socket.off("chatHistory");
      socket.off("newChat");
      socket.off("chatClosed");
    };
  }, [socket]);

  return {
    messages,
    chatId,
    startChat,
    sendMessage,
    closeChat,
  };
};
