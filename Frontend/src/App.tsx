import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeModes/theme-provider";
import { Dashboard } from "./components/pages/Dashboard/AdminDashboard";
import { Partners } from "./components/pages/Partners/AdminPartners";
import { Orders } from "./components/pages/Orders/AdminOrders";
import { Assignments } from "./components/pages/Assignments/AdminAssignments";
import { Layout } from "./components/helpers/Layout";
import { AuthForm } from "./components/pages/Login_Signup/AuthForm";
import { ProtectedRoute } from "./components/middleware/Protected/ProtectedRoute";
import { Navigate } from "react-router-dom";
import { PartnersDashboard } from "./components/pages/Dashboard/PartnersDashboard";
import { PartnerProfile } from "./components/pages/Partners/PartnerProfile";
import { PartnersOrders } from "./components/pages/Orders/PartnersOrders";
import { useState } from "react";

export default function App() {
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleUserValidation = (validateUserRole: string) => {
    setUserRole(validateUserRole);
  }

  const router = createBrowserRouter([
    {
      path: "/auth",
      element: <AuthForm />,
    },
    {
      path: "/",
      element: (
          <ProtectedRoute userValidation={handleUserValidation}>
          <Layout>
            <Outlet />
          </Layout>
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: userRole === "admin" ? <Dashboard /> : <PartnersDashboard />,
        },
        {
          path: "/partners",
          element: userRole === "admin" ? <Partners /> : <PartnerProfile />
        },
        {
          path: "/orders",
          element: userRole === "admin" ? <Orders /> : <PartnersOrders />
        },
        ...(userRole === "admin" ?
          [
            {
              path: "/assignments",
              element: <Assignments />,
            },
          ] : []
        )
      ],
    },
    {
      path: "*",
      element: <Navigate to="/auth" replace />,
    },
  ]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}