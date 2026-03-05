# StudyRoom

A browser-based video collaboration app built for small group sessions. Users can create or join public and private rooms, communicate over video and audio, and chat in real time — no account required.

Live at: https://study-room-topaz.vercel.app

---

## What it does

- Create a public or private study room with a custom name and optional password
- Browse and join active public rooms from the lobby
- Pre-join screen to configure camera and microphone before entering
- Real-time video grid that adapts to the number of participants
- In-room text chat with participant avatars and timestamps
- Participant panel showing who is in the room and their mic/camera status
- Speaking indicator and mute/camera-off overlays per participant
- Screen sharing support
- Rooms are automatically removed from the list when the last participant leaves

---

## Tech stack

**Frontend** — React, LiveKit Components React, livekit-client

**Backend** — Node.js, Express, MongoDB (Mongoose), LiveKit Server SDK

**Infrastructure** — LiveKit Cloud for WebRTC, Vercel (frontend), Railway (backend), MongoDB Atlas

---

## Running locally

### Prerequisites

- Node.js
- A [LiveKit Cloud](https://livekit.io) account
- A MongoDB Atlas cluster (or local MongoDB)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```
LIVEKIT_URL=wss://your-app.livekit.cloud
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

```bash
node server.cjs
```

### Frontend

```bash
npm install
```

Create a `.env` file in the root:

```
REACT_APP_API_URL=http://localhost:3000
```

```bash
npm start
```

---

## Notes

Rooms expire automatically after one hour or when all participants have left, whichever comes first. Private rooms require a password to join and do not appear in the public room list.