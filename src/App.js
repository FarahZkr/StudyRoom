import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import RoomSession from './components/RoomSession';
import RoomsList from './components/RoomsList';
import SessionContainer from './components/SessionContainer';

function App() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  return (
    <div className="App">
      {!hasJoined ? (
        <SessionContainer
          token={(token) => { setToken(token); setHasJoined(true); }}
          username={username}
          setUsername={setUsername}
        />
      ) : (
        <RoomSession token={token} onLeave={() => setHasJoined(false)} />
      )}
    </div>
  );
}

export default App;
