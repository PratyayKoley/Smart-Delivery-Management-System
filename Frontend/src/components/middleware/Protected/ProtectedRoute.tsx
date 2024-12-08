import axios from "axios";
import { ReactNode, useEffect, useState, createContext } from "react"
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: ReactNode;
    userValidation?: (userRole: string) => void;
}

interface UserRoleContextType {
    userRole: string | null;
    userEmail: string | null;
}

export const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const ProtectedRoute = ({ children, userValidation }: ProtectedRouteProps) => {
    const [authenticate, setAuthenticate] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Add a loading state

    const handleToken = async () => {
        const token: string | null = localStorage.getItem("token");
        if (!token) {
            setAuthenticate(false);
            setLoading(false); 
            return;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_LINK}/api/user/verify-token`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            const data = await response.data;
            if (data.success) {
                setAuthenticate(true);
                setUserRole(data.data.role);
                setUserEmail(data.data.email)
                if (userValidation) {
                    userValidation(data.data.role);
                }
            } else {
                setAuthenticate(false);
            }
        } catch (error) {
            localStorage.removeItem("token");
            setAuthenticate(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleToken();
    }, [])

    if (loading) {
        return <div>Loading...</div>; 
    }

    if (!authenticate) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <UserRoleContext.Provider value={{ userRole, userEmail }}>
            {children}
        </UserRoleContext.Provider>
    )
}

