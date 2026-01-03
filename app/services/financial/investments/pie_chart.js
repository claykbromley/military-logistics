import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const DEFAULT_COLORS = [
  "#4F46E5",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#F97316",
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value, payload: original } = payload[0];
  const total = original.__total ?? payload[0].payload.__total;
  const pct = total ? ((value / total) * 100).toFixed(1) : "0.0";

  return (
    <div>
      <div>{name}</div>
      <div>
        {pct}%
      </div>
    </div>
  );
}

export default function HoverPie({
  data = [],
  colors = DEFAULT_COLORS,
  innerRadius = "40%",
  outerRadius = "70%",
  startAngle = 90,
  endAngle = -270,
  width = "100%",
  height = 200
}) {
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const enriched = data.map((d) => ({ ...d, __total: total }));
  
  return (
    <div style={{ width: width, height: height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={enriched}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            legendType="circle"
            isAnimationActive={true}
          >
            {enriched.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}