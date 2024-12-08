import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Assignment, AssignmentMetrics, Order } from "@/types/types"
import { useEffect, useState } from "react"
import { Hourglass, LaptopMinimalCheck, ShieldAlert, Truck, Users } from 'lucide-react'
import axios from "axios"

export const Assignments = () => {
  const [activeAssignments, setActiveAssignments] = useState<Assignment[]>([])
  const [metrics, setMetrics] = useState<AssignmentMetrics>({
    totalAssigned: 0,
    successRate: 0,
    averageTime: 0,
    failureReasons: []
  })

  const [partnerStatus, setPartnerStatus] = useState({
    available: 0,
    busy: 0,
    offline: 0,
  });

  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Fetch assignment metrics
  const fetchAssignmentMetrics = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_LINK}/api/assignments/metrics`);
      
      if (response.data.success) {
        setMetrics({
          totalAssigned: response.data.metrics.totalAssigned || 0,
          successRate: response.data.metrics.successRate || 0,
          averageTime: response.data.metrics.averageTime || 0,
          failureReasons: response.data.metrics.failureReasons || []
        });

        setPartnerStatus(response.data.partners || {
          available: 0,
          busy: 0,
          offline: 0
        });

        setActiveAssignments(response.data.activeAssignments || []);
      } else {
        console.error("Failed to fetch assignment metrics");
      }
    } catch (error) {
      console.error("Error fetching assignment metrics:", error);
      alert("Failed to fetch assignment metrics");
    }
  };

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_LINK}/api/orders`);
      const allOrders: Order[] = response.data.data;
      const pending = allOrders.filter((order) => order.status === "pending");
      setPendingOrders(pending);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      alert("Failed to fetch pending orders.");
    }
  };

  // Run assignment algorithm
  const runAssignment = async () => {
    if (!selectedOrderId) {
      alert("Please select an order first.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_LINK}/api/orders/assign`,
        { orderId: selectedOrderId }
      );

      if (response.status === 200 && response.data.success) {
        const newAssignment: Assignment = response.data.data.assignment;
        setActiveAssignments((prev) => [...prev, newAssignment]);
        alert("Order successfully assigned!");
        setSelectedOrderId(null);
        
        // Refresh data after assignment
        fetchPendingOrders();
        fetchAssignmentMetrics();
      } else {
        alert(response.data.message || "Failed to assign order.");
      }
    } catch (error: any) {
      console.error("Error running assignment:", error.message);
      alert("An error occurred while assigning the order. No available Partners");
    }
  };

  // Trigger metrics evaluation
  const runMetricsEvaluation = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_LINK}/api/assignments/run`);
      
      if (response.data.success) {
        alert("Metrics evaluated successfully!");
        fetchAssignmentMetrics();
      } else {
        alert(response.data.message || "Failed to evaluate metrics");
      }
    } catch (error) {
      console.error("Error evaluating metrics:", error);
      alert("An error occurred while evaluating metrics");
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPendingOrders();
    fetchAssignmentMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold md:text-3xl">Assignment Dashboard</h1>
        <Button variant="secondary" onClick={runMetricsEvaluation}>
          Evaluate Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Assigned</CardTitle>
            <Truck className="w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.totalAssigned}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Success Rate</CardTitle>
            <LaptopMinimalCheck className="w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(metrics.successRate * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Average Time</CardTitle>
            <Hourglass className="w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.averageTime.toFixed(1)} minutes</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Partner Status</CardTitle>
            <Users className="w-6 h-6" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Available: {partnerStatus.available}</p>
              <p>Busy: {partnerStatus.busy}</p>
              <p>Offline: {partnerStatus.offline}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Failure Reasons</CardTitle>
            <ShieldAlert className="w-6 h-6" />
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside">
              {metrics.failureReasons.map((reason, index) => (
                <li key={index}>{reason.reason}: {reason.count}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">Active Assignments</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Order ID</TableHead>
                <TableHead className="text-center">Partner ID</TableHead>
                <TableHead className="text-center">Timestamp</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeAssignments.map((assignment, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{String(assignment.orderId)}</TableCell>
                  <TableCell className="text-center">{assignment.partnerId}</TableCell>
                  <TableCell className="text-center">{new Date(assignment.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="text-center">{assignment.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="space-y-4">
        <Select onValueChange={(value) => setSelectedOrderId(value)}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a pending order" />
          </SelectTrigger>
          <SelectContent>
            {pendingOrders.map((order) => (
              <SelectItem key={order._id} value={order._id!}>
                Order Number : {order.orderNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={runAssignment} disabled={!selectedOrderId}>
          Run Assignment Algorithm
        </Button>
      </div>
    </div>
  )
}