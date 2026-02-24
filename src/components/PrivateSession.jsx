import { useState } from "react";

function PrivateServer({ setToken, username }) {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");

  const joinPrivateRoom = async () => {
    if (roomName.trim() === "") return alert("Room name cannot be empty");
    if (password.trim() === "") return alert("Password cannot be empty");
    if (!username) return alert("Please enter a username first");

    try {
      const response = await fetch("http://localhost:3000/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: roomName.trim(),
          password: password.trim(),
          username: username.trim(),
          isPrivate: true,
          action: "join",
        }),
      });
      const data = await response.json();
      if (!response.ok) return alert(data.error || "Something went wrong");
      setToken(data.token);
    } catch (err) {
      alert("Failed to join room. Please try again.");
    }
  };

  return (
    <div className="private-container">
      <div className="field">
        <label htmlFor="ServerName">Room Name</label>
        <input
          type="text"
          id="ServerName"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="ServerPass">Password</label>
        <input
          type="password"
          id="ServerPass"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && joinPrivateRoom()}
          autoComplete="off"
        />
      </div>
      <button className="primary-btn" onClick={joinPrivateRoom}>
        Join Private Room
      </button>
    </div>
  );
}

export default PrivateServer;