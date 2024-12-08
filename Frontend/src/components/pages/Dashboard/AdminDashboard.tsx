import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Package, Truck, Users, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement, ArcElement } from 'chart.js'

// Register chart components
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement, ArcElement);

interface DashboardMetrics {
  activeOrders: number;
  availablePartners: number;
  topAreas: string[];
  recentAssignments: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeOrders: 0,
    availablePartners: 0,
    topAreas: [],
    recentAssignments: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_LINK}/api/dashboard/metrics`);
        if (response.data.success) {
          setMetrics(response.data.data);
        } else {
          console.error('Failed to fetch dashboard metrics');
        }
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  }

  // Line Chart Data (for activeOrders and recentAssignments)
  // Dummy Data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Active Orders',
        data: [50, 65, 75, 80, 90, 100, 120],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Recent Assignments',
        data: [30, 40, 50, 70, 85, 95, 110],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      },
    ],
  };

  // Bar Chart Data (for availablePartners)
  // Dummy Data
  const barChartData = {
    labels: ['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4'],
    datasets: [
      {
        label: 'Available Partners',
        data: [12, 19, 7, 5],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Doughnut Chart Data (for recentAssignments)
  // Dummy Data
  const doughnutChartData = {
    labels: ['Completed', 'Pending', 'In Progress'],
    datasets: [
      {
        data: [80, 15, 5],  // Example data
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCD56'],
      },
    ],
  };

  // Pie Chart Data (for topAreas distribution)
  // Dummy Data
  const pieChartData = {
    labels: metrics.topAreas.length ? metrics.topAreas : ['Area 1', 'Area 2', 'Area 3'], 
    datasets: [
      {
        data: [20, 30, 50], 
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCD56'],
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <CardTitle className="text-sm font-medium">Available Partners</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.availablePartners}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Areas</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm">{metrics.topAreas.join(', ')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Assignments</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.recentAssignments}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Orders & Assignments Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={lineChartData} options={{ responsive: true }} />
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Available Partners Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={barChartData} options={{ responsive: true }} />
            </CardContent>
          </Card>

          {/* Doughnut Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Assignments Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Doughnut data={doughnutChartData} options={{ responsive: true }} />
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top Areas Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={pieChartData} options={{ responsive: true }} />
            </CardContent>
          </Card>

        </>
      )}
    </div>
  )
}
