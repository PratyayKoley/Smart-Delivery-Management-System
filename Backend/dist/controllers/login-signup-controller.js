"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleStatusUpdate = exports.getActiveInactivePartners = exports.acceptPartner = exports.getPendingPartner = exports.joinAsPartner = exports.getUserData = exports.verifyToken = exports.RegisterControl = exports.LoginControl = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const deliveryPartner_model_1 = require("../models/deliveryPartner.model");
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
dotenv_1.default.config();
const LoginControl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = req.body;
    try {
        const userData = yield deliveryPartner_model_1.DeliveryPartnerModel.findOne({ email: request.email });
        if (!userData) {
            res.status(404).json({
                success: false,
                message: "User does not exist.",
            });
            return;
        }
        // Check if userData is not null and then proceed
        if (typeof userData.password === 'string') {
            const doesPassMatch = yield bcrypt_1.default.compare(request.password, userData.password);
            if (!doesPassMatch) {
                res.status(401).json({
                    success: false,
                    message: "Invalid Credentials",
                });
                return;
            }
            var token = yield jsonwebtoken_1.default.sign({ user_id: userData._id }, process.env.JWT_SECRET || "1234567890qwertyuiop");
            res.status(200).json({
                success: true,
                token: token,
                message: "Login Successful",
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: "User data is incomplete.",
            });
        }
    }
    catch (error) {
        // Safely access error.message and ensure the type
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: errorMessage,
        });
    }
});
exports.LoginControl = LoginControl;
const RegisterControl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reqData = req.body;
        if (!reqData.email || !reqData.password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
            return;
        }
        const existingUser = yield deliveryPartner_model_1.DeliveryPartnerModel.findOne({ email: reqData.email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists.",
            });
            return;
        }
        const salt = bcrypt_1.default.genSaltSync(10);
        const hashedPass = bcrypt_1.default.hashSync(reqData.password, salt);
        reqData.password = hashedPass;
        if (reqData.shift) {
            const shiftParts = reqData.shift.slot.split("-");
            if (shiftParts.length === 2) {
                reqData.shift = {
                    start: shiftParts[0],
                    end: shiftParts[1],
                };
            }
            else {
                res.status(400).json({
                    success: false,
                    message: "Invalid shift format. Expected format: 'HH:mm - HH:mm'",
                });
                return;
            }
        }
        const newUser = yield deliveryPartner_model_1.DeliveryPartnerModel.create(reqData);
        res.status(201).json({
            success: true,
            data: newUser,
            message: "Registration Successful",
        });
    }
    catch (error) {
        console.error("Registration Failed : ", error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
exports.RegisterControl = RegisterControl;
const verifyToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({
            success: false,
            message: "Token not provided or malformed."
        });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "1234567890qwertyuiop");
        const userData = yield deliveryPartner_model_1.DeliveryPartnerModel.findOne({ _id: decoded.user_id });
        if (!userData) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                role: userData.role,
                email: userData.email,
            },
            message: "Successfully validated",
        });
    }
    catch (error) {
        console.error("Token validation error : ", error.message);
        res.status(401).json({
            success: false,
            message: "Invalid Token",
        });
    }
});
exports.verifyToken = verifyToken;
const getUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const userData = yield deliveryPartner_model_1.DeliveryPartnerModel.findOne({ email: email });
        if (!userData) {
            res.status(404).json({
                success: false,
                message: "User Not Found.",
            });
            return;
        }
        res.status(201).json({
            success: true,
            data: userData,
            message: "Successful",
        });
    }
    catch (error) {
        console.error("Error occurred: ", error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
exports.getUserData = getUserData;
const joinAsPartner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    if (!data) {
        res.status(400).json({
            success: false,
            message: "Required Data is not available.",
        });
        return;
    }
    try {
        const reqPartner = yield deliveryPartner_model_1.DeliveryPartnerModel.findOneAndUpdate({ email: data.email }, { status: "pending" }, { new: true });
        if (!reqPartner) {
            res.status(404).json({
                success: false,
                message: "User not found."
            });
            return;
        }
        res.status(201).json({
            success: true,
            message: "Partner updated successfully.",
            data: reqPartner,
        });
    }
    catch (error) {
        console.error("Error updating partner status:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
        return;
    }
});
exports.joinAsPartner = joinAsPartner;
const getPendingPartner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingPartners = yield deliveryPartner_model_1.DeliveryPartnerModel.find({ status: 'pending' });
        if (!pendingPartners) {
            res.status(404).json({
                success: false,
                message: "No Partners Found",
            });
        }
        res.status(200).json({
            success: true,
            partners: pendingPartners,
            message: "Success",
        });
    }
    catch (error) {
        console.error("Error occurred : ", error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error occurred.",
        });
    }
});
exports.getPendingPartner = getPendingPartner;
const acceptPartner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    if (!data.partnerId || !data.action) {
        res.status(400).json({
            success: false,
            message: "No Credentials found. Try Again."
        });
    }
    try {
        const partner = yield deliveryPartner_model_1.DeliveryPartnerModel.findById(data.partnerId);
        if (!partner) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        let newStatus;
        if (data.action === 'accept') {
            newStatus = 'inactive';
        }
        else if (data.action === 'reject') {
            newStatus = 'new';
        }
        else {
            res.status(400).json({
                success: false,
                message: "Invalid action provided.",
            });
            return;
        }
        const updatedPartner = yield deliveryPartner_model_1.DeliveryPartnerModel.findByIdAndUpdate(data.partnerId, { status: newStatus }, { new: true });
        res.status(200).json({
            success: true,
            message: `Partner status updated to ${newStatus}.`,
            data: updatedPartner
        });
    }
    catch (error) {
        console.error("Error processing accept/reject action:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
        return;
    }
});
exports.acceptPartner = acceptPartner;
const getActiveInactivePartners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const partners = yield deliveryPartner_model_1.DeliveryPartnerModel.find({
            status: { $in: ['active', 'inactive'] }
        });
        if (!partners) {
            res.status(404).json({
                success: false,
                message: "No Partners Found",
            });
            return;
        }
        res.status(201).json({
            success: true,
            message: "Successful",
            partners: partners,
        });
    }
    catch (error) {
        console.error("Error occurred: ", error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
exports.getActiveInactivePartners = getActiveInactivePartners;
const scheduleStatusUpdate = () => {
    node_cron_1.default.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        console.log(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
        try {
            yield deliveryPartner_model_1.DeliveryPartnerModel.updateMany({
                'shift.start': `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
                status: 'inactive'
            }, { $set: { status: 'active' } });
            yield deliveryPartner_model_1.DeliveryPartnerModel.updateMany({
                'shift.end': `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
                status: 'active'
            }, { $set: { status: 'inactive' } });
            console.log('Delivery Partners updated successfully');
        }
        catch (error) {
            console.error('Error Occurred: ', error);
        }
    }));
};
exports.scheduleStatusUpdate = scheduleStatusUpdate;
