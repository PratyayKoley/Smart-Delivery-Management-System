import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'
import { UpdateOrderStatusModal } from '../../helpers/UpdateOrderStatusModal'
import { useToast } from '@/hooks/use-toast'
import { UserRoleContext } from '@/components/middleware/Protected/ProtectedRoute'
import { DeliveryPartner, Order } from '@/types/types'

export const PartnersOrders = () => {
    const [currentAssignments, setCurrentAssignments] = useState<Order[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<{ id: string; status: "pending" | "assigned" | "picked" | "delivered" } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { userEmail } = useContext(UserRoleContext)!;
    const [partner, setPartner] = useState<DeliveryPartner | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<String | null>(null);

    const nextDelivery = currentAssignments?.length
    ? currentAssignments.find(
        (assignment) => assignment.status === "assigned" || assignment.status === "picked"
    )
    : null;

    const handleOpenModal = (order: { id: string; status: "pending" | "assigned" | "picked" | "delivered" }) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setIsModalOpen(false);
    };

    const updateOrderStatusInDB = async (orderId: string, newStatus: string) => {
        setIsLoading(true);
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_LINK}/api/orders/${orderId}/status`, {
                status: newStatus,
            });

            if (response.data.success) {
                toast({
                    title: "Status Updated",
                    description: `Order ${orderId} status has been updated to ${newStatus}.`,
                });
                return true;
            } else {
                throw new Error(response.data.message || "Failed to update order status");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            toast({
                title: "Error",
                description: "Failed to update order status. Please try again.",
                variant: "destructive",
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: "pending" | "assigned" | "picked" | "delivered") => {
        const success = await updateOrderStatusInDB(orderId, newStatus);
        console.log(success);
        if (success) {
            setCurrentAssignments((prevAssignments) =>
                prevAssignments.map((assignment) =>
                    assignment._id === orderId ? { ...assignment, status: newStatus } : assignment
                )
            );
            toast({
                title: "Success",
                description: `Order status updated to ${newStatus}.`,
            });
        }
    };

    const getUserData = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_LINK}/api/user/get-user-data`,
                { email: userEmail }
            );
            const data = response.data;
            if (!data.success) {
                setError("User not found");
            }
            setPartner(data.data);
        } catch (error) {
            setError((error as Error).message);
            console.error("Error fetching user data:", (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            if (!partner) return;
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_LINK}/api/orders/${partner._id}`);
            const data = response.data;

            if (!data.success) {
                setError("Invalid partner ID");
            }

            setCurrentAssignments(data.data || []);
        } catch (error) {
            setError((error as Error).message);
            console.error("Error occurred: ", (error as Error).message);
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    useEffect(() => {
        if (partner) {
            fetchAssignments();
        }
    }, [partner]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!partner) {
        return <div>No partner data available.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold md:text-3xl">Partner Orders</h1>

            {/* Current Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Order ID</TableHead>
                                <TableHead className="text-center">Address</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Scheduled At</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentAssignments.length > 0 ? (
                                currentAssignments.map((assignment) => (
                                    <TableRow key={assignment.orderNumber}>
                                        <TableCell className="text-center">{assignment.orderNumber}</TableCell>
                                        <TableCell className="text-center">{assignment.customer.address}</TableCell>
                                        <TableCell className="text-center">{assignment.status}</TableCell>
                                        <TableCell className="text-center">
                                            {new Date(assignment.scheduledFor).toLocaleString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                timeZoneName: 'short',
                                            })}
                                        </TableCell>
                                        <TableCell className="flex justify-center items-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleOpenModal({ id: assignment._id!, status: assignment.status })
                                                }
                                                disabled={isLoading}
                                            >
                                                Update Status
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500">
                                        No active assignments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Next Delivery Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Next Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                    {nextDelivery ? (
                        <div className="space-y-2">
                            <p>
                                <strong>Order ID:</strong> {nextDelivery.orderNumber}
                            </p>
                            <p>
                                <strong>Customer:</strong> {nextDelivery.customer.name}
                            </p>
                            <p>
                                <strong>Address:</strong> {nextDelivery.customer.address}
                            </p>
                            <p>
                                <strong>Estimated Delivery:</strong> {new Date(nextDelivery.scheduledFor).toLocaleString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZoneName: 'short',
                                })}
                            </p>
                            <Button className="mt-2" onClick={() => { }}>
                                <MapPin className="mr-2 h-4 w-4" /> Get Directions
                            </Button>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No upcoming deliveries.</p>
                    )}
                </CardContent>
            </Card>

            {/* Update Order Status Modal */}
            <UpdateOrderStatusModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                order={selectedOrder}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    );
}    