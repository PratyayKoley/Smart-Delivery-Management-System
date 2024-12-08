import { Request, Response } from "express";
import { DeliveryPartnerModel } from "../models/deliveryPartner.model";
import { OrderModel } from "../models/order.model";

export const createPartners = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({
                success: false,
                message: "Data is missing. Please provide the required details.",
            });
            return;
        };

        const newPartner = await DeliveryPartnerModel.create(req.body);

        if (!newPartner) {
            res.status(500).json({
                success: false,
                message: "Unable to create the delivery partner. Please try again later.",
            });
            return;
        };

        res.status(201).json({
            success: true,
            message: "Delivery partner created successfully!",
            data: newPartner,
        });
    }
    catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error creating partner:", error.message);
        }
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please contact support.",
        });
    }
}

export const getAllPartners = async (req: Request, res: Response): Promise<void> => {
    try {
        const partnerData = await DeliveryPartnerModel.find();
        res.status(200).json({
            success: true,
            data: partnerData,
            message: "Delivery Partners fetched successfully.",
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error getting partner:", error.message);
        }
        res.status(500).json({
            success: false,
            message: "Failed to fetch Delivery Partners",
        })
    }
}


export const updatePartners = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updatedPartnerData = req.body;


    if (!id) {
        res.status(400).json({
            success: false,
            message: "Invalid ID provided. Please provide correct details.",
        });
        return;
    }

    try {
        const updatedPartner = await DeliveryPartnerModel.findByIdAndUpdate(
            id,
            { $set: updatedPartnerData },
            { new: true, runValidators: true }
        );

        if (!updatedPartner) {
            res.status(404).json({
                success: false,
                message: "Delivery Partner not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Delivery Partner successfully updated.",
            data: updatedPartner,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error updating partner:", error.message);
        }
        res.status(500).json({
            success: false,
            message: "Failed to update partner.",
        });
    }
};

export const deletePartners = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            success: false,
            message: "Invalid ID provided. Please provide correct details.",
        });
        return;
    }

    try {
        const deletedPartner = await DeliveryPartnerModel.findByIdAndDelete({ _id: id });

        if (!deletedPartner) {
            res.status(404).json({
                success: false,
                message: "Delivery Partner not found."
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Delivery Partner successfully deleted.",
            data: deletedPartner,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error deleting partner:", error.message);
        }
        res.status(500).json({
            success: false,
            message: "Failed to delete partner.",
        })
    }
}

export const calculateMetrics = async (req: Request, res: Response) => {
    try {
        const { partner } = await req.body;
        const currentDate = new Date();
        const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));

        console.log(partner)

        // Calculate active orders
        const activeOrders = await OrderModel.countDocuments({
            assignedTo: partner._id,
            status: { $in: ['assigned', 'picked'] }
        });

        // Calculate completed orders today
        const completedToday = await OrderModel.countDocuments({
            assignedTo: partner._id,
            status: 'delivered',
            updatedAt: { $gte: startOfDay }
        });

        // Calculate average delivery time
        const averageDeliveryTime = await OrderModel.aggregate([
            {
                $match: {
                    assignedTo: partner._id,
                    status: 'delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } }
                }
            }
        ]);

        const avgTimeInMinutes = averageDeliveryTime.length > 0
            ? Math.round(averageDeliveryTime[0].avgTime / (1000 * 60))
            : 0;

        // Fetch total completed and canceled orders for the partner
        const totalCompletedOrders = await OrderModel.countDocuments({
            assignedTo: partner._id,
            status: 'delivered'
        });

        const totalCanceledOrders = await OrderModel.countDocuments({
            assignedTo: partner._id,
            status: 'canceled'
        });

        // Calculate rating (example logic: total completed orders minus total canceled orders)
        const updatedRating = Math.max(0, Math.min(5, partner.metrics.rating + (totalCompletedOrders - totalCanceledOrders) * 0.01));

        // Update the partner's metrics in the database
        await DeliveryPartnerModel.findByIdAndUpdate(partner._id, {
            $set: {
                'metrics.completedOrders': totalCompletedOrders,
                'metrics.cancelledOrders': totalCanceledOrders,
                'metrics.rating': updatedRating
            }
        });

        // Prepare dashboard data
        const dashboardData = {
            activeOrders,
            completedToday,
            currentArea: partner.areas[0] || 'Not set',
            averageDeliveryTime: `${avgTimeInMinutes} mins`,
            rating: updatedRating.toFixed(1),
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Error in calculateMetrics:', error);
        res.status(500).json({ error: 'Error fetching dashboard data' });
    }
};

