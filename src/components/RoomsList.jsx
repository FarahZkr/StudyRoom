import { useEffect, useState } from "react";
import "./RoomsList.css";

function RoomList({ setToken, username }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error("Error fetching rooms:", err));
  }, []);

  const joinRoom = async (roomName) => {
    if (!username) {
      alert("Please enter a username before joining a room.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: roomName,
          isPrivate: false,
          maxUsers: "",
          password: "",
          username: username.trim(),
          action: "join",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        // Show specific backend error message
        alert(data.error || "Something went wrong");
        return;
      }
      setToken(data.token);
    } catch (err) {
      console.error("Error joining room:", err);
      alert("Failed to join room. Please try again.");
    }
  };

  return (
    <div className="rooms-list">
      {rooms.length === 0 ? (
        <div className="rooms-empty">No active rooms yet</div>
      ) : (
        <ul>
          {rooms.map((room) => (
            <li key={room._id} className="room-card" onClick={() => joinRoom(room.roomId)}>
              <div className="room-card-left">
                <div className="room-icon">🎧</div>
                <div className="room-info">
                  <span className="room-name">{room.roomId}</span>
                  <span className="room-meta">
                    {room.participantCount ?? 0} participant{room.participantCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <button type="button" className="join-btn" onClick={(e) => { e.stopPropagation(); joinRoom(room.roomId); }}>
                Join
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RoomList;