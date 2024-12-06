import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export const PartnersOrders = () => {
    const [currentAssignments, setCurrentAssignments] = useState([
        { id: 'O001', customerName: 'John Doe', address: '123 Main St', status: 'Assigned', time: '12:00' },
        { id: 'O002', customerName: 'Jane Smith', address: '456 Elm St', status: 'Picked', time: '13:00' },
        { id: 'O003', customerName: 'Mike Johnson', address: '789 Oak St', status: 'Delivered', time: '15:00' },
    ]);

    const nextDelivery = currentAssignments.find(
        (assignment) => assignment.status === 'Assigned' || assignment.status === 'Picked'
    );

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
                            {currentAssignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell className="text-center">{assignment.id}</TableCell>
                                    <TableCell className="text-center">{assignment.address}</TableCell>
                                    <TableCell className="text-center">{assignment.status}</TableCell>
                                    <TableCell className="text-center">{assignment.time}</TableCell>
                                    <TableCell className="flex justify-center items-center">
                                        <Button variant="outline" size="sm">
                                            Update Status
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
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
                                <strong>Order ID:</strong> {nextDelivery.id}
                            </p>
                            <p>
                                <strong>Customer:</strong> {nextDelivery.customerName}
                            </p>
                            <p>
                                <strong>Address:</strong> {nextDelivery.address}
                            </p>
                            <p>
                                <strong>Estimated Delivery:</strong> {nextDelivery.time}
                            </p>
                            <Button className="mt-2" onClick={() => { }}>
                                <MapPin className="mr-2 h-4 w-4" /> Get Directions
                            </Button>
                        </div>
                    ) : (
                        <p>No upcoming deliveries.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
