# StudyRoom

StudyRoom is a video collaboration app for small group sessions. There's no sign-up. You pick a name, create or join a room, and you're in. Rooms can be public or password-protected, and they clean themselves up when everyone leaves.

Live at: https://study-room-topaz.vercel.app

---

## Features

- Public and private rooms with optional password protection
- Pre-join screen to set up your camera and mic before entering
- Adaptive video grid, speaking indicators, and per-participant mute/camera overlays
- Real-time chat with a participant list showing everyone's mic and camera status
- Screen sharing
- Rooms expire after one hour or when the last person leaves

---

## How connections work

Rather than peer-to-peer WebRTC, which works fine for two people but gets complicated fast with more, rooms are routed through LiveKit, a self-hostable WebRTC infrastructure layer. Each participant connects to a LiveKit server which handles media routing between everyone in the room. The backend generates a short-lived token per participant, so the LiveKit credentials never touch the client directly.

---

## Stack

React, LiveKit, Node.js, Express, MongoDB, deployed on Vercel and Railway.

---

## Running locally

You'll need a [LiveKit Cloud](https://livekit.io) project and a MongoDB instance to run this yourself.

**Backend** — create a `.env` in the `backend` folder:

```
LIVEKIT_URL=wss://your-app.livekit.cloud
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
MONGODB_URI=your_connection_string
PORT=3000
```

```bash
cd backend && npm install && node server.cjs
```

**Frontend** — create a `.env` in the root:

```
REACT_APP_API_URL=http://localhost:3000
```

```bash
npm install && npm start
```