import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const AssignmentMetricsSchema = new Schema({
    totalAssigned: {type: Number, required: true},
    successRate: {type: Number, required: true},
    averageTime: {type: Number, required: true},
    failureReasons: [{
        reason: {type: String, required: true},
        count: {type: Number, required: true},
    }]
});

export type AssignmentMetrics = InferSchemaType<typeof AssignmentMetricsSchema> & { _id: mongoose.Types.ObjectId};

export const AssignmentMetricsModel = model<AssignmentMetrics>('AssignmentMetrics', AssignmentMetricsSchema);