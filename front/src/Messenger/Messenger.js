import React from "react";
import { useSelector } from "react-redux";

import Chatbox from "./Chatbox/Chatbox";

import "./Messenger.css";

// const DUMMY_CHATBOXES = [
//   {
//     username: "Martin",
//     socketId: 3213123,
//     messages: [],
//   },
//   {
//     username: "Test",
//     socketId: 3233123,
//     messages: [],
//   },
// ];

const Messenger = () => {
  const chatboxes = useSelector((state) => state.messenger.chatboxes);

  return (
    <div className="messenger_container">
      {chatboxes.map((chatbox) => (
        <Chatbox
          key={chatbox.socketId}
          socketId={chatbox.socketId}
          username={chatbox.username}
        />
      ))}
    </div>
  );
};

export default Messenger;
