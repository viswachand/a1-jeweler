import express from "express";
import { json } from "body-parser";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import itemRoutes from "./routes/itemRoutes";
import policyRoutes from './routes/policyRoutes'
import categoryRoutes from "./routes/catergoryRoutes";
import cookieSession from 'cookie-session';
import { errorHandler } from "./middleware/error-handler";
import cors from "cors";
import mongoose from "mongoose";


dotenv.config();
const app = express();

app.use(json());


app.use(json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://a1-jeweler-3.onrender.com");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use(
    cors({
        origin: "https://a1-jeweler-3.onrender.com",
        credentials: true,
    })
);

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
app.use("/api/policy", policyRoutes)

// app.all('*', async (req, res) => {
//     throw new NotFoundError();
// });

app.use(errorHandler);

const start = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log("Error connecting to MongoDB:", err);
    }
}

start();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
