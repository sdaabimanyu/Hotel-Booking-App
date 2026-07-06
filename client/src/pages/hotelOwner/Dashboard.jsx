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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50/50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-3xl leading-relaxed">
          Monitor your room listings, track bookings, and analyze revenue—all in
          one unified space. Stay updated with real-time insights to ensure
          smooth hospitality operations.
        </p>
      </div>

      {/* Primary Analytics Grid - Using auto-fit to prevent layout breaks on large numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 mb-8">
        {/* Total Bookings */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Total Bookings
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2 truncate">
              {dashboardData.totalBookings}
            </h2>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Revenue - Fully dynamic width sizing */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Total Revenue
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2 truncate">
              <span className="text-gray-400 font-medium mr-1">{currency}</span>
              {dashboardData.totalRevenue?.toLocaleString()}
            </h2>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Total Rooms */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Total Rooms
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2 truncate">
              {dashboardData.totalRooms}
            </h2>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl flex-shrink-0">
            <Bed className="w-5 h-5" />
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Occupancy Rate
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2 truncate">
              {dashboardData.occupancyRate}%
            </h2>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        {/* Available Rooms */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Available Rooms
            </p>
            <h2 className="text-2xl font-bold text-emerald-600 mt-2 truncate">
              {dashboardData.availableRooms}
            </h2>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Reviews Received
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2 truncate">
              {dashboardData.totalReviews}
            </h2>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-w-0">
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Average Rating
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2 flex items-center gap-1 truncate">
              {dashboardData.averageRating}
              <span className="text-sm text-gray-400 font-normal">/ 5.0</span>
            </h2>
          </div>
          <div className="p-3 bg-orange-50 text-orange-500 rounded-xl flex-shrink-0">
            <Star className="w-5 h-5 fill-orange-400 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Today's Live Actions Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* Check-ins */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Today's Active Check-ins
            </p>
            <h2 className="text-3xl font-extrabold text-gray-800 mt-2">
              {dashboardData.todayCheckIns}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 transition-colors duration-200 group-hover:bg-blue-100">
            <LogIn className="w-6 h-6" />
          </div>
        </div>

        {/* Check-outs */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Today's Scheduled Check-outs
            </p>
            <h2 className="text-3xl font-extrabold text-gray-800 mt-2">
              {dashboardData.todayCheckOuts}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 transition-colors duration-200 group-hover:bg-rose-100">
            <LogOut className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Full-Width Layout Stack */}
      <div className="flex flex-col gap-10">
        {/* 1. Recent Bookings (Full Width + Scrollable Body) */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden w-full flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Latest system transaction history overview
            </p>
          </div>

          <div className="w-full overflow-x-auto">
            {/* Table wrapper containing locked sticky header row */}
            <div className="min-w-[700px] flex flex-col">
              <div className="grid grid-cols-4 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-6">
                <div>User Name</div>
                <div className="max-sm:hidden">Room Type</div>
                <div className="text-center">Total Amount</div>
                <div className="text-center">Payment Status</div>
              </div>

              {/* Scrollable Container Box */}
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {dashboardData.bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    No recent bookings found.
                  </div>
                ) : (
                  dashboardData.bookings.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 items-center py-4 px-6 hover:bg-gray-50/50 transition-colors text-sm text-gray-700"
                    >
                      <div className="font-medium text-gray-800 truncate pr-2">
                        {item.user.username}
                      </div>
                      <div className="text-gray-600 max-sm:hidden truncate pr-2">
                        {item.room.roomType}
                      </div>
                      <div className="text-center font-semibold text-gray-800">
                        {currency}
                        {item.totalPrice?.toLocaleString()}
                      </div>
                      <div className="flex justify-center">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            item.isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {item.isPaid ? "Completed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Booking Trends Chart (Below the Table) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Booking Trends</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Visual monthly analytics for incoming reservations
            </p>
          </div>
          <div className="w-full">
            <BookingChart bookings={dashboardData.bookings} />
          </div>
        </div>
      </div>
    </div>
  );
}
