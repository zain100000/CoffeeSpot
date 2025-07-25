import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RootNavigator from "./navigation/RootNavigator";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./utils/socket/SocketContext"; // ✅ Import your provider
import "./styles/globalStyles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SocketProvider>
      <BrowserRouter>
        <RootNavigator />
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              fontSize: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              padding: "8px 16px",
              transition: "opacity 0.5s ease-in-out",
            },
            success: {
              style: {
                backgroundColor: "var(--white)",
                color: "var(--black)",
                fontFamily: "var(--font-family)",
              },
              icon: "✅",
            },
            error: {
              style: {
                backgroundColor: "var(--white)",
                color: "var(--black)",
                fontFamily: "var(--font-family)",
              },
              icon: "❌",
            },
            duration: 1000,
          }}
        />
      </BrowserRouter>
    </SocketProvider>
  </React.StrictMode>
);
