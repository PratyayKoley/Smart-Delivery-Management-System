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
exports.runMetricsEvaluation = exports.getAssignmentMetrics = exports.getAssignments = void 0;
const assignmentMetrics_model_1 = require("../models/assignmentMetrics.model");
const assignment_model_1 = require("../models/assignment.model");
const deliveryPartner_model_1 = require("../models/deliveryPartner.model");
const order_model_1 = require("../models/order.model");
const getAssignments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assignmentData = yield assignment_model_1.AssignmentModel.find();
        if (!assignmentData || assignmentData.length === 0) {
            res.status(400).json({
                status: true,
                message: "No available assignments"
            });
        }
        res.status(200).json({
            status: true,
            message: "Successful",
            data: assignmentData,
        });
    }
    catch (error) {
        console.error("Error occurred: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
});
exports.getAssignments = getAssignments;
const getPartnerStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    const partners = yield deliveryPartner_model_1.DeliveryPartnerModel.find();
    return {
        available: partners.filter(p => p.status === 'active' && p.currentLoad < 3).length,
        busy: partners.filter(p => p.currentLoad === 3).length,
        offline: partners.filter(p => p.status === 'inactive').length
    };
});
const calculateAverageAssignmentTime = () => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch orders where the status is 'delivered'
    const deliveredOrders = yield order_model_1.OrderModel.find({ status: 'delivered' });
    if (deliveredOrders.length === 0)
        return 0;
    // Calculate the time differences
    const totalTime = deliveredOrders.reduce((sum, order) => {
        const timeDiff = (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / 1000; // in seconds
        return sum + timeDiff;
    }, 0);
    return totalTime / deliveredOrders.length;
});
const aggregateFailureReasons = (assignments) => {
    const failureReasons = {};
    assignments
        .filter(a => a.status === 'failed')
        .forEach(assignment => {
        if (assignment.reason) {
            failureReasons[assignment.reason] =
                (failureReasons[assignment.reason] || 0) + 1;
        }
    });
    return Object.entries(failureReasons).map(([reason, count]) => ({ reason, count }));
};
const getAssignmentMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const metrics = yield assignmentMetrics_model_1.AssignmentMetricsModel.findOne().sort({ createdAt: -1 });
        const activeAssignments = yield assignment_model_1.AssignmentModel.find({
            status: 'success',
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        const partnerStatus = yield getPartnerStatus();
        res.status(200).json({
            success: true,
            metrics: metrics || {},
            activeAssignments,
            partners: partnerStatus
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching assignment metrics', error
        });
    }
});
exports.getAssignmentMetrics = getAssignmentMetrics;
const runMetricsEvaluation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all assignments and calculate metrics
        const assignments = yield assignment_model_1.AssignmentModel.find();
        const averageAssignmentTime = yield calculateAverageAssignmentTime();
        const metrics = {
            totalAssigned: assignments.length,
            successRate: assignments.length > 0 ? assignments.filter(a => a.status === 'success').length / assignments.length : 0,
            averageTime: averageAssignmentTime,
            // @ts-ignore
            failureReasons: aggregateFailureReasons(assignments)
        };
        // Update or create the metrics document
        const updatedMetrics = yield assignmentMetrics_model_1.AssignmentMetricsModel.findOneAndUpdate({}, // Match condition: empty to always find the single metrics document
        metrics, // Updated metrics object
        {
            new: true, // Return the updated document
            upsert: true, // Create the document if it doesn't exist
            setDefaultsOnInsert: true // Apply default values on insert
        });
        if (!updatedMetrics) {
            res.status(404).json({
                success: false,
                message: 'Failed to update metrics.'
            });
        }
        else {
            res.status(200).json({
                success: true,
                message: 'Metrics successfully calculated and updated.',
                data: updatedMetrics,
            });
        }
    }
    catch (error) {
        console.error("Error occurred: ", error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
});
exports.runMetricsEvaluation = runMetricsEvaluation;
