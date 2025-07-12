const mongoose = require("mongoose");
const User = require("../models/user.model");
const SuperAdmin = require("../models/super-admin.model");
const Chat = require("../models/chat.model");

const CHAT_EVENTS = {
  // Events to EMIT (send)
  START_CHAT: "startChat",
  SEND_MESSAGE: "sendMessage",
  GET_CHAT_HISTORY: "getChatHistory",
  CLOSE_CHAT: "closeChat",
  GET_ALL_CHATS: "getAllChats",
  DELETE_CHAT: "deleteChat",

  // Events to LISTEN (receive)
  NEW_CHAT: "newChat",
  NEW_MESSAGE: "newMessage",
  CHAT_HISTORY: "chatHistory",
  CHAT_CLOSED: "chatClosed",
  ALL_CHATS_LIST: "allChatsList",
  CHAT_DELETED: "chatDeleted",
};

const sendError = (socket, message, details = null) => {
  const errorResponse = {
    success: false,
    message: message,
    ...(details && { details: details }),
  };
  socket.emit("error", errorResponse);
  return errorResponse;
};

const sendSuccess = (socket, message, data = null) => {
  const successResponse = {
    success: true,
    message: message,
    ...(data && { data: data }),
  };
  socket.emit("success", successResponse);
  return successResponse;
};

