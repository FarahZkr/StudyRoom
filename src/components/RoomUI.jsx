import { useEffect, useState } from "react";
import {
  useLocalParticipant,
  useParticipants,
  VideoTrack,
  AudioTrack,
  useTracks,
  useDisconnectButton,
  useDataChannel,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "./RoomUI.css";

function ParticipantTile({
  track,
  audioTracks,
  screenShareTracks,
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
  const screenShare = screenShareTracks.find(
    (s) => s.participant.identity === track.participant.identity,
  );
  console.log(participants);

  return (
    <div className="participant-tile">
      {isSpeaking && <div className="speaking-indicator"></div>}
      <div className="participant-name">
        {track.participant.identity === localParticipant.identity
          ? "You"
          : track.participant.name}
      </div>
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
          <span>{getInitials(track.participant.name)}</span>
        </div>
      )}
      <VideoTrack trackRef={track} className={isCameraOn ? "" : "hidden"} />
      {screenShare && (
        <div className="screenshare-overlay">
          <VideoTrack trackRef={screenShare} />
        </div>
      )}
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
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [volume, setVolume] = useState(1);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTabSelected, setChatTabSelected] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { buttonProps } = useDisconnectButton({ stopTracks: true });
  const {
    localParticipant,
    isCameraEnabled,
    isMicrophoneEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant();
  const participants = useParticipants();
  const room = useRoomContext();
  const videoTracks = useTracks([Track.Source.Camera]);
  const audioTracks = useTracks([Track.Source.Microphone]);
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const cols = Math.ceil(Math.sqrt(videoTracks.length));
  const names = participants.map(p => p.identity);

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
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const msg = { sender: localParticipant.name ?? localParticipant.identity, text: input, time: time };
    send(new TextEncoder().encode(JSON.stringify(msg)), { reliable: true });
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!room.metadata && !room.roomInfo && !room.roomInfo.creationTimeMs)
        return;
      setTotalSeconds(
        Math.floor((Date.now() - Number(room.roomInfo.creationTimeMs)) / 1000),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (val) => String(val).padStart(2, "0");
  const hours = pad(Math.floor(totalSeconds / 3600));
  const minutes = pad(Math.floor((totalSeconds % 3600) / 60));
  const seconds = pad(totalSeconds % 60);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    // set volume on all remote audio elements
    document.querySelectorAll("audio").forEach((el) => {
      el.volume = val;
    });
  };
  const MicOffIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><g><rect fillRule="nonzero" x="0" y="0" width="24" height="24"></rect><rect stroke="currentColor" strokeWidth="2" strokeLinecap="round" x="9" y="3" width="6" height="11" rx="3"></rect><line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></line><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></line><path d="M19,11 C19,14.866 15.866,18 12,18 C8.13401,18 5,14.866 5,11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></g></g></svg>);
  const MicOnIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><g><rect fillRule="nonzero" x="0" y="0" width="24" height="24"></rect><rect stroke="currentColor" strokeWidth="2" strokeLinecap="round" x="9" y="3" width="6" height="11" rx="3"></rect><line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></line><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></line><path d="M19,11 C19,14.866 15.866,18 12,18 C8.13401,18 5,14.866 5,11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path></g></g></svg>);
  const CameraOnIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
  const CameraOffIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);

  return (
    <div className="room">
      <div className="main-header">
        <div className="left-header">
          <div id="roomTimer">
            {hours}:{minutes}:{seconds}
          </div>
          <div className="left-header-participants">
            {participants.length}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -0.5 25 25"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.9238 7.281C14.9227 8.5394 13.9018 9.55874 12.6435 9.558C11.3851 9.55726 10.3654 8.53673 10.3658 7.27833C10.3662 6.01994 11.3864 5 12.6448 5C13.2495 5.00027 13.8293 5.24073 14.2567 5.6685C14.6841 6.09627 14.924 6.67631 14.9238 7.281Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.9968 12.919H10.2968C8.65471 12.9706 7.35028 14.3166 7.35028 15.9595C7.35028 17.6024 8.65471 18.9484 10.2968 19H14.9968C16.6388 18.9484 17.9432 17.6024 17.9432 15.9595C17.9432 14.3166 16.6388 12.9706 14.9968 12.919V12.919Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.6878 9.02403C20.6872 9.98653 19.9066 10.7664 18.9441 10.766C17.9816 10.7657 17.2016 9.9852 17.2018 9.0227C17.202 8.06019 17.9823 7.28003 18.9448 7.28003C19.4072 7.28003 19.8507 7.4638 20.1776 7.7909C20.5045 8.11799 20.688 8.56158 20.6878 9.02403V9.02403Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.3338 9.02401C4.3338 9.98664 5.11417 10.767 6.0768 10.767C7.03943 10.767 7.8198 9.98664 7.8198 9.02401C7.8198 8.06137 7.03943 7.28101 6.0768 7.28101C5.11417 7.28101 4.3338 8.06137 4.3338 9.02401V9.02401Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.4368 12.839C19.0226 12.839 18.6868 13.1748 18.6868 13.589C18.6868 14.0032 19.0226 14.339 19.4368 14.339V12.839ZM20.7438 13.589L20.7593 12.8392C20.7541 12.839 20.749 12.839 20.7438 12.839V13.589ZM20.7438 18.24V18.99C20.749 18.99 20.7541 18.9899 20.7593 18.9898L20.7438 18.24ZM19.4368 17.49C19.0226 17.49 18.6868 17.8258 18.6868 18.24C18.6868 18.6542 19.0226 18.99 19.4368 18.99V17.49ZM5.58477 14.339C5.99899 14.339 6.33477 14.0032 6.33477 13.589C6.33477 13.1748 5.99899 12.839 5.58477 12.839V14.339ZM4.27777 13.589V12.839C4.27259 12.839 4.26741 12.839 4.26222 12.8392L4.27777 13.589ZM4.27777 18.24L4.26222 18.9898C4.26741 18.9899 4.27259 18.99 4.27777 18.99V18.24ZM5.58477 18.99C5.99899 18.99 6.33477 18.6542 6.33477 18.24C6.33477 17.8258 5.99899 17.49 5.58477 17.49V18.99ZM19.4368 14.339H20.7438V12.839H19.4368V14.339ZM20.7282 14.3388C21.5857 14.3566 22.2715 15.0568 22.2715 15.9145H23.7715C23.7715 14.2405 22.4329 12.8739 20.7593 12.8392L20.7282 14.3388ZM22.2715 15.9145C22.2715 16.7722 21.5857 17.4724 20.7282 17.4902L20.7593 18.9898C22.4329 18.9551 23.7715 17.5885 23.7715 15.9145H22.2715ZM20.7438 17.49H19.4368V18.99H20.7438V17.49ZM5.58477 12.839H4.27777V14.339H5.58477V12.839ZM4.26222 12.8392C2.58861 12.8739 1.25 14.2405 1.25 15.9145H2.75C2.75 15.0568 3.43584 14.3566 4.29332 14.3388L4.26222 12.8392ZM1.25 15.9145C1.25 17.5885 2.58861 18.9551 4.26222 18.9898L4.29332 17.4902C3.43584 17.4724 2.75 16.7722 2.75 15.9145H1.25ZM4.27777 18.99H5.58477V17.49H4.27777V18.99Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        <div className="right-header">
          <button type="button" onClick={() => setChatOpen((prev) => !prev)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 6H20M4 12H20M4 18H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle className="hidden" cx="20" cy="4" r="3" fill="#ea4335" />
            </svg>
          </button>
        </div>
      </div>
      <div className="main-container">
        <div className="video-container">
          <div className="controls">
            <div className="controls-container">
              <button
                onClick={() =>
                  localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
                }
              >
                {isMicrophoneEnabled? 
                  <>
                    <MicOnIcon/>
                  </> : 
                  <>
                    <MicOffIcon/>
                  </>
                }
              </button>
              <button
                onClick={() =>
                  localParticipant.setCameraEnabled(!isCameraEnabled)
                }
              >
                {isCameraEnabled ? <CameraOnIcon /> : <CameraOffIcon />}
              </button>
              <button
                onClick={async () => {
                  try {
                    await localParticipant.setScreenShareEnabled(
                      !isScreenShareEnabled,
                    );
                  } catch (e) {
                    if (e.name === "NotAllowedError") return;
                    console.error(e);
                  }
                }}
              >
                {isScreenShareEnabled ? (
                  <>
                    <svg
                      id="screenShareEnabled"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M13 3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2v-3" />
                      <path d="M8 21h8" />
                      <path d="M12 17v4" />
                      <path d="M22 3l-5 5" />
                      <path d="M17 3l5 5" />
                    </svg>
                  </>
                ) : (
                  <>
                    <svg
                      id="screenShareDisabled"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      width="22px"
                    >
                      <path
                        d="M16 10.5H8M16 10.5L13 13.5M16 10.5L13 7.5M12 20H16M12 20H8M12 20V16M12 16H5C4.44772 16 4 15.5523 4 15V6C4 5.44771 4.44772 5 5 5H19C19.5523 5 20 5.44772 20 6V7M12 16H19C19.5523 16 20 15.5523 20 15V11"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
              <div className="volume-parent">
                <div
                  className={
                    volumeOpen ? "volume-container active" : "volume-container"
                  }
                >
                  <input
                    id="rangeSlider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue="1"
                    style={{
                      background: `linear-gradient(to right, black ${volume * 100}%, white ${volume * 100}%)`,
                    }}
                    onChange={(e) => {
                      handleVolumeChange(e);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setVolumeOpen((prev) => !prev)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2 13C2 15.2091 3.79086 17 6 17H6.19669C6.69707 17 7.17928 17.1876 7.54814 17.5257L10.4773 20.2107C11.0311 20.7184 11.755 21 12.5063 21C13.7594 21 14.9494 20.2016 15.2601 18.8803C15.5904 17.476 16 15.1081 16 12C16 8.89192 15.5904 6.52403 15.2601 5.11974C14.9494 3.79838 13.7594 3 12.5063 3C11.755 3 11.0311 3.28161 10.4773 3.78926L7.54813 6.47431C7.17928 6.81243 6.69707 7 6.19669 7H6C3.79086 7 2 8.79086 2 11V13ZM6 15C4.89543 15 4 14.1046 4 13V11C4 9.89543 4.89543 9 6 9H6.19669C7.19745 9 8.16186 8.62486 8.89958 7.94862L11.8287 5.26357C12.0137 5.09404 12.2554 5 12.5063 5C12.9376 5 13.2384 5.25937 13.3132 5.57761C13.6134 6.85393 14 9.06723 14 12C14 14.9328 13.6134 17.1461 13.3132 18.4224C13.2384 18.7406 12.9376 19 12.5063 19C12.2554 19 12.0137 18.906 11.8287 18.7364L8.89958 16.0514C8.16186 15.3751 7.19745 15 6.19669 15H6Z"
                      fill="currentColor"
                    />
                    <path
                      d="M20.5723 6.09607C21.0716 5.85987 21.6677 6.0731 21.9039 6.57232C22.6447 8.13791 22.9979 10.0843 23 11.9889C23.0021 13.8934 22.6531 15.8479 21.9036 17.4285C21.6669 17.9275 21.0706 18.1402 20.5715 17.9036C20.0725 17.6669 19.8598 17.0706 20.0964 16.5715C20.6881 15.3238 21.0018 13.679 21 11.991C20.9981 10.303 20.6808 8.66357 20.0961 7.42768C19.8599 6.92845 20.0731 6.33227 20.5723 6.09607Z"
                      fill="currentColor"
                    />
                    <path
                      d="M17.5528 15.8944C17.0588 15.6474 16.8586 15.0468 17.1056 14.5528C17.9648 12.8343 17.9648 11.1657 17.1056 9.44721C16.8586 8.95324 17.0588 8.35256 17.5528 8.10557C18.0468 7.85858 18.6474 8.05881 18.8944 8.55279C20.0352 10.8343 20.0352 13.1657 18.8944 15.4472C18.6474 15.9412 18.0468 16.1414 17.5528 15.8944Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              <button
                id="leavebtn"
                {...buttonProps}
                onClick={(e) => {
                  buttonProps.onClick(e);
                  onLeave?.();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.6666 8L17.75 10.5L15.6666 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.6666 13L17.75 10.5L15.6666 13Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.5 10.5L10 10.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4"
                    y1="3.5"
                    x2="13"
                    y2="3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4"
                    y1="17.5"
                    x2="13"
                    y2="17.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 3.5V7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 13.5V17.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 3.5L4 17.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div
            className={cols < 3? "video-grid grid-sm":"video-grid"}
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
          >
            {videoTracks.map((track) => (
              <ParticipantTile
                key={track.publication.trackSid}
                track={track}
                audioTracks={audioTracks}
                screenShareTracks={screenShareTracks}
                localParticipant={localParticipant}
                participants={participants}
                getInitials={getInitials}
              />
            ))}
          </div>
        </div>
        <div className={`chat ${chatOpen ? "" : "hidden"}`}>
          <div className="chat-tabs">
            <div
              className={
                chatTabSelected ? "chat-active-tab" : "chat-active-tab active"
              }
            ></div>
            <button
              className="chat-tab"
              type="button"
              onClick={() => setChatTabSelected(true)}
            >
              Chat
            </button>
            <button
              className="chat-tab"
              type="button"
              onClick={() => setChatTabSelected(false)}
            >
              Participants
            </button>
          </div>
          <div
            className={chatTabSelected ? "chat-content hidden" : "chat-content"}
          >
            {participants.map(p => (
              <div key={p.identity} className="user-profile">
                <div className="flex" style={{alignItems:"center"}}>
                  <div className="user-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                      <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <span>
                    {p.name}
                  </span>
                </div>
             
                <div className="user-values">
                  <div></div>
                  {p.isMicrophoneEnabled ? 
                    <>
                      <MicOnIcon/>
                    </> :
                    <>
                      <MicOffIcon/>
                    </>
                  }
                  {p.isCameraEnabled ? 
                    <>
                      <CameraOnIcon/>
                    </> :
                    <>
                      <CameraOffIcon/>
                    </>
                  }
                </div>
              </div>
            ))}
          </div>
          <div
            className={chatTabSelected ? "chat-content" : "chat-content hidden"}
          >
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className="msg-container">
                  <div className="msg-sender">
                    {msg.sender} <span>{msg.time}</span>
                  </div>
                  <div className="chat-message">
                    <span className="chat-sender">
                      {getInitials(msg.sender)}
                    </span>
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
      </div>
    </div>
  );
}

export default RoomUI;
