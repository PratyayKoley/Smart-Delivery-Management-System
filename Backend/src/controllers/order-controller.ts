import { Request, Response } from "express";
import { Order, OrderModel } from "../models/order.model";
import { Assignment, AssignmentModel } from "../models/assignment.model";
import { timeStamp } from "console";
import { DeliveryPartner, DeliveryPartnerModel } from "../models/deliveryPartner.model";
import mongoose from "mongoose";

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

export const createOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({
        success: false,
        message: "Data is missing. Please provide the required details.",
      });
      return;
    };

    const newPartner = await OrderModel.create(req.body);

    if (!newPartner) {
      res.status(500).json({
        success: false,
        message: "Unable to create the delivery order. Please try again later.",
      });
      return;
    };

    res.status(201).json({
      success: true,
      message: "Delivery order created successfully!",
      data: newPartner,
    });
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating order:", error.message);
    }
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please contact support.",
    });
  }
}

const estimateDeliveryTime = (partnerLoad: number): number => {
  const baseTime = 30; // minutes
  const loadFactor = 1 + (partnerLoad * 0.2); // 20% slower for each order in load
  return baseTime * loadFactor;
};

const extractTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const hours = date.getUTCHours().toString().padStart(2, '0'); // Extract hours in UTC
  const minutes = date.getUTCMinutes().toString().padStart(2, '0'); // Extract minutes in UTC
  return `${hours}:${minutes}`; // Format as HH:mm
};

export const assignOrders = async (req: Request, res: Response): Promise<void> => {
  const findBestPartners = async (order: Order): Promise<DeliveryPartner[]> => {
    const orderTime = extractTime(order.scheduledFor);

    const availablePartners = await DeliveryPartnerModel.find({
      status: { $in: ['active', 'inactive'] },
      currentLoad: { $lt: 3 },
      areas: order.area,
      'shift.start': { $lte: orderTime },
      'shift.end': { $gte: orderTime },
    });

    console.log(availablePartners);
    return availablePartners;
  };

  const selectBestPartner = (order: Order, partners: DeliveryPartner[]): DeliveryPartner => {
    let bestPartner = partners[0];
    let bestScore = Infinity;

    for (const partner of partners) {
      const estimatedTime = estimateDeliveryTime(partner.currentLoad);
      const score = estimatedTime * (1 + partner.currentLoad * 0.2); // Consider both estimated time and load

      console.log("Score: ", score);
      if (score < bestScore) {
        bestScore = score;
        bestPartner = partner;
      }
    }
    console.log("Function Best Partner: ", bestPartner);

    return bestPartner;
  };

  try {
    const { orderId } = req.body;
    console.log("Order ID: ", orderId);

    // Fetch the order by ID
    const order = await OrderModel.findById(orderId) as Order | null;

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }
    console.log("Order Database: ", order);

    // Find the top 5 available partners
    const topPartners = await findBestPartners(order);
    console.log("Top Partners: ", topPartners)

    if (topPartners.length === 0) {
      res.status(400).json({
        success: false,
        status: 400,
        message: 'No available partners for this order',
      });
      return;
    }

    // Select the best partner
    const bestPartner = selectBestPartner(order, topPartners);
    console.log("Best Partners: ", bestPartner);

    // Create a new assignment record
    const assignment = await AssignmentModel.create<Assignment>({
      orderId: order.orderNumber,
      partnerId: bestPartner._id,
      timestamp: new Date(),
      status: 'success',
    });

    console.log("Assignment done:", assignment);

    // Update order and partner data
    order.status = 'assigned';
    // @ts-ignore
    order.assignedTo = bestPartner._id;
    bestPartner.currentLoad += 1;

    // @ts-ignore
    await Promise.all([order.save(), bestPartner.save()]);

    res.status(200).json({
      success: true,
      data: { order, partner: bestPartner, assignment },
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
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderData = await OrderModel.findByIdAndUpdate(id, { status: status, updatedAt: new Date() }, { new: true });

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

export const getPartnerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid Partner ID format',
      });
      return;
    }

    const assignmentData = await OrderModel.find({
      assignedTo: id,
      status: { $in: ['assigned', 'picked'] },
    });

    // If no orders found, return a 404 response
    if (!assignmentData || assignmentData.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No orders found for the provided Partner ID',
      });
      return;
    }

    // If orders found, return them with a success response
    res.status(200).json({
      success: true,
      data: assignmentData,
    });
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching partner orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};