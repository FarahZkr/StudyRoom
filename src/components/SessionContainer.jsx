import { useState } from "react";
import "./SessionContainer.css";
import HostSession from "./HostSession";
import PrivateServer from "./PrivateSession";
import RoomsList from "./RoomsList";

function SessionContainer({ token, username, setUsername }) {
  const [tabId, setTabId] = useState(1);

  const getInitials = (identity) => {
    return identity
      .split(" ")
      .filter((word) => /[a-zA-Z]/.test(word))
      .map((word) =>
        word
          .replace(/[^a-zA-Z]/g, "")
          .charAt(0)
          .toUpperCase(),
      )
      .join("")
      .slice(0, 2);
  };

  return (
    <div className="session-container-parent">
      <div className="session-container">
         <div className="username-section">
          <div className="username-field">
            <div className="username-avatar">
              {username ? getInitials(username) : "?"}
            </div>
            <input
              type="text"
              placeholder="Enter your name to get started"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
            />
          </div>
        </div>
        <div className="container-top">
          <button
            type="button"
            className={`tab ${tabId === 1 ? "selected" : ""}`}
            onClick={() => setTabId(1)}
          >
            Public Rooms
          </button>
          <button
            type="button"
            className={`tab ${tabId === 2 ? "selected" : ""}`}
            onClick={() => setTabId(2)}
          >
            Private Room
          </button>
        </div>

        <div className="container-bottom">
          {tabId === 1 && (
            <button id="hostBtn" onClick={() => setTabId(3)}>
              + Host a Room
            </button>
          )}
          <div className={`tab-content ${tabId === 1 ? "active" : ""}`}>
            <RoomsList setToken={token} username={username} />
          </div>
          <div className={`tab-content ${tabId === 2 ? "active" : ""}`}>
            <PrivateServer setToken={token} username={username} />
          </div>
          <div className={`tab-content ${tabId === 3 ? "active" : ""}`}>
            <HostSession setToken={token} username={username} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionContainer;
