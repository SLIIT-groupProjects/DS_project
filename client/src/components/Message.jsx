import React from "react";

const Message = ({ sender, message }) => (
  <div>
    <b>{sender}:</b> {message}
  </div>
);

export default Message;
