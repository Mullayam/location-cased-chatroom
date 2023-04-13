const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { PeerServer } = require("peer");
const {
  disconnectEventHandler,
  loginEventHandler,
  broadcastDisconnectedUserDetails,
  chatMessageHandler,
  videoRoomCreateHandler,
  videoRoomJoinHandler,
  videoRoomLeaveHandler,
} = require("./events/handler");

const NewPeerServer = PeerServer({ port: 9000, path: "/peer" });

const server = http.createServer(app);
const PORT = 7000;
// cross origin middleware
app.use(cors({ allowOrigin: "*" }));
// creating socket connection
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// routes
app.get("/", (req, res) => {
  res.send("Welcome");
});
// initialize socket connection
io.on("connection", (socket) => {
  console.log("connected", socket.id);
  socket.on("chat-message", (data) => {
    chatMessageHandler(socket, data, io);
  });
  socket.on("user-login", (data) => {
    loginEventHandler(socket, data, io);
  });
  socket.on("video-room-create", (data) => {
    videoRoomCreateHandler(socket, data, io);
  });  
  socket.on("video-room-join", (data) => {
   
    videoRoomJoinHandler(socket, data, io);
  });
  socket.on("video-room-leave", (data) => {
    videoRoomLeaveHandler(socket, data, io);
  });
  socket.on("disconnect", () => {
    disconnectEventHandler(socket,io);
    broadcastDisconnectedUserDetails(io, socket.id);
  });
  socket.on("error", () => console.log("Something went wrong"));
});
// let onlineUsers = {};

// function disconnectEventHandler(id) {
//   console.log("User disconnected wwith " + id);
//   deleteOnlineUser(id);
// }
// function deleteOnlineUser(id) {
//   if (onlineUsers[id]) return delete onlineUsers[id];
// }

// function ArrayOfonlineUsers() {
//   const arr = [];
//   Object.entries(onlineUsers).forEach(([key, data]) => {

//     arr.push({
//       socket: key,
//       username: data.username,
//       coords: data.coords,
//     });
//   });

//   return arr;
// }

// const loginEventHandler = (socket, data) => {
//   socket.join("logged-users");
//   onlineUsers[socket.id] = {
//     username: data.username,
//     coords: data.coords,
//   };
//   io.to("logged-users").emit("online-users", ArrayOfonlineUsers());
// };

// App Started
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
