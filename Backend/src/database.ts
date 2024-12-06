import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const url: string = process.env.MONGO_URI as string;

if (!url) {
    throw new Error("URI not found!");
}

mongoose.connect(url)
    .then((): void => {
        console.log("Connection Successful");
    })
    .catch((err): void => {
        console.log("Error connecting to MongoDB : ", err);
    })