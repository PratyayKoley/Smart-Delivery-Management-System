import { InferSchemaType, model, Schema } from "mongoose";

const AssignmentMetricsSchema: Schema = new Schema({
    totalAssigned: {type: Number, required: true},
    successRate: {type: Number, required: true},
    averageTime: {type: Number, required: true},
    failureReasons: [{
        reason: {type: String, required: true},
        count: {type: Number, required: true},
    }]
});

type AssignmentMetrics = InferSchemaType<typeof AssignmentMetricsSchema>

export const AssignmentMetricsModel = model<AssignmentMetrics>('AssignmentMetrics', AssignmentMetricsSchema);