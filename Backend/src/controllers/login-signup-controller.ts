import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DeliveryPartnerModel } from "../models/deliveryPartner.model";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

interface JWT_Data {
    user_id: string;
}

export const LoginControl = async (req: Request, res: Response): Promise<void> => {
    const request = req.body;
    try {
        const userData = await DeliveryPartnerModel.findOne({ email: request.email });

        if (!userData) {
            res.status(404).json({
                success: false,
                message: "User does not exist.",
            });
            return;
        }

        // Check if userData is not null and then proceed
        if (typeof userData.password === 'string') {
            const doesPassMatch = await bcrypt.compare(request.password, userData.password);
            if (!doesPassMatch) {
                res.status(401).json({
                    success: false,
                    message: "Invalid Credentials",
                });
                return;
            }

            var token = await jwt.sign({ user_id: userData._id }, process.env.JWT_SECRET! || "1234567890qwertyuiop");

            res.status(200).json({
                success: true,
                token: token,
                message: "Login Successful",
            });
        } else {
            res.status(500).json({
                success: false,
                message: "User data is incomplete.",
            });
        }
    } catch (error: any) {
        // Safely access error.message and ensure the type
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: errorMessage,
        });
    }
};

export const RegisterControl = async (req: Request, res: Response) => {
    try {
        const reqData = req.body;

        if (!reqData.email || !reqData.password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required.",
            })
            return;
        }

        const existingUser = await DeliveryPartnerModel.findOne({ email: reqData.email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists.",
            });
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPass = bcrypt.hashSync(reqData.password, salt);
        reqData.password = hashedPass;

        if (reqData.shift) {
            const shiftParts = reqData.shift.slot.split("-");
            if (shiftParts.length === 2) {
                reqData.shift = {
                    start: shiftParts[0],
                    end: shiftParts[1],
                };
            } else {
                res.status(400).json({
                    success: false,
                    message: "Invalid shift format. Expected format: 'HH:mm - HH:mm'",
                });
                return;
            }
        }

        const newUser = await DeliveryPartnerModel.create(reqData);

        res.status(201).json({
            success: true,
            data: newUser,
            message: "Registration Successful",
        })
    } catch (error) {
        console.error("Registration Failed : ", (error as Error).message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
};

export const verifyToken = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({
            success: false,
            message: "Token not provided or malformed."
        })
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET! || "1234567890qwertyuiop") as JWT_Data;
        const userData = await DeliveryPartnerModel.findOne({ _id: decoded.user_id });

        if (!userData) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                role: userData.role,
                email: userData.email,
            },
            message: "Successfully validated",
        })
    } catch (error) {
        console.error("Token validation error : ", (error as Error).message);
        res.status(401).json({
            success: false,
            message: "Invalid Token",
        })
    }
};

export const getUserData = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const userData = await DeliveryPartnerModel.findOne({ email: email });

        if (!userData) {
            res.status(404).json({
                success: false,
                message: "User Not Found.",
            })
            return;
        }

        res.status(201).json({
            success: true,
            data: userData,
            message: "Successful",
        })
    } catch (error) {
        console.error("Error occurred: ", (error as Error).message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

export const joinAsPartner = async (req: Request, res: Response) => {
    const data = req.body;

    if (!data) {
        res.status(400).json({
            success: false,
            message: "Required Data is not available.",
        });
        return;
    }

    try {
        const reqPartner = await DeliveryPartnerModel.findOneAndUpdate(
            { email: data.email },
            { status: "pending" },
            { new: true }
        );

        if (!reqPartner) {
            res.status(404).json({
                success: false,
                message: "User not found."
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: "Partner updated successfully.",
            data: reqPartner,
        })
    } catch (error) {
        console.error("Error updating partner status:", (error as Error).message);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
        return;
    }
}

export const getPendingPartner = async (req: Request, res: Response) => {
    try {
        const pendingPartners = await DeliveryPartnerModel.find({ status: 'pending' })

        if (!pendingPartners) {
            res.status(404).json({
                success: false,
                message: "No Partners Found",
            })
        }

        res.status(200).json({
            success: true,
            partners: pendingPartners,
            message: "Success",
        })
    } catch (error) {
        console.error("Error occurred : ", (error as Error).message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error occurred.",
        })
    }
}

export const acceptPartner = async (req: Request, res: Response) => {
    const data = req.body;

    if (!data.partnerId || !data.action) {
        res.status(400).json({
            success: false,
            message: "No Credentials found. Try Again."
        })
    }

    try {
        const partner = await DeliveryPartnerModel.findById(data.partnerId);

        if (!partner) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        let newStatus: string;
        if (data.action === 'accept') {
            newStatus = 'inactive';
        }
        else if (data.action === 'reject') {
            newStatus = 'new';
        }
        else {
            res.status(400).json({
                success: false,
                message: "Invalid action provided.",
            });
            return;
        }

        const updatedPartner = await DeliveryPartnerModel.findByIdAndUpdate(
            data.partnerId,
            { status: newStatus },
            { new: true },
        )

        res.status(200).json({
            success: true,
            message: `Partner status updated to ${newStatus}.`,
            data: updatedPartner
        })
    } catch (error) {
        console.error("Error processing accept/reject action:", (error as Error).message);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
        return;
    }
}

export const getActiveInactivePartners = async (req: Request, res: Response) => {
    try {
        const partners = await DeliveryPartnerModel.find({
            status: { $in: ['active', 'inactive']}
        });

        if(!partners){
            res.status(404).json({
                success: false,
                message: "No Partners Found",
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: "Successful",
            partners: partners,
        })
    } catch (error) {
        console.error("Error occurred: ", (error as Error).message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}