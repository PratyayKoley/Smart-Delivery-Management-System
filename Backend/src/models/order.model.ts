import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const OrderSchema = new Schema({
    orderNumber: { type: Number, required: true, unique: true },
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        address: { type: String, required: true },
    },
    area: { type: String, required: true },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    }],
    status: { type: String, enum: ['pending', 'assigned', 'picked', 'delivered'], required: true },
    scheduledFor: { type: String, required: true },
    assignedTo: { type: mongoose.Types.ObjectId },
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
});

export type Order = InferSchemaType<typeof OrderSchema> & { _id: mongoose.Types.ObjectId};

export const OrderModel = model<Order>('Order', OrderSchema);