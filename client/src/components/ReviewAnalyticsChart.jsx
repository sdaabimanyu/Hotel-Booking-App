import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ReviewAnalyticsChart = ({ data = [] }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="rating"
            tickFormatter={(rating) => `${rating} Star`}
          />

          <YAxis allowDecimals={false} />

          <Tooltip
            formatter={(value) => [value, "Reviews"]}
            labelFormatter={(rating) => `${rating} Star Rating`}
          />

          <Bar
            dataKey="count"
            name="Reviews"
            fill="#f59e0b"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReviewAnalyticsChart;
