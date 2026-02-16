import React, { useState, useCallback } from "react";
import Header from "../components/Layout/Header";
import Dashboard from "../components/Layout/Dashboard";

const DashboardPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header onToggleSidebar={toggleSidebar} />
      <Dashboard sidebarOpen={sidebarOpen} onCloseSidebar={closeSidebar} />
    </div>
  );
};

export default DashboardPage;
