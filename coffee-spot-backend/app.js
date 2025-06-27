const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
const { initializeSocket } = require("./utilities/socket/socket");
const { initializeChatSocket } = require("./controllers/chat.controller");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

// Initialize chat socket handlers
initializeChatSocket(io);

// Middleware Setup
app.use(bodyParser.json({ limit: "20kb" }));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// CORS Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Route Imports
const superAdminRoute = require("./routes/super-admin.route");
const userRoute = require("./routes/user.route");
const otpRoute = require("./routes/otp.route");
const productRoute = require("./routes/product.route");
const cartRoute = require("./routes/cart.route");
const orderRoute = require("./routes/order.route");
const reviewRoute = require("./routes/review.route");

// Route Mounting
app.use("/api/super-admin", superAdminRoute);
app.use("/api/user", userRoute);
app.use("/api/otp", otpRoute);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/review", reviewRoute);

// Database Connection and Server Startup
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
