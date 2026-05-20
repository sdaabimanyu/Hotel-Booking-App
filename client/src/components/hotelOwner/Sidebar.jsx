import React from "react";
import dashboardIcon from "../../assets/dashboard.png";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const sidebarLinks = [
    {
      name: "Dashboard",
      path: "/owner",
      icon: <i className="fa-solid fa-dice-d6"></i>,
    },
    {
      name: "Add Room",
      path: "/owner/add-room",
      icon: <i className="fa-regular fa-square-plus"></i>,
    },
    {
      name: "List Room",
      path: "/owner/list-room",
      icon: <i className="fa-solid fa-list"></i>,
    },
  ];
  return (
    <div className="md:w-64 w-16 border-r h-full text-base border-gray-300 pt-4 flex flex-col transition-all duration-300">
      {sidebarLinks.map((item, index) => (
        <NavLink
          to={item.path}
          key={index}
          end={item.path === "/owner"}
          className={({ isActive }) =>
            `flex items-center py-3 px-4 md:px-8 gap-3 transition-all duration-200 ${
              isActive
                ? "border-r-4 md:border-r-[6px] bg-blue-600/10 border-blue-600 text-blue-600"
                : "hover:bg-gray-100/90 border-white text-gray-700"
            }`
          }
        >
          <p>{item.icon}</p>

          <p className="md:block hidden text-center">{item.name}</p>
        </NavLink>
      ))}
    </div>
  );
}
