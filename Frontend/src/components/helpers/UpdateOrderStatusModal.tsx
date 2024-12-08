import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UpdateOrderStatusModalProps {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    status: "pending" | "assigned" | "picked" | "delivered" // Ensured this matches the allowed values
  } | null
  onUpdateStatus: (orderId: string, newStatus: "pending" | "assigned" | "picked" | "delivered") => Promise<void>
}

export function UpdateOrderStatusModal({ isOpen, onClose, order, onUpdateStatus }: UpdateOrderStatusModalProps) {
  const [newStatus, setNewStatus] = useState<"pending" | "assigned" | "picked" | "delivered">(order?.status || "assigned")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateStatus = async () => {
    if (order && newStatus) {
      setIsUpdating(true)
      await onUpdateStatus(order.id, newStatus)
      setIsUpdating(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="col-span-4">Order ID: {order?.id}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Select onValueChange={(value) => setNewStatus(value as "assigned" | "picked" | "delivered")} defaultValue={order?.status}>
              <SelectTrigger className="col-span-4">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="picked">Picked</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>Cancel</Button>
          <Button onClick={handleUpdateStatus} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
