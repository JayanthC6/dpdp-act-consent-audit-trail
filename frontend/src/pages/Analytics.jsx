import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend
} from "recharts"
import api from "../services/api"

function Analytics() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/consent-records/stats")
      .then((res) => {
        setStats(res.data)
        setLoading(false)
      })
      .catch(() => {
        setStats({ total: 0, granted: 0, revoked: 0, pending: 0, expired: 0 })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  const pieData = [
    { name: "Granted", value: stats.granted, color: "#16a34a" },
    { name: "Pending", value: stats.pending, color: "#ca8a04" },
    { name: "Revoked", value: stats.revoked, color: "#dc2626" },
    { name: "Expired", value: stats.expired, color: "#6b7280" },
  ].filter(d => d.value > 0)

  const lineData = [
    { period: "Granted", count: stats.granted },
    { period: "Pending", count: stats.pending },
    { period: "Revoked", count: stats.revoked },
    { period: "Expired", count: stats.expired },
  ]

  const complianceRate = stats.total > 0
    ? Math.round((stats.granted / stats.total) * 100)
    : 0

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-blue-700 hover:underline"
        >
          View All Records →
        </button>
      </div>

      {/* Compliance Rate Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-center gap-6">
        <div className="text-center">
          <p className="text-5xl font-bold text-blue-700">{complianceRate}%</p>
          <p className="text-sm text-gray-500 mt-1">Compliance Rate</p>
        </div>
        <div className="border-l pl-6">
          <p className="text-sm text-gray-600">
            {stats.granted} out of {stats.total} consent records are currently
            in GRANTED status. A higher compliance rate indicates better
            data governance under the DPDP Act 2023.
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Consent Distribution
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Status Overview
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: "#2563eb", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Summary
        </h2>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Count</th>
              <th className="px-4 py-3">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Granted", value: stats.granted, color: "text-green-700" },
              { label: "Pending", value: stats.pending, color: "text-yellow-700" },
              { label: "Revoked", value: stats.revoked, color: "text-red-700" },
              { label: "Expired", value: stats.expired, color: "text-gray-600" },
            ].map((row) => (
              <tr key={row.label} className="border-b">
                <td className={`px-4 py-3 font-medium ${row.color}`}>
                  {row.label}
                </td>
                <td className="px-4 py-3">{row.value}</td>
                <td className="px-4 py-3">
                  {stats.total > 0
                    ? Math.round((row.value / stats.total) * 100)
                    : 0}%
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3">{stats.total}</td>
              <td className="px-4 py-3">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Analytics