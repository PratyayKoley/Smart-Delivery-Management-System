import { Request, Response } from "express";
import { AssignmentMetrics, AssignmentMetricsModel } from "../models/assignmentMetrics.model";
import { Assignment, AssignmentModel } from "../models/assignment.model";
import { DeliveryPartnerModel } from "../models/deliveryPartner.model";
import { OrderModel } from "../models/order.model";

export const getAssignments = async (req: Request, res: Response) => {
    try {
        const assignmentData = await AssignmentModel.find();

        if (!assignmentData || assignmentData.length === 0) {
            res.status(400).json({
                status: true,
                message: "No available assignments"
            })
        }

        res.status(200).json({
            status: true,
            message: "Successful",
            data: assignmentData,
        })
    } catch (error) {
        console.error("Error occurred: ", (error as Error).message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
        })
    }
}

const getPartnerStatus = async () => {
    const partners = await DeliveryPartnerModel.find();
    return {
        available: partners.filter(p => p.status === 'active' && p.currentLoad < 3).length,
        busy: partners.filter(p => p.currentLoad === 3).length,
        offline: partners.filter(p => p.status === 'inactive').length
    };
}

const calculateAverageAssignmentTime = async (): Promise<number> => {
    // Fetch orders where the status is 'delivered'
    const deliveredOrders = await OrderModel.find({ status: 'delivered' });

    if (deliveredOrders.length === 0) return 0;

    // Calculate the time differences
    const totalTime = deliveredOrders.reduce((sum, order) => {
        const timeDiff = (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / 1000; // in seconds
        return sum + timeDiff;
    }, 0);

    return totalTime / deliveredOrders.length;
};

const aggregateFailureReasons = (assignments: Assignment[]): { reason: string; count: number }[] => {
    const failureReasons: { [key: string]: number } = {};

    assignments
        .filter(a => a.status === 'failed')
        .forEach(assignment => {
            if (assignment.reason) {
                failureReasons[assignment.reason] =
                    (failureReasons[assignment.reason] || 0) + 1;
            }
        });

    return Object.entries(failureReasons).map(([reason, count]) => ({ reason, count }));
}

export const getAssignmentMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        const metrics = await AssignmentMetricsModel.findOne().sort({ createdAt: -1 });

        const activeAssignments = await AssignmentModel.find({
            status: 'success',
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        const partnerStatus = await getPartnerStatus();

        res.status(200).json({
            success: true,
            metrics: metrics || {},
            activeAssignments,
            partners: partnerStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching assignment metrics', error
        });
    }
}

export const runMetricsEvaluation = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch all assignments and calculate metrics
        const assignments = await AssignmentModel.find();
        const averageAssignmentTime = await calculateAverageAssignmentTime();

        const metrics: AssignmentMetrics = {
            totalAssigned: assignments.length,
            successRate: assignments.length > 0 ? assignments.filter(a => a.status === 'success').length / assignments.length : 0,
            averageTime: averageAssignmentTime,
            // @ts-ignore
            failureReasons: aggregateFailureReasons(assignments)
        };

        // Update or create the metrics document
        const updatedMetrics = await AssignmentMetricsModel.findOneAndUpdate(
            {}, // Match condition: empty to always find the single metrics document
            metrics, // Updated metrics object
            {
                new: true, // Return the updated document
                upsert: true, // Create the document if it doesn't exist
                setDefaultsOnInsert: true // Apply default values on insert
            }
        );

        if (!updatedMetrics) {
            res.status(404).json({
                success: false,
                message: 'Failed to update metrics.'
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Metrics successfully calculated and updated.',
                data: updatedMetrics,
            });
        }
    } catch (error) {
        console.error("Error occurred: ", (error as Error).message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};
