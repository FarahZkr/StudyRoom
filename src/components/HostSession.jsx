import { useEffect, useState } from "react";

function HostSession({setToken, username}) {
  const [roomName, setRoomName] = useState("");
  const [roomPass, setRoomPass] = useState("");
  const [maxUsers, setMaxUsers] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);

  function modifyMaxUsers(change) {
    setMaxUsers((prev) => {
      const newValue = prev + change;
      if (newValue < 0) return 0;
      else if (newValue > 10) return 10;
      return newValue;
    });
  }

  function togglePrivate() {
    setIsPrivate((prev) => !prev);
  }

  const hostRoom = async () => {
    if(!validateForm(roomName, roomPass, isPrivate)) return;
    const response = await fetch("http://localhost:3000/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: roomName, isPrivate: isPrivate, maxUsers: maxUsers, password: roomPass, action: "host", username: username.trim() }),
    });
    // Get token if needed
    const data = await response.json();
    setToken(data.token);
  };

  function validateForm(roomName, roomPass, isPrivate) {
    if (!username) {
      alert("Please enter a username before hosting a room.");
      return;
    }
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
    <div className="host-container">
      <label htmlFor="PrivateServer">Private Server</label>
      <input type="checkbox" id="PrivateServer" onChange={togglePrivate} style={{width: "fit-content"}} />
      <label htmlFor="ServerName">Server Name</label>
      <input type="text" id="ServerName" placeholder="Name" value={roomName} onChange={(e) => setRoomName(e.target.value)}/>
      <div
        className={
          isPrivate ? "server-pass-container" : "server-pass-container hidden"
        }>
        <label htmlFor="ServerPass">Server Password</label>
        <input type="text" id="ServerPass" placeholder="Password" value={roomPass}  onChange={(e) => setRoomPass(e.target.value)} />
      </div>
      <label htmlFor="MaxUsers">Max Participants</label>
      <div className="participants-container">
        <input
          type="number"
          id="MaxUsers"
          placeholder="Max users"
          min={2}
          max={10}
          value={maxUsers}
        />
        <button type="button" onClick={() => modifyMaxUsers(1)}>
          +
        </button>
        <button type="button" onClick={() => modifyMaxUsers(-1)}>
          -
        </button>
      </div>
      <button type="button" onClick={hostRoom}>Host</button>
    </div>
  );
}

export default HostSession;
