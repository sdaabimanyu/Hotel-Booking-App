import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import BookingChart from "../../components/BookingChart";

export default function Dashboard() {
  const { currency, user, getToken, axios } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
    totalRooms: 0,
    availableRooms: 0,
    archivedRooms: 0,
    totalReviews: 0,
    averageRating: 0,
    occupancyRate: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
  });

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/bookings/hotel", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  

  return (
    <div className="pb-10">
      <h1 className=" text-[40px]">Dashboard</h1>
      <p className="text-gray-500/90 text-[16px] max-w-2xl ">
        Monitor your room listings, track bookings and analyze revenue—all in
        one place. Stay updated with real-time insights to ensure smooth
        operations.
      </p>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 my-8">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {dashboardData.totalBookings}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Revenue</p>
          <h2 className="text-3xl font-bold text-green-600">
            {currency}
            {dashboardData.totalRevenue}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Rooms</p>
          <h2 className="text-3xl font-bold text-purple-600">
            {dashboardData.totalRooms}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Available</p>
          <h2 className="text-3xl font-bold text-emerald-600">
            {dashboardData.availableRooms}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Reviews</p>
          <h2 className="text-3xl font-bold text-amber-600">
            {dashboardData.totalReviews}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Average Rating</p>
          <h2 className="text-3xl font-bold text-orange-500">
            ⭐ {dashboardData.averageRating}
          </h2>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-gray-500">Today's Check-ins</p>

          <h2 className="text-3xl font-bold text-blue-600">
            {dashboardData.todayCheckIns}
          </h2>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-gray-500">Today's Check-outs</p>

          <h2 className="text-3xl font-bold text-red-500">
            {dashboardData.todayCheckOuts}
          </h2>
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
                  {currency}
                  {item.totalPrice}
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
      <div className="mt-10 mb-10">
        <BookingChart bookings={dashboardData.bookings} />
      </div>
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-gray-500 text-sm">Occupancy</p>

        <h2 className="text-3xl font-bold text-red-500">
          {dashboardData.occupancyRate}%
        </h2>
      </div>
    </div>
  );
}
