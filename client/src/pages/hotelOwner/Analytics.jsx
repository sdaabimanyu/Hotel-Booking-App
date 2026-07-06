import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import RevenueChart from "../../components/RevenueChart";
import OccupancyChart from "../../components/OccupancyChart";
import BookingChart from "../../components/BookingChart";
import PaymentStatusChart from "../../components/paymentStatusChart";
import {
  DollarSign,
  CalendarCheck,
  Percent,
  Star,
  BarChart3,
  TrendingUp,
} from "lucide-react";

export default function Analytics() {
  const { axios, getToken, user, currency } = useAppContext();
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    averageRating: 0,
    bookings: [],
    totalRooms: 0,
    availableRooms: 0,
    roomOccupancy: [],
  });

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get("/api/bookings/hotel", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setAnalyticsData(data.dashboardData);
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
      fetchAnalytics();
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Top Heading Module */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor your hotel's performance using real-time booking, revenue,
            occupancy, and review analytics.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg self-start md:self-auto">
          <TrendingUp className="w-4 h-4" />
          Live Metrics Updated
        </div>
      </div>

      {/* 2x2 Grid Layout (Two Cards Top, Two Cards Bottom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Row 1, Left: Revenue Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[125px] gap-x-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">
              Total Revenue
            </p>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight truncate">
              {currency || "$"}
              {analyticsData.totalRevenue.toLocaleString()}
            </h2>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Row 1, Right: Bookings Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[125px] gap-x-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">
              Total Bookings
            </p>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight truncate">
              {analyticsData.totalBookings}
            </h2>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Row 2, Left: Occupancy Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[125px] gap-x-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">
              Occupancy Rate
            </p>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight truncate">
              {analyticsData.occupancyRate}%
            </h2>
          </div>
          <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl shrink-0">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        {/* Row 2, Right: Rating Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[125px] gap-x-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">
              Average Rating
            </p>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-baseline gap-1 truncate">
              {analyticsData.averageRating || "0.0"}
              <span className="text-xs font-semibold text-gray-400">/ 5.0</span>
            </h2>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Main Charts Matrix */}
      <div className="space-y-6">
        {/* Row 1: Core Financials & Occupancy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Revenue Stream Timeline
              </h3>
            </div>
            <RevenueChart bookings={analyticsData.bookings} />
          </div>

          <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Occupancy Performance By Room
              </h3>
            </div>
            <OccupancyChart data={analyticsData.roomOccupancy} />
          </div>
        </div>

        {/* Row 2: Booking Volumes & Payment Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Bookings Volume Per Month
              </h3>
            </div>
            <BookingChart bookings={analyticsData.bookings} />
          </div>

          <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Payment Status Categorization
              </h3>
            </div>
            <PaymentStatusChart bookings={analyticsData.bookings} />
          </div>
        </div>
      </div>
    </div>
  );
}
