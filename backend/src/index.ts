import express from "express";
import { json } from "body-parser";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import itemRoutes from "./routes/itemRoutes";
import policyRoutes from './routes/policyRoutes';
import categoryRoutes from "./routes/categoryRoutes";
import cookieSession from 'cookie-session';
import { errorHandler } from "./middleware/error-handler";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

dotenv.config();
const app = express();

app.set('trust proxy', 1);
app.use(json());

const allowedOrigins = ['https://vishrx.com', 'https://www.vishrx.com'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(
    cookieSession({
        signed: false,
        secure: true,
        sameSite: "none",
    })
);

app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/policy", policyRoutes);

app.use(express.static(path.resolve(__dirname, 'dist')));

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.use(errorHandler);

const start = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log("Error connecting to MongoDB:", err);
    }
};

start();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
