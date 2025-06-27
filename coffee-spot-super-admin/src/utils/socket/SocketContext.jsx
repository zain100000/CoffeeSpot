import React, { createContext, useContext, useEffect } from "react";
import Socket from "./Socket";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      Socket.auth = { token };
      Socket.connect();
      console.log("Attempting to connect socket with token:", token);
    }

    Socket.on("connect", () => {
      console.log("✅ Socket connected:", Socket.id);
    });

    Socket.on("disconnect", (reason) => {
      console.warn("❌ Socket disconnected:", reason);
    });

    Socket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });

    return () => {
      Socket.disconnect();
      Socket.off("connect");
      Socket.off("disconnect");
      Socket.off("connect_error");
    };
  }, []);

  return (
    <SocketContext.Provider value={Socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
