import { useState, useCallback } from "react";
import Header from "../components/Layout/Header";
import Dashboard from "../components/Layout/Dashboard";
import useLenis from "../hooks/useLenis";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useLenis();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Dashboard sidebarOpen={sidebarOpen} onCloseSidebar={closeSidebar} />
    </div>
  );
}
