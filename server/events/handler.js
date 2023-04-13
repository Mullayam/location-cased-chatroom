let onlineUsers = {};
let videoRooms = {};

function disconnectEventHandler(socket,io) {
  console.log("User disconnected wwith " + socket.id);
  checkUserIsActiveInCall(socket,io);
  deleteOnlineUser(socket.id);
}
function deleteOnlineUser(id) {
  if (onlineUsers[id]) return delete onlineUsers[id];
}
function broadcastDisconnectedUserDetails(io, socketIdOfDisconnectedUser) {
  io.to("logged-users").emit("user-disconnected", socketIdOfDisconnectedUser);
}
function ArrayOfonlineUsers() {
  const arr = [];
  Object.entries(onlineUsers).forEach(([key, data]) => {
    arr.push({
      socket: key,
      username: data.username,
      coords: data.coords,
    });
  });

  return arr;
}

const loginEventHandler = (socket, data, io) => {
  socket.join("logged-users");
  onlineUsers[socket.id] = {
    username: data.username,
    coords: data.coords,
  };
  io.to("logged-users").emit("online-users", ArrayOfonlineUsers());

  broadcastVideoRooms(io);
};
const chatMessageHandler = (socket, data, io) => {
  const { content, receiverSocketId, id } = data;

  if (onlineUsers[receiverSocketId]) {
    io.to(receiverSocketId).emit("chat-message", {
      senderSocketId: socket.id,
      content,
      id,
    });
  }
};
const videoRoomCreateHandler = (socket, data, io) => {
  const { peerId, newRoomId } = data;
  videoRooms[newRoomId] = {
    participants: [
      {
        socketId: socket.id,
        username: onlineUsers[socket.id].username,
        peerId,
      },
    ],
  };
  broadcastVideoRooms(io);
};
 
const videoRoomJoinHandler = (socket, data, io) => {
  const { peerId, roomId } = data;
  if (videoRooms[roomId]) {
    videoRooms[roomId].participants.forEach((participant) => {
      socket.to(participant.socketId).emit("video-room-init"),
        {
          newParticipantPeerId: peerId,
        };
    });
  }
  videoRooms[roomId] = [
    ...videoRooms[roomId].participants,
    {
      socketId: socket.id,
      username: onlineUsers[socket.id].username,
      peerId,
    },
  ];
  console.log(videoRooms);
io.to("logged-users").emit("video-rooms", videoRooms);
};
const videoRoomLeaveHandler = (socket, data, io) => {
  const { roomId } = data;
  if (videoRooms[roomId]) {
    videoRooms[roomId].participants = videoRooms[roomId].participants.filter(
      (participant) => {
        participant.socketId !== socket.id;
      }
    );
  }
  if (videoRooms[roomId].participants.length > 0) {
    socket
      .to(videoRooms[roomId].participants[0].socketId)
      .emit("video-call-disconnect");
  }
  if (videoRooms[roomId].participants.length < 1) {
    delete videoRooms[roomId];
  }
};
//chekcing user is online or offline
const checkUserIsActiveInCall = (socket,io) => {
  Object.entries(socket).forEach(([key, value]) => {
    const participant = value.participants.find((p) => p.socket === socket.id);
    if (participant) {
      removeUserFromVideoRoom(socket.id, key,io);
    }
  });
};
const removeUserFromVideoRoom = (socketId, roomId,io) => {
  videoRooms[roomId].participants = videoRooms[roomId].participants.filter(
    (p) => p.socketId === socketId
  );
  /// delete room if not user left
  if (videoRooms[roomId].participants.length < 1) {
    delete videoRooms[roomId];
  } else {
    // if there are participants - inform, him to clear his peer connection
    io.to(videoRooms[roomId].participants[0].socketId).emit(
      "video-call-disconnect"
    );
  }
};
module.exports = {
  disconnectEventHandler,
  loginEventHandler,
  broadcastDisconnectedUserDetails,
  chatMessageHandler,
  videoRoomCreateHandler,
  videoRoomJoinHandler,
  videoRoomLeaveHandler,
};
