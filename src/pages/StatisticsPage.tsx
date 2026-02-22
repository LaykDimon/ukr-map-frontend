import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  statisticsApi,
  TemporalEntry,
  GeoEntry,
  CategoryEntry,
  OverviewData,
} from "../api";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c43",
  "#a4de6c",
  "#d0ed57",
  "#8dd1e1",
];

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-card)",
  borderRadius: 10,
  padding: "1.25rem",
  border: "1px solid var(--border-primary)",
};

const TOP_N = 10;

const CategoriesPieChart: React.FC<{ categories: CategoryEntry[] }> = ({
  categories,
}) => {
  const chartData = useMemo(() => {
    const sorted = [...categories].sort((a, b) => b.count - a.count);
    if (sorted.length <= TOP_N + 1) return sorted;
    const top = sorted.slice(0, TOP_N);
    const otherCount = sorted.slice(TOP_N).reduce((sum, c) => sum + c.count, 0);
    return [
      ...top,
      { category: `Other (${sorted.length - TOP_N})`, count: otherCount },
    ];
  }, [categories]);

  const total = useMemo(
    () => chartData.reduce((s, c) => s + c.count, 0),
    [chartData],
  );

  return (
    <ResponsiveContainer width="100%" height={380}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={(props: any) => `${props.name} (${props.value})`}
          labelLine
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-secondary)",
            borderRadius: 6,
            color: "var(--text-primary)",
          }}
          itemStyle={{ color: "var(--text-primary)" }}
          labelStyle={{ color: "var(--text-secondary)" }}
          formatter={(value: any, name: any) => [
            `${value} (${((Number(value) / total) * 100).toFixed(1)}%)`,
            name,
          ]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const StatisticsPage: React.FC = () => {
  const [temporal, setTemporal] = useState<TemporalEntry[]>([]);
  const [geo, setGeo] = useState<GeoEntry[]>([]);
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, g, c, o] = await Promise.all([
          statisticsApi.temporal(),
          statisticsApi.geo(15),
          statisticsApi.categories(),
          statisticsApi.overview(),
        ]);
        setTemporal(t.data);
        setGeo(g.data);
        setCategories(c.data);
        setOverview(o.data);
      } catch (err) {
        console.error("Failed to load statistics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#aaa",
          backgroundColor: "var(--bg-page)",
        }}
      >
        Loading statistics...
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--bg-page)",
        minHeight: "100vh",
        padding: "2rem",
        color: "var(--text-primary)",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Statistics Dashboard
      </h1>

      {/* Overview cards */}
      {overview && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
            maxWidth: 800,
            margin: "0 auto 2rem",
          }}
        >
          {[
            { label: "Total persons", value: overview.totalPersons },
            { label: "With coordinates", value: overview.totalWithCoordinates },
            { label: "Categories", value: overview.totalCategories },
            {
              label: "Birth year range",
              value: `${overview.minBirthYear} – ${overview.maxBirthYear}`,
            },
          ].map((item) => (
            <div key={item.label} style={cardStyle}>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Temporal distribution */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Persons by decade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={temporal}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-primary)"
              />
              <XAxis dataKey="decade" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                }}
                itemStyle={{ color: "var(--text-primary)" }}
                labelStyle={{ color: "var(--text-secondary)" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#0088FE"
                fill="#0088FE"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top birthplaces */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Top birthplaces</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={geo} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-primary)"
              />
              <XAxis type="number" stroke="var(--text-muted)" />
              <YAxis
                dataKey="birthPlace"
                type="category"
                width={140}
                stroke="var(--text-muted)"
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                }}
                itemStyle={{ color: "var(--text-primary)" }}
                labelStyle={{ color: "var(--text-secondary)" }}
              />
              <Bar dataKey="count" fill="#00C49F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Categories pie chart */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Categories</h3>
          <CategoriesPieChart categories={categories} />
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
