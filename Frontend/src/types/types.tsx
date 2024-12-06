import * as z from 'zod';

export type Shift = {
    start: string;
    end: string;
}

export type Metrics = {
    rating: number;
    completedOrders: number;
    cancelledOrders: number;
}

export type Customer = {
    name: string;
    phone: string;
    address: string;
}

export type Items = {
    name: string;
    quantity: number;
    price: number;
}

export type DeliveryPartner = {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    currentLoad: number;
    areas: string[];
    shift: Shift;
    metrics: Metrics;
}

export type Order = {
    _id?: string;
    orderNumber: string;
    customer: Customer;
    area: string;
    items: Items[];
    status: 'pending' | 'assigned' | 'picked' | 'delivered';
    scheduledFor: string;
    assignedTo?: string;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

export type Assignment = {
    orderId: string;
    partnerId: string;
    timeStamp: Date;
    status: 'success' | 'failed';
    reason?: string;
}

export type AssignmentMetrics = {
    totalAssigned: number;
    successRate: number;
    averageTime: number;
    failureReasons: {
        reason: string;
        count: number;
    }[];
}

export const loginSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address."
    }),
    password: z.string().min(6, {
        message: "Password must be atleast 6 characters long."
    }),
})

export const registerSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be atleast 2 characters long."
    }),
    email: z.string().email({
        message: "Please enter a valid email address."
    }),
    password: z.string().min(6, {
        message: "Password must be atleast 6 characters long."
    }),
    confirmPassword: z.string(),
    role: z.enum(['admin', 'partner']),
    adminCode: z.string().optional(),
    phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, {
        message: "Phone number must be 10-15 digits long."
    }),
    areas: z.array(z.string()).min(1, {
        message: "Atleast one area must be specified."
    }),
    shift: z.object({
        slot: z.string().min(1, {
            message: "Please select a valid shift."
        })
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ['confirmPassword'],
}).refine((data) => {
    if (data.role === 'admin' && (!data.adminCode || data.adminCode !== 'qwertyuiop')) {
        return false;
    }
    return true;
}, {
    message: "Invalid admin registration code",
    path: ['adminCode'],
});