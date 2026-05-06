import express from "express";
import connectDB from "./utils/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"
import interviewRoutes from "./routes/interviewRoutes.js"
import cookieParser from "cookie-parser"
import cors from "cors"

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cookieParser());
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}))

connectDB();

app.use("/api/auth",authRoutes);
app.use("/api/interview",interviewRoutes);

app.listen(PORT, () => {
    console.log("Server started at 3000");
});