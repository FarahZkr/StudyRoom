import React, { useState } from "react";
import {
  useLocalParticipant,
  useParticipants,
  VideoTrack,
  AudioTrack,
  useTracks,
  useDisconnectButton,
  useDataChannel,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "./RoomUI.css";

function ParticipantTile({
  track,
  audioTracks,
  localParticipant,
  participants,
  getInitials,
}) {
  const participant = participants.find(
    (p) => p.identity === track.participant.identity,
  );
  const isMuted = !participant?.isMicrophoneEnabled;
  const isCameraOn = participant?.isCameraEnabled;
  const isSpeaking = participant?.isSpeaking ?? false;

  return (
    <div className="participant-tile">
      {isSpeaking && <div className="speaking-indicator"></div>}
      <div className="participant-name">{track.participant.identity}</div>
      {isMuted && (
        <div className="mute-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <defs>
              <style>{`.cls-1{fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:1.91px;}`}</style>
            </defs>
            <line className="cls-1" x1="12" y1="22.5" x2="12" y2="18.68" />
            <rect
              className="cls-1"
              x="8.18"
              y="1.5"
              width="7.64"
              height="13.36"
              rx="3.7"
            />
            <path
              className="cls-1"
              d="M19.64,11.05h0A7.64,7.64,0,0,1,12,18.68h0a7.64,7.64,0,0,1-7.64-7.63h0"
            />
            <line className="cls-1" x1="9.14" y1="22.5" x2="14.86" y2="22.5" />
            <line className="cls-1" x1="22.5" y1="1.5" x2="1.5" y2="22.5" />
          </svg>
        </div>
      )}
      {!isCameraOn && (
        <div className="camera-off-overlay">
          <span>{getInitials(track.participant.identity)}</span>
        </div>
      )}
      <VideoTrack trackRef={track} />
      {audioTracks
        .filter(
          (a) =>
            a.participant.identity === track.participant.identity &&
            a.participant.identity !== localParticipant.identity,
        )
        .map((a) => (
          <AudioTrack key={a.publication.trackSid} trackRef={a} />
        ))}
    </div>
  );
}

function RoomUI({ onLeave }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { buttonProps } = useDisconnectButton({ stopTracks: true });
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } =
    useLocalParticipant();
  const participants = useParticipants();
  const videoTracks = useTracks([Track.Source.Camera]);
  const audioTracks = useTracks([Track.Source.Microphone]);
  const cols = Math.ceil(Math.sqrt(videoTracks.length));

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

  const { send } = useDataChannel("chat", (msg) => {
    const decoded = JSON.parse(new TextDecoder().decode(msg.payload));
    setMessages((prev) => [...prev, decoded]);
  });

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { sender: localParticipant.identity, text: input };
    send(new TextEncoder().encode(JSON.stringify(msg)), { reliable: true });
    setMessages((prev) => [...prev, msg]); // add your own message locally
    setInput("");
  };

  return (
    <div className="room">
      <div className="main-container">
        <div className="video-container">
          <div
            className="video-grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
          >
            {videoTracks.map((track) => (
              <ParticipantTile
                key={track.publication.trackSid}
                track={track}
                audioTracks={audioTracks}
                localParticipant={localParticipant}
                participants={participants}
                getInitials={getInitials}
              />
            ))}
          </div>
        </div>
        <div className={`chat ${chatOpen ? "" : "hidden"}`}>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className="msg-container">
                <div className="msg-sender">{msg.sender}</div>
                <div className="chat-message">
                  <span className="chat-sender">{getInitials(msg.sender)}</span>
                  <span className="chat-text">{msg.text}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message"
            />
            <button onClick={sendMessage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M10.3009 13.6949L20.102 3.89742M10.5795 14.1355L12.8019 18.5804C13.339 19.6545 13.6075 20.1916 13.9458 20.3356C14.2394 20.4606 14.575 20.4379 14.8492 20.2747C15.1651 20.0866 15.3591 19.5183 15.7472 18.3818L19.9463 6.08434C20.2845 5.09409 20.4535 4.59896 20.3378 4.27142C20.2371 3.98648 20.013 3.76234 19.7281 3.66167C19.4005 3.54595 18.9054 3.71502 17.9151 4.05315L5.61763 8.2523C4.48114 8.64037 3.91289 8.83441 3.72478 9.15032C3.56153 9.42447 3.53891 9.76007 3.66389 10.0536C3.80791 10.3919 4.34498 10.6605 5.41912 11.1975L9.86397 13.42C10.041 13.5085 10.1295 13.5527 10.2061 13.6118C10.2742 13.6643 10.3352 13.7253 10.3876 13.7933C10.4468 13.87 10.491 13.9585 10.5795 14.1355Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="controls">
        <div className="controls-container">
          <button
            onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
          >
            <svg className={isCameraEnabled?"" : "disable"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={() =>
              localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
            }
          >
            <svg className={isMicrophoneEnabled?"":"muted"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><g><rect fillRule="nonzero" x="0" y="0" width="24" height="24"></rect><rect stroke="currentColor" strokeWidth="2" strokeLinecap="round" x="9" y="3" width="6" height="11" rx="3"></rect><line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></line><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></line><path d="M19,11 C19,14.866 15.866,18 12,18 C8.13401,18 5,14.866 5,11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path></g></g></svg>
          </button>
          <button type="button" onClick={() => setChatOpen((prev) => !prev)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M8 10H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 10H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 10H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 13V7C21 5.11438 21 4.17157 20.4142 3.58579C19.8284 3 18.8856 3 17 3H7C5.11438 3 4.17157 3 3.58579 3.58579C3 4.17157 3 5.11438 3 7V13C3 14.8856 3 15.8284 3.58579 16.4142C4.17157 17 5.11438 17 7 17H7.5C7.77614 17 8 17.2239 8 17.5V20V20.1499C8 20.5037 8.40137 20.7081 8.6875 20.5L13.0956 17.2941C13.3584 17.103 13.675 17 14 17H17C18.8856 17 19.8284 17 20.4142 16.4142C21 15.8284 21 14.8856 21 13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
          </button>
          <button
            {...buttonProps}
            onClick={(e) => {
              buttonProps.onClick(e);
              onLeave?.();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M15.6666 8L17.75 10.5L15.6666 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path fillRule="evenodd" clipRule="evenodd" d="M15.6666 13L17.75 10.5L15.6666 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.5 10.5L10 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="4" y1="3.5" x2="13" y2="3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="4" y1="17.5" x2="13" y2="17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M13 3.5V7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M13 13.5V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M4 3.5L4 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomUI;
