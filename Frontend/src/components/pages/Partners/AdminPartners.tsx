import { DeliveryPartner } from "@/types/types"
import { useState } from "react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { pendingPartnerModal } from "@/components/helpers/pendingPartnerModal";

export const Partners = () => {
  const [showPendingModal, setShowPendingModal] = useState
  const [partners, setPartners] = useState<DeliveryPartner[]>([
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      status: 'active',
      currentLoad: 2,
      areas: ['Downtown', 'Suburb'],
      shift: { start: '09:00', end: '17:00' },
      metrics: { rating: 4.5, completedOrders: 100, cancelledOrders: 2 },
    }
  ]);

  const showPartners = () => {

  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">Delivery Partners</h1>
        <Button onClick={showPartners()}>Add Partner</Button>
      </div>
      <div className="flex justify-between items-center">
        <Input className="max-w-sm" placeholder="Search Partners" />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Partner ID</TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Phone</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Current Load</TableHead>
              <TableHead className="text-center">Rating</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((partner) => (
              <TableRow key={partner._id}>
                <TableCell className="text-center">{partner.name}</TableCell>
                <TableCell className="text-center">{partner.email}</TableCell>
                <TableCell className="text-center">{partner.phone}</TableCell>
                <TableCell className="text-center">{partner.status}</TableCell>
                <TableCell className="text-center">{partner.currentLoad}</TableCell>
                <TableCell className="text-center">{partner.metrics.rating}</TableCell>
                <TableCell>
                  <div className="flex justify-evenly flex-col gap-2 sm:flex-row">
                    <Button variant='outline'>Edit</Button>
                    <Button variant='destructive'>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
