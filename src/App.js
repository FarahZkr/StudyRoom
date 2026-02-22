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

  useEffect(() => {
    console.log("App token state updated:", token);
  }, [token]);

  return (
    <div className="App">
      {
        !hasJoined ? (
          <>
            {/* <h2>ello</h2> */}
            <input type="text" placeholder='Username' className='username-input' value={username} onChange={(e) => setUsername(e.target.value)}/>
            <SessionContainer token={(token) => {setToken(token); setHasJoined(true)}} username={username}/>
          </> )
          : (
          <>
            <RoomSession token={token} onLeave={() => setHasJoined(false)}/>
          </>
        )
      }
    </div>
  );
}

export default App;
