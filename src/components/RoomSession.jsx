import React, { useState, useEffect, use } from 'react';
import Webcam from 'react-webcam';
import './RoomSession.css';
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';

function RoomSession({ token, onLeave }) {
  const LIVEKIT_URL = "wss://studyrooms-z2ioh2bj.livekit.cloud";

  useEffect(() => { 
    console.log("RoomSession received token:", token);
  }, [token]);

  if (!token) {
    return (<div></div>);
  }
//  <div className="webcam-container">
//           {/* <Webcam height={480} width={640} /> */}
//         </div>
  return (
    <LiveKitRoom
      token={token}
      serverUrl={LIVEKIT_URL}
      connect={true}
      video={true}
      audio={true}
      onDisconnected={onLeave}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}

export default RoomSession;