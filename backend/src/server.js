const path = require("node:path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/tasks");

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "16kb" }));
app.use("/api/tasks", taskRoutes);
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});
app.use(errorHandler);

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Copy .env.example to .env and configure it.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const server = app.listen(port, () => {
    console.log(`Taskly API listening on http://localhost:${port}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, async () => {
      server.close();
      await mongoose.connection.close();
      process.exit(0);
    });
  }
}

start().catch((error) => {
  console.error("Unable to start Taskly API:", error);
  process.exit(1);
});
