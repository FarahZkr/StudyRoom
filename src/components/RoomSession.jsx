import './RoomSession.css';
import { useState, useEffect, useRef } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import RoomUI from './RoomUI';

function RoomSession({ token, onLeave, allowMics }) {
  const LIVEKIT_URL = "wss://studyrooms-z2ioh2bj.livekit.cloud";
  const [preJoinValues, setPreJoinValues] = useState(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(allowMics);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (preJoinValues !== null) return;
    const startPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: camOn, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        console.error('Camera preview error:', e);
      }
    };
    startPreview();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [camOn, preJoinValues]);

  const handleJoin = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setPreJoinValues({ videoEnabled: camOn, audioEnabled: micOn });
  };

  if (!token) return <div />;

  if (preJoinValues === null) {
    return (
      <div className="prejoin-bg">
        <div className="prejoin-card">
          <h2 className="prejoin-title">Ready to join?</h2>
          <p className="prejoin-subtitle">Set up your camera and mic before entering</p>

          <div className="prejoin-preview">
            {camOn
              ? <video ref={videoRef} autoPlay muted playsInline className="prejoin-video" />
              : (
                <div className="prejoin-cam-off">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="3" x2="21" y2="21" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Camera off</span>
                </div>
              )
            }
          </div>

          <div className="prejoin-toggles">
            <button
              type="button"
              className={`prejoin-toggle ${camOn ? 'active' : ''}`}
              onClick={() => setCamOn(p => !p)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Camera {camOn ? 'On' : 'Off'}
            </button>

            {allowMics && (
              <button
                type="button"
                className={`prejoin-toggle ${micOn ? 'active' : ''}`}
                onClick={() => setMicOn(p => !p)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" x="9" y="3" width="6" height="11" rx="3"/>
                  <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M19,11 C19,14.866 15.866,18 12,18 C8.13401,18 5,14.866 5,11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Mic {micOn ? 'On' : 'Off'}
              </button>
            )}
          </div>

          <button className="prejoin-join-btn" onClick={handleJoin}>
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={LIVEKIT_URL}
      connect={true}
      video={true}
      audio={true}
    >
      <RoomUI onLeave={onLeave} allowMics={allowMics} preJoinValues={preJoinValues} />
    </LiveKitRoom>
  );
}

export default RoomSession;