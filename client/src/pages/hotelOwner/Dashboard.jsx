import React, { useState } from "react";
import { dashboardDummyData } from "../../assets/assets";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(dashboardDummyData);
  return (
    <div>
      <h1 className=" text-[40px]">Dashboard</h1>
      <p className="text-gray-500/90 text-[16px] max-w-2xl ">
        Monitor your room listings, track bookings and analyze revenue—all in
        one place. Stay updated with real-time insights to ensure smooth
        operations.
      </p>
      <div className="flex gap-4 my-8">
        {/* My Bookings */}
        <div className="bg-primary/3 border border-primary/10 rounded flex p-4 pr-8">
          <i className="fa-solid fa-hotel  max-sm:hidden text-3xl text-blue-500"></i>
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-blue-500 text-lg">Total Bookings</p>
            <p className="text-neutral-400 text-base">
              {dashboardData.totalBookings}
            </p>
          </div>
        </div>
        <div className="bg-primary/3 border border-primary/10 rounded flex p-4 pr-8">
          <i class="fa-solid fa-file-invoice-dollar text-3xl text-blue-500"></i>
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-blue-500 text-lg">Total Revenue</p>
            <p className="text-neutral-400 text-base">
              $ {dashboardData.totalRevenue}
            </p>
          </div>
        </div>
      </div>
      {/**----------- Recent Bookings --------------- */}
      <h2 className="text-xl text-blue-950/70 font-medium mb-5">
        Recent Bookings
      </h2>
      <div className="w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
            <table className="w-full">
            <thead>
                <tr>
                <th className="py-3 px-4 text-gray-800 font-medium">User Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                Room Name
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Total Amount
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Payment Status
              </th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {dashboardData.bookings.map((item, index) => (
              <tr key={index}>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                  {item.user.username}
                </td>

                <td className="py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden">
                  {item.room.roomType}
                </td>

                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                  ${item.totalPrice}
                </td>

                <td className="py-3 px-4 text-gray-700 border-t border-gray-300 flex">
                  <button
                    className={`py-1 px-3 text-xs rounded-full mx-auto ${item.isPaid ? "bg-green-200 text-green-600" : "bg-amber-200 text-yellow-700"}`}
                  >
                    {item.isPaid ? "Completed" : "Pending"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
