// ...existing code...
// Load environment variables from .env (must be first)
require("dotenv").config();
// ...existing code...
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
// ...existing code...
const userRoutes = require("./routes/users.cjs");
const eventRoutes = require("./routes/events.cjs");
// ...existing code...
app.use(express.json());
// ...existing code...
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
// ROUTES
app.use("/palz/users", userRoutes);
// ...existing code...
// use defaults if env values missing
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/studyroom";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connected to DB & listening on port ${PORT}!`);
    });
  })
  .catch((error) => console.log(error));