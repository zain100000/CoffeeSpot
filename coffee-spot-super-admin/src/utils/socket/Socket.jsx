import { io } from "socket.io-client";
import CONFIG from "../socket/config/Config";

const { SOCKET_URL } = CONFIG;

const token = localStorage.getItem("authToken");

const Socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: token,
  },
  transports: ["websocket"],
});

export default Socket;
