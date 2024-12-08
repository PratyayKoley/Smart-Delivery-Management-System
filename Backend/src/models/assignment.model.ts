import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const AssignmentSchema = new Schema({
    orderId: {type: Number, ref: 'orders', required: true},
    partnerId: {type: Schema.Types.ObjectId, ref: 'deliverypartners', default: null},
    timestamp: {type: Date, default: new Date()},
    status: {type: String, enum: ['success', 'failed'], required: true},
    reason: {type: String},
});

export type Assignment = InferSchemaType<typeof AssignmentSchema>;

export const AssignmentModel = model<Assignment>('Assignment', AssignmentSchema);