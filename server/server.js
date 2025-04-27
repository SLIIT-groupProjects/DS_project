import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authAdminRoutes from "./routes/authAdminRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/authAdmin", authAdminRoutes);
app.use("/api/admin", adminRoutes);

// Start server
const PORT = process.env.PORT || 5008;
app.listen(PORT, () => console.log(`Admin service running on port ${PORT}`));
