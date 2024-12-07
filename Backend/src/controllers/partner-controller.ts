import { Request, Response } from "express";
import { DeliveryPartnerModel } from "../models/deliveryPartner.model";

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

    console.log('Updating partner:', id, updatedPartnerData);

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