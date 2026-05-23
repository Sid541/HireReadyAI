import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";

// Render automatically injects an environment variable named PORT. 
// Falling back to 3000 ensures your local development setup remains uninterrupted.
const PORT = process.env.PORT || 3000;
const app = express();

// ==========================================
// 🛠️ MIDDLEWARE LAYER (Must execute before routes)
// ==========================================

// Setup allowed origins checklist
const allowedOrigins = [
    "http://localhost:5173",                     // Local Vite development site
    "https://hirereadyai-1.onrender.com"         // Production live frontend site
];

app.use(cors({
    origin: function (origin, callback) {
        // Allows server-to-server tools, curl requests, or postman testing
        if (!origin) return callback(null, true);
        
        // Check if incoming request comes from an origin matching our approved checklist
        if (allowedOrigins.indexOf(origin) === -1) {
            const corsErrorMsg = `The CORS policy for this app does not allow access from origin: ${origin}`;
            return callback(new Error(corsErrorMsg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

// ==========================================
// 🚀 APPLICATION ROUTES 
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);

// Establish connection to MongoDB cluster
connectDB();

// Bind application to active environment network port
app.listen(PORT, () => {
    console.log(`Server successfully started on port ${PORT}`);
});