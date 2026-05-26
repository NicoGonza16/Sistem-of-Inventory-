import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#22d3ee", "#1e293b", "#0ea5e9", "#38bdf8"];

function StatusPieChart({ data, dataKey = "value" }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={64}
            outerRadius={92}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#020617",
              border: "1px solid rgba(148,163,184,0.14)",
              borderRadius: "16px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StatusPieChart;
