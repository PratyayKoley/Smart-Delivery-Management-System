import { useState, useEffect, useContext } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Package, TrendingUp, Clock, Star, LogOut } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import { UserRoleContext } from '@/components/middleware/Protected/ProtectedRoute'
import { DeliveryPartner } from '@/types/types'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export const PartnersDashboard = () => {
  const navigate = useNavigate();
  const { userEmail } = useContext(UserRoleContext)!;
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [metrics, setMetrics] = useState({
    activeOrders: 0,
    completedToday: 0,
    currentArea: '',
    averageDeliveryTime: '',
    rating: 0,
    activeOrdersData: [],  // Ensure this is an array
    ratingData: [],        // Ensure this is an array
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_LINK}/api/user/get-user-data`, {
        email: userEmail
      });

      const data = response.data;
      setPartner(data.data);
    }

    fetchUserData();
  }, [userEmail]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_LINK}/api/partners/metrics`, { partner: partner })
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [partner]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  }

  // Dummy Data
  const activeOrdersData = [
    { date: '2024-12-01', count: 5 },
    { date: '2024-12-02', count: 6 },
    { date: '2024-12-03', count: 4 },
    { date: '2024-12-04', count: 8 },
    { date: '2024-12-05', count: 7 }
  ];
  
  // Dummy Data
  const ratingData = [
    { date: '2024-12-01', rating: 4.2 },
    { date: '2024-12-02', rating: 4.3 },
    { date: '2024-12-03', rating: 4.4 },
    { date: '2024-12-04', rating: 4.6 },
    { date: '2024-12-05', rating: 4.5 }
  ];
  
  const activeOrdersChartData = {
    labels: activeOrdersData?.map(item => item.date) || [],  // Date array for x-axis
    datasets: [
      {
        label: 'Active Orders',
        data: activeOrdersData?.map(item => item.count) || [],  // Count array for y-axis
        borderColor: '#4C6E8C',
        backgroundColor: '#4C6E8C',
        fill: false,
      },
    ],
  };
  
  const ratingChartData = {
    labels: ratingData?.map(item => item.date) || [],  // Date array for x-axis
    datasets: [
      {
        label: 'Rating',
        data: ratingData?.map(item => item.rating) || [],  // Rating array for y-axis
        borderColor: '#FFD700',
        backgroundColor: '#FFD700',
        fill: false,
      },
    ],
  };
  

  return (
    <div className="space-y-6">
      {isLoading ? (<p>Loading...</p>) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.completedToday}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Area</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.currentArea}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageDeliveryTime}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.rating}</div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active Orders Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={activeOrdersChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Rating Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={ratingChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
