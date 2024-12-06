import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Assignment, AssignmentMetrics } from "@/types/types"
import { useState } from "react"
import { Hourglass, LaptopMinimalCheck, ShieldAlert, Truck, Users } from "lucide-react"

export const Assignments = () => {
  const [activeAssignments, setActiveAssignments] = useState<Assignment[]>([
    {
      orderId: 'ORD-001',
      partnerId: 'PARTNER-001',
      timeStamp: new Date(),
      status: 'success',
    },
  ])

  const [metrics, setMetrics] = useState<AssignmentMetrics>(
    {
      totalAssigned: 100,
      successRate: 0.95,
      averageTime: 15,
      failureReasons: [
        { reason: 'Partner unavailable', count: 3 },
        { reason: 'Order cancelled', count: 2 },
      ],
    }
  )

  const [partnerStatus, setPartnerStatus] = useState({
    available: 5,
    busy: 3,
    offline: 2,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold md:text-3xl">Assignment Dashboard</h1>
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
            <LaptopMinimalCheck className="w-6 h-6"/>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(metrics.successRate * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Average Time</CardTitle>
            <Hourglass className="w-6 h-6"/>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.averageTime} minutes</p>
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
                  <TableCell className="text-center">{assignment.orderId}</TableCell>
                  <TableCell className="text-center">{assignment.partnerId}</TableCell>
                  <TableCell className="text-center">{assignment.timeStamp.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{assignment.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Button>Run Assignment Algorithm</Button>
    </div>
  )
}
