"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const login_signup_controller_1 = require("./controllers/login-signup-controller");
dotenv_1.default.config();
const url = process.env.MONGO_URI;
if (!url) {
    throw new Error("URI not found!");
}
mongoose_1.default.connect(url)
    .then(() => {
    console.log("Connection Successful");
    (0, login_signup_controller_1.scheduleStatusUpdate)();
})
    .catch((err) => {
    console.log("Error connecting to MongoDB : ", err);
});
