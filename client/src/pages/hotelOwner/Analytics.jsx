import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

import RevenueChart from "../../components/RevenueChart";
import OccupancyChart from "../../components/OccupancyChart";
import BookingChart from "../../components/BookingChart";
import PaymentStatusChart from "../../components/paymentStatusChart";
import ReviewAnalyticsChart from "../../components/ReviewAnalyticsChart";

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
    reviewAnalytics: [],
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

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch analytics",
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* ========================================= */}
      {/* PAGE HEADER */}
      {/* ========================================= */}

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

      {/* ========================================= */}
      {/* ANALYTICS SUMMARY CARDS */}
      {/* ========================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* TOTAL REVENUE */}

        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[125px] gap-x-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">
              Total Revenue
            </p>

            <h2 className="text-2xl font-bold text-gray-900 tracking-tight truncate">
              {currency || "$"}
              {Number(analyticsData.totalRevenue || 0).toLocaleString()}
            </h2>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* TOTAL BOOKINGS */}

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

        {/* OCCUPANCY RATE */}

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

        {/* AVERAGE RATING */}

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

      {/* ========================================= */}
      {/* CHARTS */}
      {/* ========================================= */}

      <div className="space-y-6">
        {/* ========================================= */}
        {/* ROW 1 */}
        {/* REVENUE + OCCUPANCY */}
        {/* ========================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* REVENUE CHART */}

          <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <BarChart3 className="w-4 h-4 text-gray-400" />

              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Revenue Stream Timeline
              </h3>
            </div>

            <RevenueChart bookings={analyticsData.bookings} />
          </div>

          {/* OCCUPANCY CHART */}

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

        {/* ========================================= */}
        {/* ROW 2 */}
        {/* BOOKINGS + PAYMENT STATUS */}
        {/* ========================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BOOKING CHART */}

          <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <BarChart3 className="w-4 h-4 text-gray-400" />

              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Bookings Volume Per Month
              </h3>
            </div>

            <BookingChart bookings={analyticsData.bookings} />
          </div>

          {/* PAYMENT STATUS CHART */}

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

        {/* ========================================= */}
        {/* ROW 3 */}
        {/* REVIEW ANALYTICS */}
        {/* ========================================= */}

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <Star className="w-4 h-4 text-amber-500" />

              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Guest Rating Distribution
              </h3>
            </div>

            <ReviewAnalyticsChart data={analyticsData.reviewAnalytics || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
