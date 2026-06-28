import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({ bookings }) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData = months.map((month, index) => {
    const monthlyBookings = bookings.filter(
      (booking) => new Date(booking.checkInDate).getMonth() === index,
    );

    const revenue = monthlyBookings.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0,
    );

    return {
      month,
      revenue,
    };
  });

  return (
    <div className="bg-white rounded-xl border shadow p-5">
      <h2 className="text-2xl font-semibold mb-5">Revenue Per Month</h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.15}
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={3}
            animationDuration={1200}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
