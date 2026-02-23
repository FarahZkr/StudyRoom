import React, { useState } from "react";
import {
  useLocalParticipant,
  useParticipants,
  VideoTrack,
  AudioTrack,
  useTracks,
  useDisconnectButton,
  useDataChannel
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
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
            {isCameraEnabled ? "Disable Camera" : "Enable Camera"}
            </button>
            <button
            onClick={() =>
                localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
            }
            >
            {isMicrophoneEnabled ? "Mute" : "Unmute"}
            </button>
            <button type="button" onClick={() => setChatOpen(prev => !prev)}>Chat</button>
            <button
            {...buttonProps}
            onClick={(e) => {
                buttonProps.onClick(e);
                onLeave?.();
            }}
            >
            Leave
            </button>
        </div>
      </div>
    </div>
  );
}

export default RoomUI;
