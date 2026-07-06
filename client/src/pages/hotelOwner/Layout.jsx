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
    <div className="flex flex-col h-screen">
      <NavBar />

      <div className="flex h-full">
        <Sidebar />

        <div className="flex-1 p-4 pt-10 md:px-10 h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
