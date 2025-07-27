import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Load env vars
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("❌ MONGO_URI is not defined in environment variables");
}

// Middlewares
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Define a simple User model
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

// ✅ Root route
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
