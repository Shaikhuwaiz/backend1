import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 11000;

const allowedOrigins = ["https://nameage-shaikhuwaizs-projects.vercel.app"];

// ✅ CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json()); // Parse JSON

// ✅ OPTIONAL: Preflight handler (if needed)
app.options("*", (req, res) => {
  res.sendStatus(200);
});

// ✅ MongoDB connection and event listener
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connection is open");
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("🔌 Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Schema
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
});
const User = mongoose.model("User", userSchema);

// ✅ Health check route
app.get("/test-db", async (req, res) => {
  try {
    const db = mongoose.connection.db;

    if (!db) {
      return res
        .status(500)
        .json({ message: "❌ Database not initialized yet" });
    }

    const collections = await db.listCollections().toArray();
    res.json({ message: "✅ MongoDB is connected", collections });
  } catch (err) {
    console.error("❌ Error fetching collections:", err);
    res
      .status(500)
      .json({ message: "❌ MongoDB connection failed", error: err });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Server is live! Try /test-db to check MongoDB connection.");
});

// ✅ Create new user
app.post("/users", async (req, res) => {
  const { name, age } = req.body;

  try {
    const newUser = new User({ name, age });
    await newUser.save();
    console.log("✅ Saved to DB:", newUser);
    res.json({
      message: `Received, ${name}! and you are ${age} years old.`,
      user: newUser,
    });
  } catch (err) {
    console.error("🔥 Express error:", err);
    res.status(500).json({ message: "Server internal error" });
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
