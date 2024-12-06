import { ReactNode, useState } from "react"
import { Sidebar } from "./Sidebar"
import { Button } from "../ui/button";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 w-full">
        <header className="flex items-center px-4 h-16 border-b bg-background lg:hidden">
          <Button variant='ghost' size='icon' onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Smart Delivery</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-8 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}


