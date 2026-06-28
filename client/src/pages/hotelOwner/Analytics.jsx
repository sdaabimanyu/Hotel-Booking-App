import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import RevenueChart from "../../components/RevenueChart";
import OccupancyChart from "../../components/OccupancyChart";
import BookingChart from "../../components/BookingChart";
import PaymentStatusChart from "../../components/paymentStatusChart";

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
  console.log(analyticsData.roomOccupancy);
  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get("/api/bookings/hotel", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      console.log(data);

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
    <div className="pb-10">
      {/* Heading */}
      <h1 className="text-[40px]">Analytics</h1>

      <p className="text-gray-500 max-w-2xl mt-2">
        Monitor your hotel's performance using real-time booking, revenue,
        occupancy and review analytics.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-10">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-500">Revenue</p>

          <h2 className="text-3xl font-bold text-green-600">
            {currency}
            {analyticsData.totalRevenue.toLocaleString()}
          </h2>

          <p className="text-sm text-green-600 mt-2">Total revenue generated</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-500">Bookings</p>

          <h2 className="text-3xl font-bold text-blue-600">
            {analyticsData.totalBookings}
          </h2>

          <p className="text-sm text-blue-600 mt-2">Confirmed reservations</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-500">Occupancy</p>

          <h2 className="text-3xl font-bold text-purple-600">
            {analyticsData.occupancyRate}%
          </h2>

          <p className="text-sm text-purple-600 mt-2">
            Available vs total rooms
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-500">Average Rating</p>

          <h2 className="text-3xl font-bold text-orange-500">
            ⭐ {analyticsData.averageRating}
          </h2>

          <p className="text-sm text-orange-500 mt-2">
            Based on customer reviews
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-10">
        <RevenueChart bookings={analyticsData.bookings} />

        <OccupancyChart data={analyticsData.roomOccupancy} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <BookingChart bookings={analyticsData.bookings} />

        <PaymentStatusChart bookings={analyticsData.bookings} />
      </div>
    </div>
  );
}
