import { Request, Response } from "express"
import { OrderModel } from "../models/order.model";
import { DeliveryPartnerModel } from "../models/deliveryPartner.model";
import { AssignmentModel } from "../models/assignment.model";

export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch active orders
        const activeOrders = await OrderModel.countDocuments({ status: { $in: ['pending', 'assigned', 'picked'] } });

        // Fetch available partners
        const availablePartners = await DeliveryPartnerModel.countDocuments({ status: 'active', currentLoad: { $lt: 3 } });

        // Fetch top areas
        const topAreas = await OrderModel.aggregate([
            { $group: { _id: '$area', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
            { $project: { _id: 0, area: '$_id' } }
        ]);

        // Fetch recent assignments
        const recentAssignments = await AssignmentModel.countDocuments({
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });

        res.json({
            success: true,
            data: {
                activeOrders,
                availablePartners,
                topAreas: topAreas.map(item => item.area),
                recentAssignments
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard metrics' });
    }
}