import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { scheduleStatusUpdate } from './controllers/login-signup-controller';


dotenv.config();

const url: string = process.env.MONGO_URI as string;

if (!url) {
    throw new Error("URI not found!");
}

mongoose.connect(url)
    .then((): void => {
        console.log("Connection Successful");
        scheduleStatusUpdate();
    })
    .catch((err): void => {
        console.log("Error connecting to MongoDB : ", err);
    })