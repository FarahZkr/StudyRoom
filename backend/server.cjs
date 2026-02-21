const fetch = require("node-fetch");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
// const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());

// app.use((req, res, next) => {
//   console.log(req.path, req.method);
//   next();
// });
// // ROUTES
// app.use("/palz/users", userRoutes);
// // use defaults if env values missing
// const PORT = process.env.PORT || 3000;
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/studyroom";

// mongoose
//   .connect(MONGODB_URI)
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Connected to DB & listening on port ${PORT}!`);
//     });
//   })
//   .catch((error) => console.log(error));

const { AccessToken } = require("livekit-server-sdk");

// ----------------- LIVEKIT API -----------------
app.post("/connect", async (req, res) => {
  try {
    const { roomName, participantName } = req.body;
    console.log("roomName:", roomName, "participantName:", participantName);

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
    console.log("Generated token:", jwt);

    res.json({ token: jwt });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));