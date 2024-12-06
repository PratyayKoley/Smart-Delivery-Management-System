import { InferSchemaType, model, Schema } from "mongoose";

const DeliveryPartnerSchema: Schema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ['admin', 'partner'], required: true},
    phone: {type: String, required: true, unique: true},
    status: {type: String, enum: ['new', 'pending', 'active', 'inactive'], default: 'new'},
    currentLoad: {type: Number, min: 0, max: 3, default: 0},
    areas: {type: [String]},
    shift: {
        start: {type: String},
        end: {type: String},
    },
    metrics: {
        rating: {type: Number, default: 0, min: 0, max: 5},
        completedOrders: {type: Number, default: 0},
        cancelledOrders: {type: Number, default: 0},
    },
});

type DeliveryPartner = InferSchemaType<typeof DeliveryPartnerSchema>;

export const DeliveryPartnerModel = model<DeliveryPartner>('DeliveryPartner', DeliveryPartnerSchema);