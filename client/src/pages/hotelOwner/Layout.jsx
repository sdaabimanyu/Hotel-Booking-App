import React, { useEffect } from "react";
import NavBar from "../../components/hotelOwner/NavBar";
import Sidebar from "../../components/hotelOwner/Sidebar";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export default function Layout() {
  const { isOwner, navigate } = useAppContext();
 
  useEffect(() => {
    if (!isOwner) {
      navigate("/");
    }
  }, [isOwner]);
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