exports.initializeChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User ${socket.user?.id} connected as ${socket.user?.role}`);

    // Join user to their personal room
    socket.join(socket.user.id);

    // Start a new chat session
    socket.on(CHAT_EVENTS.START_CHAT, async (data) => {
      try {
        const { userId, initialMessage } = data;

        // Validate user is starting chat for themselves
        if (socket.user.id !== userId || socket.user.role !== "USER") {
          return sendError(socket, "Unauthorized to start chat");
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return sendError(socket, "Invalid user ID provided");
        }

        // Find existing active chat
        const existingChat = await Chat.findOne({
          user: userId,
          isActive: true,
        })
          .populate("user")
          .populate("superAdmin");

        if (existingChat) {
          return sendSuccess(socket, "Existing chat found", {
            chatId: existingChat._id,
            messages: existingChat.messages,
            participants: {
              user: existingChat.user,
              superAdmin: existingChat.superAdmin,
            },
          });
        }

        // Find available superadmin
        const superAdmin = await SuperAdmin.findOne({ isSuperAdmin: true });
        if (!superAdmin) {
          return sendError(socket, "No support agents available");
        }

        // Create new chat
        const newChat = new Chat({
          user: userId,
          superAdmin: superAdmin._id,
          messages: [
            {
              sender: "USER",
              text: initialMessage || "Hello, I need help",
              sentAt: new Date(),
            },
            {
              sender: "SUPERADMIN",
              text: "How can I assist you?",
              sentAt: new Date(),
            },
          ],
          isActive: true,
        });

        await newChat.save();

        // Populate for response
        const populatedChat = await Chat.findById(newChat._id)
          .populate("user")
          .populate("superAdmin");

        sendSuccess(socket, "Chat started successfully", {
          chatId: populatedChat._id,
          messages: populatedChat.messages,
          participants: {
            user: populatedChat.user,
            superAdmin: populatedChat.superAdmin,
          },
        });

        // Notify superadmin
        io.to(superAdmin._id.toString()).emit(CHAT_EVENTS.NEW_CHAT, {
          chatId: populatedChat._id,
          user: populatedChat.user,
          initialMessage: populatedChat.messages[0],
        });
      } catch (error) {
        console.error("START_CHAT error:", error);
        sendError(socket, "Failed to start chat", error.message);
      }
    });

    // Send a message
    socket.on(CHAT_EVENTS.SEND_MESSAGE, async (data) => {
      try {
        const { chatId, text } = data;
        const senderType =
          socket.user.role === "SUPERADMIN" ? "SUPERADMIN" : "USER";

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
          return sendError(socket, "Invalid chat ID provided");
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          return sendError(socket, "Chat not found");
        }

        // Authorization check
        if (
          (senderType === "USER" && socket.user.id !== chat.user.toString()) ||
          (senderType === "SUPERADMIN" &&
            socket.user.id !== chat.superAdmin.toString())
        ) {
          return sendError(socket, "Unauthorized to send message in this chat");
        }

        const newMessage = {
          sender: senderType,
          text: text,
          sentAt: new Date(),
        };

        chat.messages.push(newMessage);
        chat.isActive = true;
        await chat.save();

        sendSuccess(socket, "Message sent successfully", {
          chatId: chat._id,
          message: newMessage,
        });

        // Notify the other participant
        const recipientId =
          senderType === "USER"
            ? chat.superAdmin.toString()
            : chat.user.toString();

        io.to(recipientId).emit(CHAT_EVENTS.NEW_MESSAGE, {
          chatId: chat._id,
          message: newMessage,
        });
      } catch (error) {
        console.error("SEND_MESSAGE error:", error);
        sendError(socket, "Failed to send message", error.message);
      }
    });

    // Get chat history
    socket.on(CHAT_EVENTS.GET_CHAT_HISTORY, async (data) => {
      try {
        const { chatId } = data;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
          return sendError(socket, "Invalid chat ID provided");
        }

        const chat = await Chat.findById(chatId)
          .populate("user")
          .populate("superAdmin");

        if (!chat) {
          return sendError(socket, "Chat not found");
        }

        socket.emit(CHAT_EVENTS.CHAT_HISTORY, {
          chatId: chat._id,
          user: chat.user,
          superAdmin: chat.superAdmin,
          messages: chat.messages,
          isActive: chat.isActive,
        });
      } catch (error) {
        console.error("GET_CHAT_HISTORY error:", error);
        sendError(socket, "Failed to get chat history", error.message);
      }
    });

    // Close chat
    socket.on(CHAT_EVENTS.CLOSE_CHAT, async (data) => {
      try {
        const { chatId } = data;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
          return sendError(socket, "Invalid chat ID provided");
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          return sendError(socket, "Chat not found");
        }

        // Only superadmin or the user can close the chat
        if (
          socket.user.id !== chat.superAdmin.toString() &&
          socket.user.id !== chat.user.toString()
        ) {
          return sendError(socket, "Unauthorized to close this chat");
        }

        chat.isActive = false;
        await chat.save();

        sendSuccess(socket, "Chat closed successfully", {
          chatId: chat._id,
          closedAt: new Date(),
        });

        // Notify both participants
        io.to(chat.user.toString()).emit(CHAT_EVENTS.CHAT_CLOSED, {
          chatId: chat._id,
        });

        io.to(chat.superAdmin.toString()).emit(CHAT_EVENTS.CHAT_CLOSED, {
          chatId: chat._id,
        });
      } catch (error) {
        console.error("CLOSE_CHAT error:", error);
        sendError(socket, "Failed to close chat", error.message);
      }
    });

    // Get all chats
    socket.on(CHAT_EVENTS.GET_ALL_CHATS, async () => {
      try {
        if (socket.user.role !== "SUPERADMIN") {
          return sendError(socket, "Only super admins can view all chats.");
        }

        const chats = await Chat.find({})
          .sort({ updatedAt: -1 })
          .populate("user")
          .populate("superAdmin");

        socket.emit(CHAT_EVENTS.ALL_CHATS_LIST, chats);
      } catch (error) {
        console.error("GET_ALL_CHATS error:", error);
        sendError(socket, "Failed to fetch all chats", error.message);
      }
    });

    // delete chat
    socket.on(CHAT_EVENTS.DELETE_CHAT, async (data) => {
      try {
        const { chatId } = data;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
          return sendError(socket, "Invalid chat ID provided");
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          return sendError(socket, "Chat not found");
        }

        // Only superadmin can delete chats
        if (socket.user.role !== "SUPERADMIN") {
          return sendError(socket, "Unauthorized to delete this chat");
        }

        // Get participants before deleting
        const participants = {
          userId: chat.user.toString(),
          superAdminId: chat.superAdmin.toString(),
        };

        await Chat.findByIdAndDelete(chatId);

        sendSuccess(socket, "Chat deleted successfully", {
          chatId: chat._id,
          deletedAt: new Date(),
        });

        // Notify both participants that the chat was deleted
        io.to(participants.userId).emit(CHAT_EVENTS.CHAT_DELETED, {
          chatId: chat._id,
        });

        io.to(participants.superAdminId).emit(CHAT_EVENTS.CHAT_DELETED, {
          chatId: chat._id,
        });
      } catch (error) {
        console.error("DELETE_CHAT error:", error);
        sendError(socket, "Failed to delete chat", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.user?.id} disconnected`);
    });
  });
};
