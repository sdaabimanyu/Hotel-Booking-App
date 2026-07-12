import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import BookingChart from "../../components/BookingChart";
import {
  LogIn,
  LogOut,
  CalendarCheck,
  DollarSign,
  Bed,
  CheckCircle,
  Star,
  Percent,
} from "lucide-react";

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
    scheduledCheckOuts: 0,
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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 bg-gray-50/50 min-h-screen overflow-x-hidden">
      {/* Balanced Header Section */}
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm mt-0.5 leading-normal max-w-3xl">
          Monitor your room listings, track bookings, and analyze revenue—all in
          one unified space.
        </p>
      </div>

      {/* Clean, Medium-Sized Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mb-4 w-full">
        {/* Total Bookings */}
        <div className="bg-white border border-gray-100 rounded-lg p-2.5 md:p-4 shadow-sm flex items-center justify-between min-w-0">
          <div className="truncate pr-1">
            <p className="text-[9px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Total Bookings
            </p>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 mt-0.5 truncate">
              {dashboardData.totalBookings}
            </h2>
          </div>
          <div className="p-1 sm:p-2 bg-blue-50 text-blue-600 rounded-md flex-shrink-0">
            <CalendarCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white border border-gray-100 rounded-lg p-2.5 md:p-4 shadow-sm flex items-center justify-between min-w-0">
          <div className="truncate pr-1">
            <p className="text-[9px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Total Revenue
            </p>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 mt-0.5 truncate">
              <span className="text-gray-400 font-medium mr-0.5 text-[10px] sm:text-xs md:text-sm">
                {currency}
              </span>
              {dashboardData.totalRevenue?.toLocaleString()}
            </h2>
          </div>
          <div className="p-1 sm:p-2 bg-emerald-50 text-emerald-600 rounded-md flex-shrink-0">
            <DollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Rooms */}
        <div className="bg-white border border-gray-100 rounded-lg p-2.5 md:p-4 shadow-sm flex items-center justify-between min-w-0">
          <div className="truncate pr-1">
            <p className="text-[9px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Total Rooms
            </p>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 mt-0.5 truncate">
              {dashboardData.totalRooms}
            </h2>
          </div>
          <div className="p-1 sm:p-2 bg-purple-50 text-purple-600 rounded-md flex-shrink-0">
            <Bed className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white border border-gray-100 rounded-lg p-2.5 md:p-4 shadow-sm flex items-center justify-between min-w-0">
          <div className="truncate pr-1">
            <p className="text-[9px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Occupancy Rate
            </p>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 mt-0.5 truncate">
              {dashboardData.occupancyRate}%
            </h2>
          </div>
          <div className="p-1 sm:p-2 bg-indigo-50 text-indigo-600 rounded-md flex-shrink-0">
            <Percent className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Available Rooms */}
        <div className="bg-white border border-gray-100 rounded-lg p-2.5 md:p-4 shadow-sm flex items-center justify-between min-w-0">
          <div className="truncate pr-1">
            <p className="text-[9px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Available Rooms
            </p>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-emerald-600 mt-0.5 truncate">
              {dashboardData.availableRooms}
            </h2>
          </div>
          <div className="p-1 sm:p-2 bg-teal-50 text-teal-600 rounded-md flex-shrink-0">
            <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white border border-gray-100 rounded-lg p-2.5 md:p-4 shadow-sm flex items-center justify-between min-w-0">
          <div className="truncate pr-1">
            <p className="text-[9px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Reviews
            </p>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 mt-0.5 truncate">
              {dashboardData.totalReviews}
            </h2>
          </div>
          <div className="p-1 sm:p-2 bg-amber-50 text-amber-600 rounded-md flex-shrink-0">
            <Star className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-amber-500 text-amber-500" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white border border-gray-100 rounded-lg p-2.5 md:p-4 shadow-sm flex items-center justify-between min-w-0">
          <div className="truncate pr-1">
            <p className="text-[9px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Avg Rating
            </p>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 mt-0.5 flex items-center gap-0.5 truncate">
              {dashboardData.averageRating}
              <span className="text-[9px] sm:text-xs text-gray-400 font-normal">
                /5
              </span>
            </h2>
          </div>
          <div className="p-1 sm:p-2 bg-orange-50 text-orange-500 rounded-md flex-shrink-0">
            <Star className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-orange-400 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Today's Actions Tracker - Clean Medium Heights */}
      <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 w-full">
        {/* Check-ins */}
        <div className="bg-white rounded-lg border border-gray-100 p-2.5 md:p-4 shadow-sm flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-0.5 md:w-1 h-full bg-blue-500" />
          <div className="truncate pr-1">
            <p className="text-[9px] sm:text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-wider truncate">
              Active Check-ins
            </p>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mt-0.5">
              {dashboardData.todayCheckIns}
            </h2>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Check-outs */}
        <div className="bg-white rounded-lg border border-gray-100 p-2.5 md:p-4 shadow-sm flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-0.5 md:w-1 h-full bg-rose-500" />
          <div className="truncate pr-1">
            <p className="text-[9px] sm:text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-wider truncate">
              Scheduled Check-outs
            </p>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mt-0.5">
              {dashboardData.scheduledCheckOuts}
            </h2>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Tables & Charts Layout Wrapper */}
      <div className="flex flex-col gap-4 w-full max-w-full">
        {/* Recent Bookings Module */}
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm w-full flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-gray-800">
              Recent Bookings
            </h2>
          </div>

          <div className="overflow-x-auto w-full max-w-full">
            <div className="inline-block min-w-full align-middle">
              <div className="max-h-48 md:max-h-64 overflow-y-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-100">
                  <thead className="bg-white text-[9px] sm:text-xs md:text-sm font-semibold text-gray-500 uppercase sticky top-0 z-20 border-b border-gray-100 text-left">
                    {" "}
                    <tr>
                      <th scope="col" className="py-2.5 px-3 w-[28%]">
                        User Name
                      </th>
                      <th scope="col" className="py-2.5 px-3 w-[28%]">
                        Room
                      </th>
                      <th
                        scope="col"
                        className="py-2.5 px-3 w-[22%] text-center"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="py-2.5 px-3 w-[22%] text-center"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-[10px] sm:text-xs md:text-sm text-gray-700">
                    {dashboardData.bookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-6 text-gray-400"
                        >
                          No recent bookings found.
                        </td>
                      </tr>
                    ) : (
                      dashboardData.bookings.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-2 px-3 font-medium text-gray-800 truncate">
                            {item.user?.username || "Guest"}
                          </td>
                          <td className="py-2 px-3 text-gray-600 truncate">
                            {item.room?.roomType || "Standard"}
                          </td>
                          <td className="py-2 px-3 text-center font-semibold text-gray-800 truncate">
                            {currency}
                            {item.totalPrice?.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-block text-[8px] sm:text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full ${item.isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                            >
                              {item.isPaid ? "Paid" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Trends Chart Block */}
        <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-100 shadow-sm w-full overflow-hidden">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 mb-2">
            Booking Trends
          </h3>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[400px] md:min-w-full w-full">
              <BookingChart bookings={dashboardData.bookings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
