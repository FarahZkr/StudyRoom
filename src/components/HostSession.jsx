import { useState } from "react";
//process.env.REACT_APP_API_URL || 
const API_URL = "http://localhost:3000";

function HostSession({setToken, username, setMics}) {
  const [roomName, setRoomName] = useState("");
  const [roomPass, setRoomPass] = useState("");
  const [maxUsers, setMaxUsers] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowMics, setAllowMics] = useState(true);

  function modifyMaxUsers(change) {
    setMaxUsers((prev) => {
      const newValue = prev + change;
      if (newValue < 2) return 2;
      else if (newValue > 10) return 10;
      return newValue;
    });
  }

  const hostRoom = async () => {
    if(!validateForm(roomName, roomPass, isPrivate)) return;
    const response = await fetch(`${API_URL}/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: roomName, isPrivate: isPrivate, maxUsers: maxUsers, password: roomPass, allowMics: allowMics, action: "host", username: username.trim() }),
    });

    const data = await response.json();
    
    setMics(allowMics);
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
      <input type="checkbox" id="PrivateServer" onChange={()=>setIsPrivate(prev=>!prev)} style={{width: "fit-content"}} />
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
        <button type="button" id="addBtn" onClick={() => modifyMaxUsers(1)}>
          +
        </button>
        <button type="button" onClick={() => modifyMaxUsers(-1)}>
          ━
        </button>
      </div>
      <label htmlFor="AllowMics">Allow Mics</label>
      <input type="checkbox" id="AllowMics" onChange={() => setAllowMics((prev) => !prev)} style={{width: "fit-content"}} checked={allowMics} />
      <button type="button" className="primary-btn" onClick={hostRoom} style={{marginTop:"10px"}}>Host</button>
    </div>
  );
}

export default HostSession;
