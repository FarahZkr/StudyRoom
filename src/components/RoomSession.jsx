import './RoomSession.css';
import { useState } from "react";
import {
  LiveKitRoom,
  PreJoin
} from '@livekit/components-react';
import '@livekit/components-styles';
import RoomUI from './RoomUI';

function RoomSession({ token, onLeave, allowMics }) {
  const LIVEKIT_URL = "wss://studyrooms-z2ioh2bj.livekit.cloud";
  const [preJoinDone, setPreJoinDone] = useState(false);
  const [preJoinValues, setPreJoinValues] = useState(null);

  if (!token) {
    return (<div></div>);
  }

  if (!preJoinDone) {
    return (
      <PreJoin
        onSubmit={(values) => {
          setPreJoinValues(values);
          setPreJoinDone(true);
        }}
        onError={(err) => console.error(err)}
      />
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={LIVEKIT_URL}
      connect={true}
      video={true}
      audio={allowMics}
    >
      <RoomUI onLeave={onLeave} allowMics={allowMics}/>
    </LiveKitRoom>
  );
}

export default RoomSession;