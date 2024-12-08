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
    status: 'new' | 'pending' | 'active' | 'inactive';
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
    orderId: Number;
    partnerId: string;
    timestamp: Date;
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

// Base schema for common fields
export const baseRegisterSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters long.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters long.",
    }),
    confirmPassword: z.string(),
    role: z.enum(["admin", "partner"]),
    phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, {
      message: "Phone number must be 10-15 digits long.",
    }),
  })
  
  // Admin-specific schema
  export const adminRegisterSchema = baseRegisterSchema
    .extend({
      adminCode: z.string().nonempty({
        message: "Admin code is required.",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      })
    .refine(
      (data) => data.role === "admin",
      {
        message: "Role must be 'admin' for this schema.",
        path: ["role"],
      }
    )
    .refine(
      (data) => data.adminCode === "qwertyuiop",
      {
        message: "Invalid admin registration code.",
        path: ["adminCode"],
      }
    );
  
  // Partner-specific schema
  export const partnerRegisterSchema = baseRegisterSchema
    .extend({
      areas: z
        .array(z.string())
        .min(1, {
          message: "At least one area must be specified.",
        }),
      shift: z.object({
        slot: z.string().min(1, {
          message: "Please select a valid shift.",
        }),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      })
    .refine(
      (data) => data.role === "partner",
      {
        message: "Role must be 'partner' for this schema.",
        path: ["role"],
      }
    );