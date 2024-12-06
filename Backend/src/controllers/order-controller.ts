import { Request, Response } from "express";
import { OrderModel } from "../models/order.model";
import { AssignmentModel } from "../models/assignment.model";
import { timeStamp } from "console";
import { DeliveryPartnerModel } from "../models/deliveryPartner.model";

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orderData = await OrderModel.find();
        res.status(200).json({
            success: true,
            data: orderData,
            message: "Orders fetched successfully.",
        });
        return;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error getting orders: ", error.message);
        }
        res.status(500).json({
            success: false,
            message: "Failed to fetch the order details.",
        })
    }
}

// export const createOrders = async (req: Request, res: Response): Promise<void> => {
//     try {
//         if (!req.body || Object.keys(req.body).length === 0) {
//             res.status(400).json({
//                 success: false,
//                 message: "Data is missing. Please provide the required details.",
//             });
//             return;
//         };

//         const newPartner = await OrderModel.create(req.body);

//         if (!newPartner) {
//             res.status(500).json({
//                 success: false,
//                 message: "Unable to create the delivery order. Please try again later.",
//             });
//             return;
//         };

//         res.status(201).json({
//             success: true,
//             message: "Delivery order created successfully!",
//             data: newPartner,
//         });
//     }
//     catch (error: unknown) {
//         if (error instanceof Error) {
//             console.error("Error creating order:", error.message);
//         }
//         res.status(500).json({
//             success: false,
//             message: "An unexpected error occurred. Please contact support.",
//         });
//     }
// }

export const assignOrders = async (req: Request, res: Response): Promise<void> => {

    const findBestPartner = async (order: typeof OrderModel): Promise<typeof DeliveryPartnerModel | null> => {
        const availablePartners = await DeliveryPartnerModel.find({
            status: 'active',
            currentLoad: { $lt: 3 },
            areas: order.area,
            'shift.start': { $lte: order.scheduledFor },
            'shift.end': { $gte: order.scheduledFor },
        });

        return availablePartners.length > 0 ? availablePartners[0] : null;
    };

    try {
        const { orderId } = req.body;
        
        // Fetch the order by ID
        const order = await OrderModel.findById(orderId) as typeof OrderModel | null;

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found',
            });
            return;
        }

        // Find the best available partner
        const availablePartner = await findBestPartner(order);

        if (!availablePartner) {
            res.status(400).json({
                success: false,
                message: 'No available partners for this order',
            });
            return;
        }

        // Create a new assignment record
        const assignment = await AssignmentModel.create<typeof AssignmentModel>({
            orderId: order._id,
            partnerId: availablePartner._id,
            timestamp: new Date(),
            status: 'success',
        });

        // Update order and partner data
        order.status = 'assigned';
        order.assignedTo = availablePartner._id;
        availablePartner.currentLoad += 1;

        await Promise.all([order.save(), availablePartner.save()]);

        res.status(200).json({
            success: true,
            data: { order, partner: availablePartner, assignment },
            message: 'Order successfully assigned',
        });
    } catch (error: any) {
        console.error('Error assigning order:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning order',
            error: error.message || 'Unknown error',
        });
    }
}

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const orderData = await OrderModel.findByIdAndUpdate({ _id: id }, { status: status, updatedAt: new Date() }, { new: true });

        if (!orderData) {
            res.status(404).json({
                success: false,
                message: "Error finding the order. Please check the order number.",
            })
        }

        res.status(200).json({
            success: true,
            message: "Successfully updated the order status",
            data: orderData,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error updating order status: ", error.message);
        }
        res.status(500).json({
            success: false,
            message: "Failed to update the order status. Please try again later.",
        })
    }
}