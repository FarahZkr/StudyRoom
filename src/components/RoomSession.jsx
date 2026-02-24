import React, { useEffect } from 'react';
import Webcam from 'react-webcam';
import './RoomSession.css';
import {
  LiveKitRoom,
} from '@livekit/components-react';
import '@livekit/components-styles';
import RoomUI from './RoomUI';

function RoomSession({ token, onLeave }) {
  const LIVEKIT_URL = "wss://studyrooms-z2ioh2bj.livekit.cloud";

  useEffect(() => { 
    console.log("RoomSession received token:", token);
  }, [token]);

  if (!token) {
    return (<div></div>);
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={LIVEKIT_URL}
      connect={true}
      video={true}
      audio={true}
    >
      <RoomUI onLeave={onLeave}/>
    </LiveKitRoom>
  );
}

export default RoomSession;