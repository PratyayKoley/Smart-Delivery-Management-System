import { DeliveryPartner } from "@/types/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { PendingPartnerModal } from "@/components/helpers/pendingPartnerModal";
import { EditPartnerModal } from "@/components/helpers/EditPartnerModal";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export const Partners = () => {
  const [partners, setPartners] = useState<Partial<DeliveryPartner>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPendingModal, setShowPendingModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingPartner, setEditingPartner] = useState<Partial<DeliveryPartner> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_LINK}/api/user/active-and-inactive-partners`
        );
        setPartners(response.data.partners);
        setError(null);
      } catch (err) {
        console.error("Error fetching partners:", err);
        setError("Failed to load partners. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const filteredPartners = partners.filter((partner) =>
    // Search in name, email, phone, and partnerId (convert to string if necessary)
    (partner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     partner._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     partner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     partner.phone?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = async (updatedPartner: Partial<DeliveryPartner>) => {
    if (!updatedPartner._id) {
      toast({
        title: "Error",
        description: "Invalid partner ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_LINK}/api/partners/${updatedPartner._id}`,
        updatedPartner
      );

      if (response.data.success) {
        setPartners((prevPartners) =>
          prevPartners.map((partner) =>
            partner._id === updatedPartner._id ? { ...partner, ...updatedPartner } : partner
          )
        );

        toast({
          title: "Success",
          description: "Partner updated successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to update partner");
      }
    } catch (error) {
      console.error("Error updating partner:", error);
      toast({
        title: "Error",
        description: "Failed to update partner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEditingPartner(null);
    }
  };

  const handleDelete = async (partnerId: string | undefined) => {
    if (!partnerId) {
      toast({
        title: "Error",
        description: "Invalid partner ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_LINK}/api/partners/${partnerId}`);

      if (response.data.success) {
        setPartners((prevPartners) => prevPartners.filter((partner) => partner._id !== partnerId));
        toast({
          title: "Success",
          description: "Partner deleted successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete partner");
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast({
        title: "Error",
        description: "Failed to delete partner. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderTableRows = () => {
    return filteredPartners.map((partner) => (
      <TableRow key={partner._id}>
        <TableCell className="text-center">{partner._id}</TableCell>
        <TableCell className="text-center">{partner.name || "N/A"}</TableCell>
        <TableCell className="text-center">{partner.email || "N/A"}</TableCell>
        <TableCell className="text-center">{partner.phone || "N/A"}</TableCell>
        <TableCell className="text-center">{partner.status || "N/A"}</TableCell>
        <TableCell className="text-center">{partner.currentLoad || 0}</TableCell>
        <TableCell className="text-center">{partner.metrics?.rating || "N/A"}</TableCell>
        <TableCell>
          <div className="flex justify-evenly flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setEditingPartner(partner)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(partner._id)}>
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">Delivery Partners</h1>
        <Button onClick={() => setShowPendingModal(true)}>Add Partner</Button>
        {showPendingModal && <PendingPartnerModal onClose={() => setShowPendingModal(false)} />}
      </div>

      <div className="flex justify-between items-center">
        <Input
          className="max-w-sm"
          placeholder="Search Partners"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredPartners.length === 0 ? (
          <p className="text-center text-gray-500">No partners found.</p>
        ) : (
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
            <TableBody>{renderTableRows()}</TableBody>
          </Table>
        )}
      </div>

      {editingPartner && (
        <EditPartnerModal
          partner={editingPartner}
          isOpen={!!editingPartner}
          onClose={() => setEditingPartner(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
};

