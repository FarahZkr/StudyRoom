import React, { useState } from 'react';
import './RoomSession.css';
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';

function RoomSession() {
  const [token, setToken] = useState(null);
  const LIVEKIT_URL = "wss://studyrooms-z2ioh2bj.livekit.cloud";
  
  const connect = async () => {
    const response = await fetch("http://localhost:3000/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: "test-room", participantName: "User" }),
    });
    const data = await response.json();
    setToken(data.token);
  };

  if (!token) {
    return (
      <div className='main'>
        <button onClick={connect}>Join Room</button>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={LIVEKIT_URL}
      connect={true}
      video={true}
      audio={true}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}

export default RoomSession;