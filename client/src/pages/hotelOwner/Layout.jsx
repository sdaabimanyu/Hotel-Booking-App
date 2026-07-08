import React, { useEffect } from "react";
import NavBar from "../../components/hotelOwner/Navbar";
import Sidebar from "../../components/hotelOwner/Sidebar";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export default function Layout() {
  const { isOwner, userLoading, navigate } = useAppContext();

  useEffect(() => {
    if (!userLoading && !isOwner) {
      navigate("/");
    }
  }, [isOwner, userLoading, navigate]);

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <NavBar />

      <div className="flex flex-1 min-h-0 relative">
        <Sidebar />

        <div className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
