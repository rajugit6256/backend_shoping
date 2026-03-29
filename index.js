const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/database");
const userRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/job.routes");

const app = express();
const port = process.env.PORT || 5000;

// Guard: ensure critical env vars exist on startup
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  console.error("FATAL: JWT secrets are missing from environment variables");
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL,
      process.env.STAGING_FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});
app.use("/api/v1", userRoutes);
app.use("/api/v1", jobRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server only after DB connects
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
