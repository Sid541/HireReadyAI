import "dotenv/config";
import express from "express";
import connectDB from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";


const PORT = 3000;
const app = express();

// ✅ ALL middleware BEFORE routes
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ✅ Routes AFTER middleware
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);

connectDB();


app.listen(PORT, () => {
    console.log("Server started at 3000");
});

