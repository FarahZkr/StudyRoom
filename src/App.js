import { useState } from 'react';
import './App.css';
import RoomSession from './components/RoomSession';
import SessionContainer from './components/SessionContainer';

function App() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [allowMics, setAllowMics] = useState(true);

  return (
    <div className="App">
      {!hasJoined ? (
        <SessionContainer
          token={(token) => { setToken(token); setHasJoined(true); }}
          username={username}
          setUsername={setUsername} allowMics={setAllowMics}
        />
      ) : (
        <RoomSession token={token} onLeave={() => setHasJoined(false)} allowMics={allowMics} />
      )}
    </div>
  );
}

export default App;
