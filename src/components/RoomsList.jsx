import { useEffect, useState } from "react";
import "./RoomsList.css";
import { useParticipants } from "@livekit/components-react";

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

  // function ParticipantCount() {
  //   const participants = useParticipants();
  //   console.log("Participants in room:", participants);
  //   // return <div>Users in room: {participants.length}</div>;
  // }

  return (
    <div>
      <ul>
        {rooms.map((room) => (
          <li key={room._id}>
            <button type="button" onClick={() => joinRoom(room.roomId)}>
              {room.roomId}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoomList;