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

app.use(cookieSession({
    signed: false,
    secure: false
}))

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));


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
