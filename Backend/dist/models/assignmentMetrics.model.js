"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentMetricsModel = void 0;
const mongoose_1 = require("mongoose");
const AssignmentMetricsSchema = new mongoose_1.Schema({
    totalAssigned: { type: Number, required: true },
    successRate: { type: Number, required: true },
    averageTime: { type: Number, required: true },
    failureReasons: [{
            reason: { type: String, required: true },
            count: { type: Number, required: true },
        }]
});
exports.AssignmentMetricsModel = (0, mongoose_1.model)('AssignmentMetrics', AssignmentMetricsSchema);
