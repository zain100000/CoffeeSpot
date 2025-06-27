const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // Enhanced JWT authentication middleware
  io.use((socket, next) => {
    try {
      // Get token from either auth object or query parameters
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        console.error(`No token provided for socket ${socket.id}`);
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify and decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Validate token structure
      if (!decoded?.user?.id || !decoded?.role) {
        console.error(`Invalid token structure for socket ${socket.id}`);
        return next(new Error("Authentication error: Invalid token structure"));
      }

      // Attach complete user data to socket
      socket.user = {
        id: decoded.user.id,
        role: decoded.role,
        email: decoded.user.email,
        // Add any other relevant user data
      };

      console.log(`Authenticated socket ${socket.id} for user ${socket.user.id} (${socket.user.role})`);
      next();
    } catch (error) {
      console.error(`Authentication failed for socket ${socket.id}:`, error.message);
      next(new Error("Authentication failed: " + error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user?.id} connected as ${socket.user?.role}`);

    // Join user to their personal room
    if (socket.user?.id) {
      socket.join(socket.user.id);
      console.log(`User ${socket.user.id} joined room ${socket.user.id}`);
    }

    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.user?.id} disconnected. Reason: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.user?.id}:`, error);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initializeSocket, getIo };