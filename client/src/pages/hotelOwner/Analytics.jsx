import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import RevenueChart from "../../components/RevenueChart";

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
    <div>
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
            {analyticsData.totalRevenue}
          </h2>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-500">Bookings</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {analyticsData.totalBookings}
          </h2>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-500">Occupancy</p>
          <h2 className="text-3xl font-bold text-purple-600">
            {analyticsData.occupancyRate}%
          </h2>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <p className="text-gray-500">Average Rating</p>
          <h2 className="text-3xl font-bold text-orange-500">
            ⭐ {analyticsData.averageRating}
          </h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-10">
        <RevenueChart bookings={analyticsData.bookings} />

        <div className="bg-white rounded-xl border shadow-sm h-[420px] p-6">
          <h2 className="text-xl font-semibold">Occupancy By Room</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl border shadow-sm h-[420px] p-6">
          <h2 className="text-xl font-semibold">Bookings Per Month</h2>
        </div>

        <div className="bg-white rounded-xl border shadow-sm h-[420px] p-6">
          <h2 className="text-xl font-semibold">Payment Status</h2>
        </div>
      </div>
    </div>
  );
}
