"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentModel = void 0;
const mongoose_1 = require("mongoose");
const AssignmentSchema = new mongoose_1.Schema({
    orderId: { type: Number, ref: 'orders', required: true },
    partnerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'deliverypartners', default: null },
    timestamp: { type: Date, default: new Date() },
    status: { type: String, enum: ['success', 'failed'], required: true },
    reason: { type: String },
});
exports.AssignmentModel = (0, mongoose_1.model)('Assignment', AssignmentSchema);
