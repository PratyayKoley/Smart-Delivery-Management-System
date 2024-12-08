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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMetrics = exports.deletePartners = exports.updatePartners = exports.getAllPartners = exports.createPartners = void 0;
const deliveryPartner_model_1 = require("../models/deliveryPartner.model");
const order_model_1 = require("../models/order.model");
const createPartners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({
                success: false,
                message: "Data is missing. Please provide the required details.",
            });
            return;
        }
        ;
        const newPartner = yield deliveryPartner_model_1.DeliveryPartnerModel.create(req.body);
        if (!newPartner) {
            res.status(500).json({
                success: false,
                message: "Unable to create the delivery partner. Please try again later.",
            });
            return;
        }
        ;
        res.status(201).json({
            success: true,
            message: "Delivery partner created successfully!",
            data: newPartner,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error creating partner:", error.message);
        }
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please contact support.",
        });
    }
});
exports.createPartners = createPartners;
const getAllPartners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const partnerData = yield deliveryPartner_model_1.DeliveryPartnerModel.find();
        res.status(200).json({
            success: true,
            data: partnerData,
            message: "Delivery Partners fetched successfully.",
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error getting partner:", error.message);
        }
        res.status(500).json({
            success: false,
            message: "Failed to fetch Delivery Partners",
        });
    }
});
exports.getAllPartners = getAllPartners;
const updatePartners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedPartnerData = req.body;
    if (!id) {
        res.status(400).json({
            success: false,
            message: "Invalid ID provided. Please provide correct details.",
        });
        return;
    }
    try {
        const updatedPartner = yield deliveryPartner_model_1.DeliveryPartnerModel.findByIdAndUpdate(id, { $set: updatedPartnerData }, { new: true, runValidators: true });
        if (!updatedPartner) {
            res.status(404).json({
                success: false,
                message: "Delivery Partner not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Delivery Partner successfully updated.",
            data: updatedPartner,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error updating partner:", error.message);
        }
        res.status(500).json({
            success: false,
            message: "Failed to update partner.",
        });
    }
});
exports.updatePartners = updatePartners;
const deletePartners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            success: false,
            message: "Invalid ID provided. Please provide correct details.",
        });
        return;
    }
    try {
        const deletedPartner = yield deliveryPartner_model_1.DeliveryPartnerModel.findByIdAndDelete({ _id: id });
        if (!deletedPartner) {
            res.status(404).json({
                success: false,
                message: "Delivery Partner not found."
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Delivery Partner successfully deleted.",
            data: deletedPartner,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error deleting partner:", error.message);
        }
        res.status(500).json({
            success: false,
            message: "Failed to delete partner.",
        });
    }
});
exports.deletePartners = deletePartners;
const calculateMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { partner } = yield req.body;
        const currentDate = new Date();
        const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
        console.log(partner);
        // Calculate active orders
        const activeOrders = yield order_model_1.OrderModel.countDocuments({
            assignedTo: partner._id,
            status: { $in: ['assigned', 'picked'] }
        });
        // Calculate completed orders today
        const completedToday = yield order_model_1.OrderModel.countDocuments({
            assignedTo: partner._id,
            status: 'delivered',
            updatedAt: { $gte: startOfDay }
        });
        // Calculate average delivery time
        const averageDeliveryTime = yield order_model_1.OrderModel.aggregate([
            {
                $match: {
                    assignedTo: partner._id,
                    status: 'delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } }
                }
            }
        ]);
        const avgTimeInMinutes = averageDeliveryTime.length > 0
            ? Math.round(averageDeliveryTime[0].avgTime / (1000 * 60))
            : 0;
        // Fetch total completed and canceled orders for the partner
        const totalCompletedOrders = yield order_model_1.OrderModel.countDocuments({
            assignedTo: partner._id,
            status: 'delivered'
        });
        const totalCanceledOrders = yield order_model_1.OrderModel.countDocuments({
            assignedTo: partner._id,
            status: 'canceled'
        });
        // Calculate rating (example logic: total completed orders minus total canceled orders)
        const updatedRating = Math.max(0, Math.min(5, partner.metrics.rating + (totalCompletedOrders - totalCanceledOrders) * 0.01));
        // Update the partner's metrics in the database
        yield deliveryPartner_model_1.DeliveryPartnerModel.findByIdAndUpdate(partner._id, {
            $set: {
                'metrics.completedOrders': totalCompletedOrders,
                'metrics.cancelledOrders': totalCanceledOrders,
                'metrics.rating': updatedRating
            }
        });
        // Prepare dashboard data
        const dashboardData = {
            activeOrders,
            completedToday,
            currentArea: partner.areas[0] || 'Not set',
            averageDeliveryTime: `${avgTimeInMinutes} mins`,
            rating: updatedRating.toFixed(1),
        };
        res.json(dashboardData);
    }
    catch (error) {
        console.error('Error in calculateMetrics:', error);
        res.status(500).json({ error: 'Error fetching dashboard data' });
    }
});
exports.calculateMetrics = calculateMetrics;
