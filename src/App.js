import { useEffect, useState } from 'react';
import './App.css';
import RoomSession from './components/RoomSession';
import SessionContainer from './components/SessionContainer';

function App() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  useEffect (() => {
    console.log(token);
  }, [])

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
