require("dotenv").config();
const fetch = require("node-fetch");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/studyroom";

// ----------------- MONGODB -----------------
const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  isPrivate: { type: Boolean, default: false },
  maxUsers: { type: Number, default: 6 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Room = mongoose.model("Room", roomSchema);

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
    const { roomName, participantName } = req.body;

    let room = await Room.findOne({ roomId: roomName });
    if (!room) {
      room = new Room({
        roomId: roomName,
        isPrivate: false,
        maxUsers: 6,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour TTL
      });
      await room.save();
      console.log("Created new room:", roomName);
    }

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: participantName }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    res.json({ token: jwt });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: err.message });
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