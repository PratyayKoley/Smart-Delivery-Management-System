import { useContext, useState, useEffect } from "react";
import { DeliveryPartner } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Star, TrendingUp, AlertTriangle, Edit } from "lucide-react";
import { UserRoleContext } from "@/components/middleware/Protected/ProtectedRoute";
import axios from "axios";
import { JoinRequestModal } from "@/components/helpers/JoinRequestModal";
import { EditPartnerModal } from "@/components/helpers/EditPartnerModal";
import { useToast } from "@/hooks/use-toast";

export const PartnerProfile = () => {
  const { userEmail } = useContext(UserRoleContext)!;
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [editingPartner, setEditingPartner] = useState<Partial<DeliveryPartner> | null>(null);
  const { toast } = useToast();


  const getUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_LINK}/api/user/get-user-data`,
        { email: userEmail }
      );

      const data = response.data;
      if (!data.success) {
        setError("User not found.");
      }
      setPartner(data.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      getUserData();
    }
  }, [userEmail]);

  const handleEditProfile = async (updatedPartner: Partial<DeliveryPartner>) => {
    if (!updatedPartner._id) {
      toast({
        title: "Error",
        description: "Invalid partner ID",
        variant: "destructive",
      });
      return;
    }

    // Set the partner data to be edited in the modal right away
    setEditingPartner({ ...partner });

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_LINK}/api/partners/${updatedPartner._id}`,
        updatedPartner
      );

      if (response.data.success) {
        // Ensure partner is not null and update it
        setPartner((prevPartner) => {
          if (prevPartner) {
            return {
              ...prevPartner,
              ...updatedPartner,
            };
          }
          return null;
        });

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
    }
  };

  const handleModalClose = () => {
    setEditingPartner(null); // Close the modal only when it's explicitly triggered
  };


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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Partner Profile</h1>
        {partner.status === 'new' && (<Button variant='outline' onClick={() => setShowJoinModal(true)}>Request to Join</Button>)}
        {showJoinModal && (
          <JoinRequestModal
            partner={partner!}
            onClose={() => setShowJoinModal(false)}
          />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditProfile(partner)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {partner.name}</p>
              <p><strong>Email:</strong> {partner.email}</p>
              <p><strong>Phone:</strong> {partner.phone}</p>
              <div><strong>Status:</strong> <Badge>{partner.status}</Badge></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Start Time:</strong> {partner.shift.start}</p>
              <p><strong>End Time:</strong> {partner.shift.end}</p>
              <p><strong>Areas:</strong> {partner.areas.join(", ")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{partner.metrics.rating}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed Orders</p>
                <p className="text-2xl font-bold">{partner.metrics.completedOrders}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Cancelled Orders</p>
                <p className="text-2xl font-bold">{partner.metrics.cancelledOrders}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Load</p>
                <p className="text-2xl font-bold">{partner.currentLoad}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {editingPartner && (
        <EditPartnerModal
          partner={editingPartner}
          isOpen={!!editingPartner}  // Show modal when editingPartner is set
          onClose={handleModalClose}  // Close modal when triggered
          onSave={handleEditProfile}
        />
      )}
    </div>
  );
};