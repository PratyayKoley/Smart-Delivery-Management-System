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
exports.getDashboardMetrics = void 0;
const order_model_1 = require("../models/order.model");
const deliveryPartner_model_1 = require("../models/deliveryPartner.model");
const assignment_model_1 = require("../models/assignment.model");
const getDashboardMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch active orders
        const activeOrders = yield order_model_1.OrderModel.countDocuments({ status: { $in: ['pending', 'assigned', 'picked'] } });
        // Fetch available partners
        const availablePartners = yield deliveryPartner_model_1.DeliveryPartnerModel.countDocuments({ status: 'active', currentLoad: { $lt: 3 } });
        // Fetch top areas
        const topAreas = yield order_model_1.OrderModel.aggregate([
            { $group: { _id: '$area', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
            { $project: { _id: 0, area: '$_id' } }
        ]);
        // Fetch recent assignments
        const recentAssignments = yield assignment_model_1.AssignmentModel.countDocuments({
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });
        res.json({
            success: true,
            data: {
                activeOrders,
                availablePartners,
                topAreas: topAreas.map(item => item.area),
                recentAssignments
            }
        });
    }
    catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard metrics' });
    }
});
exports.getDashboardMetrics = getDashboardMetrics;
