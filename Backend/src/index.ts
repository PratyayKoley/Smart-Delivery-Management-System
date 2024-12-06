// Imports
import express, {Request, Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// Database Connection
import './database'

// Import Routes
import partnerRoutes from "./routes/partner-routes";
import orderRoutes from "./routes/order-routes";
import assignmentRoutes from "./routes/assignment-routes";
import userLoginRegisterRoutes from "./routes/login-signup-routes";
import bodyParser from 'body-parser';

// Initialization
dotenv.config();
const app = express();
const port: number = parseInt(process.env.PORT || '5000');

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Routes
app.use("/api/partners", partnerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/user", userLoginRegisterRoutes);

// Server Connection
app.get("/", (req: Request, res: Response): void => {
    res.send("Welcome to Smart Delivery Management System");
})

app.listen(port, (): void => {
    console.log(`Server is running on PORT : ${port}`);
});