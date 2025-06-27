import { useEffect, useState } from "react";
import { useSocket } from "../SocketContext";

export const ChatEvents = () => {
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [allChats, setAllChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  const sendMessage = (chatId, senderType, text) => {
    const payload = { chatId, text };
    console.log("📤 Emitting sendMessage:", payload);

    socket.emit("sendMessage", payload);

    // Listen for confirmation/error just once
    socket.once("success", (data) => {
      console.log("✅ Message saved to backend:", data);
    });

    socket.once("error", (err) => {
      console.error("❌ Backend error on sendMessage:", err);
    });
  };

  const startChat = (userId, initialMessage = "") => {
    socket.emit("startChat", { userId, initialMessage });
  };

  const getAllChats = () => {
    socket.emit("getAllChats");
  };

  const getChatById = (chatId) => {
    socket.emit("getChatById", { chatId });
  };

  const deleteChat = (chatId) => {
    console.log("🗑️ Emitting deleteChat:", chatId);
    socket.emit("deleteChat", { chatId });

    // Listen for confirmation/error just once
    return new Promise((resolve, reject) => {
      socket.once("success", (data) => {
        console.log("✅ Chat deleted successfully:", data);
        // Update local state
        setAllChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (currentChat?._id === chatId) {
          setCurrentChat(null);
          setMessages([]);
          setChatId(null);
        }
        resolve(data);
      });

      socket.once("error", (err) => {
        console.error("❌ Backend error on deleteChat:", err);
        reject(err);
      });
    });
  };

  // Attach listeners
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.warn("❌ Socket disconnected");
    });

    socket.on("newMessage", (data) => {
      console.log("📥 newMessage received:", data);

      setMessages((prev) => [...prev, data.message]);

      setCurrentChat((prevChat) => {
        if (!prevChat || !prevChat.messages) return prevChat;

        return {
          ...prevChat,
          messages: [...prevChat.messages, data.message],
        };
      });
    });

    socket.on("chatHistory", (data) => {
      console.log("📚 Chat history loaded:", data);
      setMessages(data.messages);
      setChatId(data.chatId);
      setCurrentChat({ ...data });
    });

    socket.on("newChat", (data) => {
      console.log("🆕 New chat started:", data);

      const newChat = {
        _id: data.chatId,
        user: data.user,
        messages: [data.initialMessage],
        isActive: true,
      };

      setCurrentChat(newChat);
      setMessages([data.initialMessage]);
      setChatId(data.chatId);

      setAllChats((prev) => {
        const exists = prev.some((c) => c._id === data.chatId);
        return exists ? prev : [newChat, ...prev];
      });
    });

    socket.on("chatClosed", () => {
      console.log("🚪 Chat closed");
      setChatId(null);
      setMessages([]);
      setCurrentChat(null);
    });

    socket.on("chatDeleted", (data) => {
      console.log("🔥 Chat deleted:", data);
      setAllChats((prev) => prev.filter((chat) => chat._id !== data.chatId));
      if (currentChat?._id === data.chatId) {
        setCurrentChat(null);
        setMessages([]);
        setChatId(null);
      }
    });

    socket.on("allChatsList", (data) => {
      console.log("📋 All chats:", data);
      setAllChats(data);
    });

    return () => {
      socket.off("newMessage");
      socket.off("chatHistory");
      socket.off("newChat");
      socket.off("chatClosed");
      socket.off("chatDeleted");
      socket.off("allChatsList");
      socket.off("success");
      socket.off("error");
    };
  }, [socket]);

  return {
    messages,
    chatId,
    allChats,
    currentChat,
    startChat,
    sendMessage,
    closeChat: (chatId) => socket.emit("closeChat", { chatId }),
    deleteChat, // Added delete function
    getAllChats,
    getChatById,
    setCurrentChat,
    setAllChats,
  };
};
