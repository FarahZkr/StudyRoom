import { useEffect, useState } from "react";
import "./SessionContainer.css";
import HostSession from "./HostSession";
import PrivateServer from "./PrivateSession";
import RoomsList from "./RoomsList";

function SessionContainer({token, username}) {
  const [tabId, setTabId] = useState(1);

  function handleTabClick(id) {
    const hostBtn = document.getElementById("hostBtn");
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");
    tabs.forEach((t) => t.classList.remove("selected"));
    tabs[id-1].classList.add("selected");

    contents.forEach((c) => c.classList.remove("active"));
    contents[id-1].classList.add("active");
    hostBtn.classList.add("hidden");
    if(id === 1) {
      hostBtn.classList.remove("hidden");
    }
  }

  return (
    <div className="session-container-parent">
      <div className="session-container">
        <div className="container-top">
          <button type="button" className="tab selected" onClick={()=>handleTabClick(1)}>Public Servers</button>
          <button type="button" className="tab" onClick={()=>handleTabClick(2)}>Private Server</button>
        </div>
       
        <div className="container-bottom">
          <button className="tab" id="hostBtn" onClick={()=>handleTabClick(3)}>Host a server</button>
          <div className="tab-content active">
            <RoomsList setToken={token} username={username}/>
          </div>
          <div className="tab-content">
            <PrivateServer />
          </div>
          <div className="tab-content">
            <HostSession />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionContainer;
