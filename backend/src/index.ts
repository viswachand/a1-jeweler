import express from "express";
import { json } from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";

// Routes
import userRoutes from "./routes/userRoutes";
import itemRoutes from "./routes/itemRoutes";
import policyRoutes from "./routes/policyRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import clockSummmaryRoutes from "./routes/clockSummaryRoutes";

// Middleware
import { errorHandler } from "./middleware/error-handler";

dotenv.config();
const app = express();


app.set("trust proxy", 1);
app.use(json());

// 🔐 Production CORS
const allowedOrigins = [
    "http://localhost:5173",
    "https://vishrx.com",
    "https://www.vishrx.com"
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn("Blocked CORS origin:", origin);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// 🔧 API Routes
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/policy", policyRoutes);
app.use("/api/clock", clockSummmaryRoutes);

// 🧱 Serve Frontend
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// app.get("*", (_req, res) => {
//     res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
// });

// 🧠 Global Error Handler
app.use(errorHandler);

// 🚀 Start Server
const start = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err);
    }
};

start();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
