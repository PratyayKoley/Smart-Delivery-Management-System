import { InferSchemaType, model, Schema } from "mongoose";

const AssignmentSchema: Schema = new Schema({
    orderId: {type: Schema.Types.ObjectId, ref: 'orders', required: true},
    partnerId: {type: Schema.Types.ObjectId, ref: 'deliverypartners', required: true},
    timestamp: {type: Date, default: new Date()},
    status: {type: String, enum: ['success', 'failed'], required: true},
    reason: {type: String},
});

type Assignment = InferSchemaType<typeof AssignmentSchema>

export const AssignmentModel = model<Assignment>('Assignment', AssignmentSchema);