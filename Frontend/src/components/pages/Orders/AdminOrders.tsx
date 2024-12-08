import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Order } from "@/types/types"
import axios from "axios"
import { useEffect, useState } from "react"
import { OrderDetailsModal } from "../../helpers/OrderDetailsModal";

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  interface OrdersResponse {
    success: boolean
    data: Order[]
    message?: string
  }

  const pullOrderData = async () => {
    try {
      const response = await axios.get<OrdersResponse>(`${import.meta.env.VITE_BACKEND_LINK}/api/orders`)
      if (response.data.success) {
        setOrders(response.data.data)
      } else {
        console.error("Error fetching orders:", response.data.message)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    pullOrderData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  const filteredOrders = orders.filter((order) =>
    order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.area.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Segregate orders based on their status
  const pendingOrders = filteredOrders.filter((order) => order.status === "pending")
  const assignedOrders = filteredOrders.filter((order) => order.status === "assigned")
  const pickedOrders = filteredOrders.filter((order) => order.status === "picked")
  const deliveredOrders = filteredOrders.filter((order) => order.status === "delivered")

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
                  <TableCell className="text-center">{new Date(order.scheduledFor).toLocaleString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                timeZoneName: 'short',
                                            })}</TableCell>
                  <TableCell className="flex items-center justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedOrder(order)
                        setIsModalOpen(true)
                      }}
                    >
                      View Details
                    </Button>
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
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold md:text-3xl">Orders</h1>
      <div className="flex items-center justify-between">
        <Input 
          className="max-w-sm" 
          placeholder="Search orders..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {renderOrderTable("Pending Orders", pendingOrders)}
      {renderOrderTable("Assigned Orders", assignedOrders)}
      {renderOrderTable("Picked Orders", pickedOrders)}
      {renderOrderTable("Delivered Orders", deliveredOrders)}

      <OrderDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder} 
      />
    </div>
  )
}

