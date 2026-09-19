# StudyRoom

A video chat app for small group sessions, no sign-up required. Create public or private rooms joinable via a password. The rooms automatically close once everyone leaves.

<img width="861" height="707" alt="Screenshot 2026-06-07 at 7 51 01 PM" src="https://github.com/user-attachments/assets/0fc8502e-1d7a-4866-a82b-c44366d0deda" />

---

## Features

- Public or password-protected rooms
- Pre-join screen to check your camera and mic first
- Adaptive video grid with speaking indicators and mute/camera status per person
- Real-time chat, with a participant list showing who's muted or off-camera
- Screen sharing
- Rooms auto-expire after an hour or when the last person leaves

## Why LiveKit instead of raw WebRTC

To scale beyond peer-to-peer WebRTC, I integrated LiveKit as a central media server. Instead of sending a separate stream to every joined participant, each user only uploads their stream once to the server, making multi-user rooms significantly more efficient.

## Data and Room Cleanup

Each room lives in MongoDB, where it stores the room name, password (if the room is private), maximum number of participants, and an expiry timestamp. Private room passwords are hashed with bcrypt before being stored, never saved as plain text.

When the last participant leaves, LiveKit sends a webhook to the backend, which checks the room's live participant count and deletes it immediately if it's empty. As a fallback, every room also has a MongoDB TTL index that deletes it automatically after one hour, in case the webhook doesn't fire for any reason.

## Live room list

The frontend polls `/rooms` every 3 seconds to keep the public room list and participant counts up to date, rather than requiring a manual refresh.

## Stack

React, LiveKit, Node.js, Express, MongoDB — deployed on Vercel and Railway.

## Running it locally

Requires a LiveKit Cloud project and a MongoDB instance.

**Backend** — create `.env` in the `backend` folder:

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

**Frontend** — create `.env` in the root:

```
REACT_APP_API_URL=http://localhost:3000
```

```bash
npm install && npm start
```
