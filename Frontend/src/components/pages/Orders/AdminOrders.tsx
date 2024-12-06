import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types/types";
import axios from "axios";
import { useEffect, useState } from "react";

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  interface OrdersResponse {
    success: boolean;
    data: Order[];
    message?: string;
  }

  const pullOrderData = async () => {
    try {
      const response = await axios.get<OrdersResponse>(`${import.meta.env.VITE_BACKEND_LINK}/api/orders`);
      console.log("Fetched orders:", response.data);
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        console.error("Error fetching orders:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false); // Set loading to false when data fetching is complete
    }
  };

  useEffect(() => {
    pullOrderData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Segregate orders based on their status
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const assignedOrders = orders.filter((order) => order.status === "assigned");
  const pickedOrders = orders.filter((order) => order.status === "picked");
  const deliveredOrders = orders.filter((order) => order.status === "delivered");

  const renderOrderTable = (title: string, orders: Order[]) => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Order Number</TableHead>
              <TableHead className="text-center">Customer Name</TableHead>
              <TableHead className="text-center">Customer Phone</TableHead>
              <TableHead className="text-center">Area</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Total Amount</TableHead>
              <TableHead className="text-center">Scheduled For</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="text-center">{order.orderNumber}</TableCell>
                  <TableCell className="text-center">{order.customer.name}</TableCell>
                  <TableCell className="text-center">{order.customer.phone}</TableCell>
                  <TableCell className="text-center">{order.area}</TableCell>
                  <TableCell className="text-center">{order.status}</TableCell>
                  <TableCell className="text-center">₹ {order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">{order.scheduledFor}</TableCell>
                  <TableCell className="flex items-center justify-center">
                    <Button variant="outline">View Details</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">No orders found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold md:text-3xl">Orders</h1>
      <div className="flex items-center justify-between">
        <Input className="max-w-sm" placeholder="Search orders...." />
      </div>

      {renderOrderTable("Pending Orders", pendingOrders)}
      {renderOrderTable("Assigned Orders", assignedOrders)}
      {renderOrderTable("Picked Orders", pickedOrders)}
      {renderOrderTable("Delivered Orders", deliveredOrders)}
    </div>
  );
};
