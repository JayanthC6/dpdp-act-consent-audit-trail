import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function ConsentList() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const navigate = useNavigate()
  const pageSize = 10
  const debounceRef = useRef(null)

  useEffect(() => {
    fetchRecords(currentPage)
  }, [currentPage, statusFilter, fromDate, toDate])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setCurrentPage(0)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchRecords(0, value)
    }, 400)
  }

  const fetchRecords = (page, search = searchQuery) => {
    setLoading(true)

    const params = new URLSearchParams()
    params.append("page", page)
    params.append("size", pageSize)
    if (search) params.append("q", search)
    if (statusFilter) params.append("status", statusFilter)
    if (fromDate) params.append("from", fromDate)
    if (toDate) params.append("to", toDate)

    api.get(`/consent-records?${params.toString()}`)
      .then((res) => {
        setRecords(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load consent records.")
        setLoading(false)
      })
  }

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value)
    setCurrentPage(0)
  }

  const handleFromDate = (e) => {
    setFromDate(e.target.value)
    setCurrentPage(0)
  }

  const handleToDate = (e) => {
    setToDate(e.target.value)
    setCurrentPage(0)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("")
    setFromDate("")
    setToDate("")
    setCurrentPage(0)
  }

  const handleExport = () => {
  api.get("/consent-records/export", { responseType: "blob" })
    .then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = "consent-records.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    })
    .catch(() => alert("Export failed. Please try again."))
}

  const anyFilterActive = searchQuery || statusFilter || fromDate || toDate

  return (
    <div className="p-6">

      {/* Header with Export button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Consent Records</h1>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">

        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, purpose, fiduciary..."
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="GRANTED">Granted</option>
            <option value="REVOKED">Revoked</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={handleFromDate}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={handleToDate}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {anyFilterActive && (
          <button
            onClick={clearFilters}
            className="border px-4 py-2 rounded text-sm text-gray-500 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-500">Loading records...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-red-500">{error}</p>
        </div>
      ) : records.length === 0 ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-400">No consent records found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Principal Name</th>
                <th className="px-4 py-3">Fiduciary</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{record.id}</td>
                  <td className="px-4 py-3">{record.dataPrincipalName}</td>
                  <td className="px-4 py-3">{record.dataFiduciaryName}</td>
                  <td className="px-4 py-3">{record.purpose}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${record.consentStatus === "GRANTED" ? "bg-green-100 text-green-700" : ""}
                      ${record.consentStatus === "REVOKED" ? "bg-red-100 text-red-700" : ""}
                      ${record.consentStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" : ""}
                      ${record.consentStatus === "EXPIRED" ? "bg-gray-100 text-gray-600" : ""}
                    `}>
                      {record.consentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => navigate(`/detail/${record.id}`)}
                      className="text-gray-600 hover:underline text-xs font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/edit/${record.id}`)}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className="px-3 py-1 rounded border text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`px-3 py-1 rounded border text-sm font-medium
                ${currentPage === index
                  ? "bg-blue-700 text-white border-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-1 rounded border text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ConsentList