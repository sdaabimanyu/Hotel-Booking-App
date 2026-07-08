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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 bg-gray-50/50 min-h-screen overflow-hidden">
      {/* Header Section - Text Sized Down */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
          Monitor your room listings, track bookings, and analyze revenue—all in
          one unified space. Stay updated with real-time insights to ensure
          smooth hospitality operations.
        </p>
      </div>

      {/* Primary Analytics Grid - Compact Padding, Text Sizes & Columns */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mb-6">
        {/* Total Bookings */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Total Bookings
            </p>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mt-1 truncate">
              {dashboardData.totalBookings}
            </h2>
          </div>
          <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
            <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Total Revenue
            </p>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mt-1 truncate">
              <span className="text-gray-400 font-medium mr-0.5 text-sm sm:text-base">
                {currency}
              </span>
              {dashboardData.totalRevenue?.toLocaleString()}
            </h2>
          </div>
          <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Rooms */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Total Rooms
            </p>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mt-1 truncate">
              {dashboardData.totalRooms}
            </h2>
          </div>
          <div className="p-2 sm:p-3 bg-purple-50 text-purple-600 rounded-xl flex-shrink-0">
            <Bed className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Occupancy Rate
            </p>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mt-1 truncate">
              {dashboardData.occupancyRate}%
            </h2>
          </div>
          <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
            <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Available Rooms */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Available Rooms
            </p>
            <h2 className="text-lg sm:text-2xl font-bold text-emerald-600 mt-1 truncate">
              {dashboardData.availableRooms}
            </h2>
          </div>
          <div className="p-2 sm:p-3 bg-teal-50 text-teal-600 rounded-xl flex-shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Reviews
            </p>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mt-1 truncate">
              {dashboardData.totalReviews}
            </h2>
          </div>
          <div className="p-2 sm:p-3 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Avg Rating
            </p>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mt-1 flex items-center gap-0.5 truncate">
              {dashboardData.averageRating}
              <span className="text-[10px] sm:text-sm text-gray-400 font-normal">
                /5.5
              </span>
            </h2>
          </div>
          <div className="p-2 sm:p-3 bg-orange-50 text-orange-500 rounded-xl flex-shrink-0">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-orange-400 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Today's Live Actions Tracker - Smaller Text/Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-6">
        {/* Check-ins */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm flex justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Today's Active Check-ins
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-1">
              {dashboardData.todayCheckIns}
            </h2>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 transition-colors duration-200 group-hover:bg-blue-100">
            <LogIn className="w-5 h-5 sm:w-6 h-6" />
          </div>
        </div>

        {/* Check-outs */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm flex justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Today's Scheduled Check-outs
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-1">
              {dashboardData.todayCheckOuts}
            </h2>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 transition-colors duration-200 group-hover:bg-rose-100">
            <LogOut className="w-5 h-5 sm:w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Full-Width Layout Stack */}
      <div className="flex flex-col gap-6">
        {/* Recent Bookings Panel with Clean Tables & Locked Headings */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm w-full flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">
              Recent Bookings
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              Latest system transaction history overview
            </p>
          </div>

          {/* FIX: Contained Horizontal Wrapper to prevent total page breakage */}
          <div className="overflow-x-auto w-full">
            <div className="inline-block min-w-full align-middle">
              {/* Table Heading Module Row */}
              <table className="min-w-full table-fixed divide-y divide-gray-100">
                <thead className="bg-gray-50/70 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                  <tr>
                    <th scope="col" className="py-3 px-4 w-[160px] sm:w-1/4">
                      User Name
                    </th>
                    <th scope="col" className="py-3 px-4 w-[160px] sm:w-1/4">
                      Room Type
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 w-[120px] sm:w-1/4 text-center"
                    >
                      Total Amount
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 w-[120px] sm:w-1/4 text-center"
                    >
                      Payment Status
                    </th>
                  </tr>
                </thead>
              </table>

              {/* FIX: Separate Body Container Block for Isolated Vertical Scrolling Axis */}
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                <table className="min-w-full table-fixed">
                  <tbody className="bg-white divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                    {dashboardData.bookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-10 text-gray-400 text-xs sm:text-sm"
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
                          <td className="py-3 px-4 w-[160px] sm:w-1/4 font-medium text-gray-800 truncate">
                            {item.user?.username || "Guest User"}
                          </td>
                          <td className="py-3 px-4 w-[160px] sm:w-1/4 text-gray-600 truncate">
                            {item.room?.roomType || "Standard"}
                          </td>
                          <td className="py-3 px-4 w-[120px] sm:w-1/4 text-center font-semibold text-gray-800">
                            {currency}
                            {item.totalPrice?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 w-[120px] sm:w-1/4 text-center">
                            <span
                              className={`inline-block text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-3 sm:py-1 rounded-full ${
                                item.isPaid
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}
                            >
                              {item.isPaid ? "Completed" : "Pending"}
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

        {/* Booking Trends Chart Box */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm w-full overflow-hidden">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              Booking Trends
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              Visual monthly analytics for incoming reservations
            </p>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[480px] w-full">
              <BookingChart bookings={dashboardData.bookings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
