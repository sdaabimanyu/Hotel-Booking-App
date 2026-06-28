import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

export default function OccupancyChart({ data }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm h-85 p-6">
      <h2 className="text-2xl font-semibold mb-5">Occupancy By Room</h2>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 50,
            left: 5,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" domain={[0, 100]} />

          <YAxis
            type="category"
            dataKey="roomType"
            width={115}
            tick={{ fontSize: 14 }}
          />

          <Tooltip />

          <Bar
            dataKey="occupancy"
            fill="#2563eb"
            radius={[0, 8, 8, 0]}
            barSize={12}
          >
            <LabelList
              dataKey="occupancy"
              position="right"
              formatter={(value) => `${value}%`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
