import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface PendingPartnerModalProps {
    onClose: () => void;
}

interface PendingPartner {
    _id: string;
    name: string;
    email: string;
    phone: string;
    areas: string[];
    shift: {
        start: string;
        end: string;
    };
}

export const PendingPartnerModal = ({ onClose }: PendingPartnerModalProps) => {
    const [pendingPartners, setPendingPartners] = useState<PendingPartner[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingPartners();
    }, []);

    const fetchPendingPartners = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_LINK}/api/user/pending-partners`);
            setPendingPartners(response.data.partners || []);
            setError(null);
        } catch (err) {
            setError("Failed to fetch pending partners. Please try again.");
            console.error("Error fetching pending partners:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (partnerId: string, action: "accept" | "reject") => {
        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_BACKEND_LINK}/api/user/partner-action`, {
                partnerId,
                action,
            });
            // Refresh the list after action
            await fetchPendingPartners();
        } catch (err) {
            setError(`Failed to ${action} partner. Please try again.`);
            console.error(`Error ${action}ing partner:`, err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Pending Partner Requests</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center">{error}</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Name</TableHead>
                                <TableHead className="text-center">Email</TableHead>
                                <TableHead className="text-center">Phone</TableHead>
                                <TableHead className="text-center">Areas</TableHead>
                                <TableHead className="text-center">Shift</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingPartners.length > 0 ? (
                                pendingPartners.map((partner) => (
                                    <TableRow key={partner._id}>
                                        <TableCell className="text-center">{partner.name}</TableCell>
                                        <TableCell className="text-center">{partner.email}</TableCell>
                                        <TableCell className="text-center">{partner.phone}</TableCell>
                                        <TableCell className="text-center">
                                            {partner.areas.map((area) => (
                                                <Badge
                                                    key={area}
                                                    variant="secondary"
                                                    className="mr-1 mt-1 text-center"
                                                >
                                                    {area}
                                                </Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {partner.shift.start} - {partner.shift.end}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAction(partner._id, "accept")}
                                                    disabled={loading}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleAction(partner._id, "reject")}
                                                    disabled={loading}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-gray-500">
                                        No pending partner requests found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
