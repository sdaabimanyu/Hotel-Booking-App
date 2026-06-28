import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function BookingChart({ bookings }) {
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

  const chartData = months.map((month, index) => ({
    month,
    bookings: bookings.filter(
      (booking) => new Date(booking.checkInDate).getMonth() === index,
    ).length,
  }));

  return (
    <div className="bg-white rounded-xl shadow border p-5">
      <h2 className="text-xl font-semibold mb-4">Bookings Per Month</h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis allowDecimals={false} />

          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          />

          <Bar
            dataKey="bookings"
            fill="#2563eb"
            radius={[8, 8, 0, 0]}
            barSize={30}
            animationDuration={1200}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
