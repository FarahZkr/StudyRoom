require("dotenv").config();
const fetch = require("node-fetch");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { AccessToken, RoomServiceClient, WebhookReceiver } = require("livekit-server-sdk");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/StudyRoom";

// ----------------- MONGODB -----------------
const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  isPrivate: { type: Boolean, default: false },
  maxUsers: { type: Number, default: 6 },
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Room = mongoose.model("rooms", roomSchema);

// ----------------- ROUTES -----------------
// List public rooms
app.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect / join room
app.post("/connect", async (req, res) => {
  try {
    const { roomName, isPrivate, maxUsers, password, action, username } = req.body;
    let room = await Room.findOne({ roomId: roomName });
    const roomService = new RoomServiceClient(
      process.env.LIVEKIT_URL,
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );

    if (action === "host") {
      if (room) {
        return res.status(400).json({ error: "Room name already exists" });
      }
      room = new Room({
        roomId: roomName,
        isPrivate: isPrivate,
        maxUsers: maxUsers,
        password: password,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      });

      await room.save();
      // Create the room in LiveKit using the REST API
      await roomService.createRoom({
        name: roomName,
      });

      // Generate LiveKit token
      const token = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        { identity: username, name: username }
      );
      token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
      });

      const jwt = await token.toJwt();
      res.json({ token: jwt });
    }
    else {
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      if (room.isPrivate && room.password !== password) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      // Check room capacity using LiveKit API
      const participants = await roomService.listParticipants(roomName);
      if (participants.length >= room.maxUsers) {
        console.log(`Room ${roomName} is full. Max users: ${room.maxUsers}`);
        return res.status(403).json({ error: "Room is full" });
      }

      // Generate LiveKit token
      const token = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        { identity: username, name: username }
      );
      token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
      });

      const jwt = await token.toJwt();
      res.json({ token: jwt });
    }
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/livekit-webhook", express.raw({ type: "application/webhook+json" }), async (req, res) => {
  try {
    const receiver = new WebhookReceiver(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );

    // This properly validates and parses the webhook
    const event = await receiver.receive(req.body, req.get("Authorization"));

    if (event.event === "participant_left" && event.room?.name) {
      const roomName = event.room.name;
      const roomService = new RoomServiceClient(
        process.env.LIVEKIT_URL,
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET
      );

      // Delete the room from the db if empty
      const participantsResponse = await roomService.listParticipants(roomName);
      const participants = participantsResponse || [];
      if (participants.length === 0) {
        await Room.deleteOne({ roomId: roomName });
        console.log(`Deleted empty room ${roomName}`);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

// ----------------- START SERVER -----------------
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connected to DB & listening on port ${PORT}!`);
    });
  })
  .catch((error) => console.log(error));