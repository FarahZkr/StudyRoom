import { useEffect, useState } from "react";

function PrivateServer() {
  function validateForm(roomName, roomPass, isPrivate) {
    if (roomName.trim() === "") {
      alert("Room name cannot be empty");
      return false;
    }
    if (isPrivate && roomPass.trim() === "") {
      alert("Password cannot be empty for private rooms");
      return false;
    }
    return true;
  }

  return (
    <div className="private-container">
      <label htmlFor="ServerName">Server Name</label>
      <input type="text" id="ServerName" placeholder="Name" />
      <label htmlFor="ServerPass">Server Password</label>
      <input type="text" id="ServerPass" placeholder="Password" />
    </div>
  );
}

export default PrivateServer;
