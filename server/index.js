import dotenv from "dotenv";
dotenv.config(); // LOAD ONCE AT THE TOP

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import allRoutes from "./routes/allRoutes.js";

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", allRoutes);

app.get("/", (req, res) => {
  res.send("LuxeNest MERN Backend Running!");
});

// Debug env loading
console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
console.log("OPENAI_API_KEY loaded:", !!process.env.OPENAI_API_KEY);

// Connect DB + Start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () =>
      console.log("Backend → http://localhost:5000")
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
