import { ClipboardList, Home, Package, Users, X, User } from "lucide-react"
import { ModeToggle } from "./ModeToggle"
import { Link, useLocation } from "react-router-dom"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import { UserRoleContext } from "../middleware/Protected/ProtectedRoute"
import { useContext } from "react"

interface SidebarProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

interface SideBarLinkType {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
}

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
    const location = useLocation();
    const { userRole } = useContext(UserRoleContext)!;

    const links: SideBarLinkType[] = [
        { label: "Dashboard", icon: Home, href: "/" },
        ...(userRole === 'admin' ? [{ label: "Partners", icon: Users, href: "/partners" }] : [{ label: "Profile", icon: User, href: "/partners" }]),
        { label: "Orders", icon: Package, href: "/orders" },
        ...(userRole === "admin"
            ? [{ label: "Assignments", icon: ClipboardList, href: "/assignments" }]
            : []),
    ];

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r p-4 transition-transform duration-200 ease-in-out lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Smart Delivery</span>
                <div className="flex items-center space-x-2">
                    <ModeToggle />
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>
            </div>
            <nav className="space-y-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        to={link.href}
                        className={`flex items-center space-x-2 p-2 rounded-lg ${location.pathname === link.href ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                            }`}
                        onClick={() => setOpen(false)}
                    >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    )
}
