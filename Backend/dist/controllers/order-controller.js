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
exports.getPartnerOrders = exports.updateOrderStatus = exports.assignOrders = exports.createOrders = exports.getAllOrders = void 0;
const order_model_1 = require("../models/order.model");
const assignment_model_1 = require("../models/assignment.model");
const deliveryPartner_model_1 = require("../models/deliveryPartner.model");
const mongoose_1 = __importDefault(require("mongoose"));
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderData = yield order_model_1.OrderModel.find();
        res.status(200).json({
            success: true,
            data: orderData,
            message: "Orders fetched successfully.",
        });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error getting orders: ", error.message);
        }
        res.status(500).json({
            success: false,
            message: "Failed to fetch the order details.",
        });
    }
});
exports.getAllOrders = getAllOrders;
const createOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({
                success: false,
                message: "Data is missing. Please provide the required details.",
            });
            return;
        }
        ;
        const newPartner = yield order_model_1.OrderModel.create(req.body);
        if (!newPartner) {
            res.status(500).json({
                success: false,
                message: "Unable to create the delivery order. Please try again later.",
            });
            return;
        }
        ;
        res.status(201).json({
            success: true,
            message: "Delivery order created successfully!",
            data: newPartner,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error creating order:", error.message);
        }
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please contact support.",
        });
    }
});
exports.createOrders = createOrders;
const estimateDeliveryTime = (partnerLoad) => {
    const baseTime = 30; // minutes
    const loadFactor = 1 + (partnerLoad * 0.2); // 20% slower for each order in load
    return baseTime * loadFactor;
};
const extractTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getUTCHours().toString().padStart(2, '0'); // Extract hours in UTC
    const minutes = date.getUTCMinutes().toString().padStart(2, '0'); // Extract minutes in UTC
    return `${hours}:${minutes}`; // Format as HH:mm
};
const assignOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const findBestPartners = (order) => __awaiter(void 0, void 0, void 0, function* () {
        const orderTime = extractTime(order.scheduledFor);
        const availablePartners = yield deliveryPartner_model_1.DeliveryPartnerModel.find({
            status: { $in: ['active', 'inactive'] },
            currentLoad: { $lt: 3 },
            areas: order.area,
            'shift.start': { $lte: orderTime },
            'shift.end': { $gte: orderTime },
        });
        return availablePartners;
    });
    const selectBestPartner = (order, partners) => {
        let bestPartner = partners[0];
        let bestScore = Infinity;
        for (const partner of partners) {
            const estimatedTime = estimateDeliveryTime(partner.currentLoad);
            const score = estimatedTime * (1 + partner.currentLoad * 0.2); // Consider both estimated time and load
            if (score < bestScore) {
                bestScore = score;
                bestPartner = partner;
            }
        }
        return bestPartner;
    };
    try {
        const { orderId } = req.body;
        // Fetch the order by ID
        const order = yield order_model_1.OrderModel.findById(orderId);
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found',
            });
            return;
        }
        // Find the top 5 available partners
        const topPartners = yield findBestPartners(order);
        if (topPartners.length === 0) {
            // Create a failed assignment record
            const failedAssignment = yield assignment_model_1.AssignmentModel.create({
                orderId: order.orderNumber,
                partnerId: null,
                timestamp: new Date(),
                status: 'failed',
                reason: 'Partner not available',
            });
            res.status(400).json({
                success: false,
                status: 400,
                message: 'No available partners for this order',
                data: { assignment: failedAssignment },
            });
            return;
        }
        // Select the best partner
        const bestPartner = selectBestPartner(order, topPartners);
        // Create a new assignment record
        const assignment = yield assignment_model_1.AssignmentModel.create({
            orderId: order.orderNumber,
            partnerId: bestPartner._id,
            timestamp: new Date(),
            status: 'success',
        });
        // Update order and partner data
        order.status = 'assigned';
        // @ts-ignore
        order.assignedTo = bestPartner._id;
        bestPartner.currentLoad += 1;
        // @ts-ignore
        yield Promise.all([order.save(), bestPartner.save()]);
        res.status(200).json({
            success: true,
            data: { order, partner: bestPartner, assignment },
            message: 'Order successfully assigned',
        });
    }
    catch (error) {
        console.error('Error assigning order:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning order',
            error: error.message || 'Unknown error',
        });
    }
});
exports.assignOrders = assignOrders;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const orderData = yield order_model_1.OrderModel.findByIdAndUpdate(id, { status: status, updatedAt: new Date() }, { new: true });
        if (!orderData) {
            res.status(404).json({
                success: false,
                message: "Error finding the order. Please check the order number.",
            });
        }
        res.status(200).json({
            success: true,
            message: "Successfully updated the order status",
            data: orderData,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error updating order status: ", error.message);
        }
        res.status(500).json({
            success: false,
            message: "Failed to update the order status. Please try again later.",
        });
    }
});
exports.updateOrderStatus = updateOrderStatus;
const getPartnerOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validate if id is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'Invalid Partner ID format',
            });
            return;
        }
        const assignmentData = yield order_model_1.OrderModel.find({
            assignedTo: id,
            status: { $in: ['assigned', 'picked'] },
        });
        // If no orders found, return a 404 response
        if (!assignmentData || assignmentData.length === 0) {
            res.status(200).json({
                success: true,
                message: 'No orders found for the provided Partner ID',
            });
            return;
        }
        // If orders found, return them with a success response
        res.status(200).json({
            success: true,
            data: assignmentData,
        });
    }
    catch (error) {
        // Handle unexpected errors
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching partner orders',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.getPartnerOrders = getPartnerOrders;
