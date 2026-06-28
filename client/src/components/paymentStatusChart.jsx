import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function paymentStatusChart({ bookings }) {
  const paid = bookings.filter((booking) => booking.isPaid).length;

  const unpaid = bookings.filter((booking) => !booking.isPaid).length;

  const data = [
    {
      name: "Paid",
      value: paid,
    },
    {
      name: "Pending",
      value: unpaid,
    },
  ];

  const COLORS = ["#22c55e", "#f59e0b"];
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <h2 className="text-2xl font-semibold mb-5">Payment Status</h2>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip formatter={(value) => [`${value} bookings`, "Status"]} />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
