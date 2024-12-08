"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Database Connection
require("./database");
// Import Routes
const partner_routes_1 = __importDefault(require("./routes/partner-routes"));
const order_routes_1 = __importDefault(require("./routes/order-routes"));
const assignment_routes_1 = __importDefault(require("./routes/assignment-routes"));
const login_signup_routes_1 = __importDefault(require("./routes/login-signup-routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard-routes"));
const body_parser_1 = __importDefault(require("body-parser"));
// Initialization
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || '5000');
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Routes
app.use("/api/partners", partner_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/assignments", assignment_routes_1.default);
app.use("/api/user", login_signup_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
// Server Connection
app.get("/", (req, res) => {
    res.send("Welcome to Smart Delivery Management System");
});
app.listen(port, () => {
    console.log(`Server is running on PORT : ${port}`);
});
