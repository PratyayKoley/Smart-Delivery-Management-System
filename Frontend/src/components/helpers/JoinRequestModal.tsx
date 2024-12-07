import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { DeliveryPartner } from "@/types/types";

interface JoinRequestModalProps {
    partner: DeliveryPartner | null;
    onClose: () => void;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    areas: string;
    shiftStart: string;
    shiftEnd: string;
}

export const JoinRequestModal = ({ partner, onClose }: JoinRequestModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            name: partner?.name || "",
            email: partner?.email || "",
            phone: partner?.phone || "",
            areas: partner?.areas?.join(", ") || "",
            shiftStart: partner?.shift?.start || "",
            shiftEnd: partner?.shift?.end || "",
        }
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_LINK}/api/user/join-request`,
                data
            );

            if (response.data.success) {
                onClose();
            } else {
                setError(response.data.message || "Failed to submit request. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting join request:", error);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Join as Delivery Partner</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                {...register("name", { required: "Name is required" })}
                                disabled
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                disabled
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                {...register("phone", {
                                    required: "Phone number is required",
                                    pattern: {
                                        value: /^[0-9]{10,15}$/,
                                        message: "Invalid phone number"
                                    }
                                })}
                                disabled
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="areas">Areas</Label>
                            <Input
                                id="areas"
                                {...register("areas", { required: "Areas are required" })}
                                disabled
                            />
                            {errors.areas && <p className="text-red-500 text-sm mt-1">{errors.areas.message}</p>}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                            <div className="flex-1">
                                <Label htmlFor="shiftStart">Shift Start</Label>
                                <Input
                                    id="shiftStart"
                                    {...register("shiftStart", { required: "Shift start time is required" })}
                                    disabled
                                    className="mt-1"
                                />
                                {errors.shiftStart && <p className="text-red-500 text-sm mt-1">{errors.shiftStart.message}</p>}
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="shiftEnd">Shift End</Label>
                                <Input
                                    id="shiftEnd"
                                    {...register("shiftEnd", { required: "Shift end time is required" })}
                                    disabled
                                    className="mt-1"
                                />
                                {errors.shiftEnd && <p className="text-red-500 text-sm mt-1">{errors.shiftEnd.message}</p>}
                            </div>
                        </div>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Submitting..." : "Send Request"}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

