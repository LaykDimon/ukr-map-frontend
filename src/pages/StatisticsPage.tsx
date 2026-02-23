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
  DeathPlaceEntry,
  OverviewData,
} from "../api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchPersons } from "../store/personsSlice";

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
  const dispatch = useAppDispatch();
  const persons = useAppSelector((s) => s.persons.items);

  const [temporal, setTemporal] = useState<TemporalEntry[]>([]);
  const [geo, setGeo] = useState<GeoEntry[]>([]);
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [deathPlaces, setDeathPlaces] = useState<DeathPlaceEntry[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  // Interactive filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterYearFrom, setFilterYearFrom] = useState<number | null>(null);
  const [filterYearTo, setFilterYearTo] = useState<number | null>(null);

  const hasFilters =
    filterCategory !== "" || filterYearFrom !== null || filterYearTo !== null;

  useEffect(() => {
    if (persons.length === 0) dispatch(fetchPersons());
  }, [dispatch, persons.length]);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, g, c, dp, o] = await Promise.allSettled([
          statisticsApi.temporal(),
          statisticsApi.geo(15),
          statisticsApi.categories(),
          statisticsApi.deathPlaces(15),
          statisticsApi.overview(),
        ]);
        if (t.status === "fulfilled") setTemporal(t.value.data);
        if (g.status === "fulfilled") setGeo(g.value.data);
        if (c.status === "fulfilled") setCategories(c.value.data);
        if (dp.status === "fulfilled") setDeathPlaces(dp.value.data);
        if (o.status === "fulfilled") setOverview(o.value.data);
      } catch (err) {
        console.error("Failed to load statistics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Available categories for filter dropdown
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    persons.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [persons]);

  // Filtered persons based on interactive filters
  const filteredPersons = useMemo(() => {
    if (!hasFilters) return persons;
    return persons.filter((p) => {
      if (filterCategory && p.category !== filterCategory) return false;
      if (
        filterYearFrom !== null &&
        (p.birthYear == null || p.birthYear < filterYearFrom)
      )
        return false;
      if (
        filterYearTo !== null &&
        (p.birthYear == null || p.birthYear > filterYearTo)
      )
        return false;
      return true;
    });
  }, [persons, filterCategory, filterYearFrom, filterYearTo, hasFilters]);

  // Recompute chart data from filtered persons when filters are active
  const filteredTemporal = useMemo<TemporalEntry[]>(() => {
    if (!hasFilters) return temporal;
    const map = new Map<number, number>();
    filteredPersons.forEach((p) => {
      if (p.birthYear == null) return;
      const decade = Math.floor(p.birthYear / 10) * 10;
      map.set(decade, (map.get(decade) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([decade, count]) => ({ decade, count }));
  }, [hasFilters, temporal, filteredPersons]);

  const filteredGeo = useMemo<GeoEntry[]>(() => {
    if (!hasFilters) return geo;
    const map = new Map<string, number>();
    filteredPersons.forEach((p) => {
      if (!p.birthPlace) return;
      map.set(p.birthPlace, (map.get(p.birthPlace) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([birthPlace, count]) => ({ birthPlace, count }));
  }, [hasFilters, geo, filteredPersons]);

  const filteredCategories = useMemo<CategoryEntry[]>(() => {
    if (!hasFilters) return categories;
    const map = new Map<string, number>();
    filteredPersons.forEach((p) => {
      if (!p.category) return;
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({ category, count }));
  }, [hasFilters, categories, filteredPersons]);

  const filteredDeathPlaces = useMemo<DeathPlaceEntry[]>(() => {
    if (!hasFilters) return deathPlaces;
    const map = new Map<string, number>();
    filteredPersons.forEach((p) => {
      const dp = p.meta_data?.deathPlace;
      if (!dp) return;
      map.set(dp, (map.get(dp) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([deathPlace, count]) => ({ deathPlace, count }));
  }, [hasFilters, deathPlaces, filteredPersons]);

  const filteredOverview = useMemo<OverviewData | null>(() => {
    if (!hasFilters) return overview;
    if (filteredPersons.length === 0) return null;
    const withCoords = filteredPersons.filter(
      (p) => p.lat != null && p.lng != null,
    );
    const cats = new Set(
      filteredPersons.map((p) => p.category).filter(Boolean),
    );
    const years = filteredPersons
      .map((p) => p.birthYear)
      .filter((y): y is number => y != null);
    return {
      totalPersons: filteredPersons.length,
      totalWithCoordinates: withCoords.length,
      totalCategories: cats.size,
      minBirthYear: years.length > 0 ? Math.min(...years) : 0,
      maxBirthYear: years.length > 0 ? Math.max(...years) : 0,
      avgRating:
        filteredPersons.reduce((s, p) => s + p.rating, 0) /
        filteredPersons.length,
    };
  }, [hasFilters, overview, filteredPersons]);

  const filterInputStyle: React.CSSProperties = {
    padding: "6px 8px",
    borderRadius: 4,
    border: "1px solid var(--border-tertiary)",
    backgroundColor: "var(--bg-input)",
    color: "var(--text-primary)",
    fontSize: 13,
  };

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

      {/* Interactive filter bar */}
      <div
        style={{
          ...cardStyle,
          maxWidth: 800,
          margin: "0 auto 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{ fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}
        >
          Filter charts:
        </span>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ ...filterInputStyle, minWidth: 140 }}
        >
          <option value="">All categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Year from"
          value={filterYearFrom ?? ""}
          onChange={(e) =>
            setFilterYearFrom(e.target.value ? parseInt(e.target.value) : null)
          }
          style={{ ...filterInputStyle, width: 100 }}
        />
        <span style={{ color: "var(--text-muted)" }}>–</span>
        <input
          type="number"
          placeholder="Year to"
          value={filterYearTo ?? ""}
          onChange={(e) =>
            setFilterYearTo(e.target.value ? parseInt(e.target.value) : null)
          }
          style={{ ...filterInputStyle, width: 100 }}
        />
        {hasFilters && (
          <button
            onClick={() => {
              setFilterCategory("");
              setFilterYearFrom(null);
              setFilterYearTo(null);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid var(--border-tertiary)",
              backgroundColor: "transparent",
              color: "var(--text-tertiary)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        )}
        {hasFilters && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            ({filteredPersons.length} persons match)
          </span>
        )}
      </div>

      {/* Overview cards */}
      {filteredOverview && (
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
            { label: "Total persons", value: filteredOverview.totalPersons },
            {
              label: "With coordinates",
              value: filteredOverview.totalWithCoordinates,
            },
            { label: "Categories", value: filteredOverview.totalCategories },
            {
              label: "Birth year range",
              value: `${filteredOverview.minBirthYear} – ${filteredOverview.maxBirthYear}`,
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
            <AreaChart data={filteredTemporal}>
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
            <BarChart data={filteredGeo} layout="vertical">
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

        {/* Top death places */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Top death places</h3>
          {filteredDeathPlaces.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredDeathPlaces} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-primary)"
                />
                <XAxis type="number" stroke="var(--text-muted)" />
                <YAxis
                  dataKey="deathPlace"
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
                <Bar dataKey="count" fill="#FF8042" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              No death place data available yet.
            </p>
          )}
        </div>

        {/* Categories pie chart */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Categories</h3>
          <CategoriesPieChart categories={filteredCategories} />
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
