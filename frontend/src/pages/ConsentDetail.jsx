import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../services/api"

function ConsentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [loadingRec, setLoadingRec] = useState(false)
  const [report, setReport] = useState(null)
  const [loadingReport, setLoadingReport] = useState(false)

  const fetchRecommendations = () => {
    setLoadingRec(true)
    fetch("http://localhost:5000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataPrincipalName: record?.dataPrincipalName,
        dataFiduciaryName: record?.dataFiduciaryName,
        purpose: record?.purpose,
        dataCategories: record?.dataCategories,
        consentStatus: record?.consentStatus
      })
    })
      .then(res => res.json())
      .then(data => {
        setRecommendations(data)
        setLoadingRec(false)
      })
      .catch(() => setLoadingRec(false))
  }

  const fetchReport = () => {
    setLoadingReport(true)
    fetch("http://localhost:5000/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stats: { total: 1 },
        records: [record]
      })
    })
      .then(res => res.json())
      .then(data => {
        setReport(data)
        setLoadingReport(false)
      })
      .catch(() => setLoadingReport(false))
  }

  useEffect(() => {
    api.get(`/consent-records/${id}`)
      .then((res) => {
        setRecord(res.data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [id])

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this record?")) return
    setDeleting(true)
    api.delete(`/consent-records/${id}`)
      .then(() => {
        navigate("/")
      })
      .catch(() => {
        alert("Failed to delete record.")
        setDeleting(false)
      })
  }

  const getScoreBadge = (score) => {
    if (!score) return null
    if (score >= 75) return "bg-green-100 text-green-700"
    if (score >= 50) return "bg-yellow-100 text-yellow-700"
    return "bg-red-100 text-red-700"
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "GRANTED": return "bg-green-100 text-green-700"
      case "REVOKED": return "bg-red-100 text-red-700"
      case "PENDING": return "bg-yellow-100 text-yellow-700"
      case "EXPIRED": return "bg-gray-100 text-gray-600"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading record...</p>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Record not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Consent Record #{record.id}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/edit/${record.id}`)}
            className="bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="border px-4 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">

        {/* Status and AI Score */}
        <div className="flex gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(record.consentStatus)}`}>
            {record.consentStatus}
          </span>
          {record.aiScore && (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBadge(record.aiScore)}`}>
              AI Score: {record.aiScore}/100
            </span>
          )}
          {record.isFallback && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-500">
              Fallback Response
            </span>
          )}
        </div>

        {/* Principal Info */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Data Principal (Citizen)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">ID</p>
              <p className="text-sm text-gray-800">{record.dataPrincipalId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="text-sm text-gray-800">{record.dataPrincipalName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm text-gray-800">{record.dataPrincipalEmail}</p>
            </div>
          </div>
        </div>

        {/* Fiduciary Info */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Data Fiduciary (Organisation)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">ID</p>
              <p className="text-sm text-gray-800">{record.dataFiduciaryId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="text-sm text-gray-800">{record.dataFiduciaryName}</p>
            </div>
          </div>
        </div>

        {/* Consent Details */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Consent Details
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Purpose</p>
              <p className="text-sm text-gray-800">{record.purpose}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Data Categories</p>
              <p className="text-sm text-gray-800">{record.dataCategories}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Consent Date</p>
                <p className="text-sm text-gray-800">
                  {record.consentDate
                    ? new Date(record.consentDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Expiry Date</p>
                <p className="text-sm text-gray-800">
                  {record.expiryDate
                    ? new Date(record.expiryDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Description */}
        {record.aiDescription && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              AI Description
            </h2>
            <p className="text-sm text-gray-700 bg-gray-50 rounded p-3 leading-relaxed">
              {record.aiDescription}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Created At</p>
              <p className="text-sm text-gray-600">
                {new Date(record.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Last Updated</p>
              <p className="text-sm text-gray-600">
                {new Date(record.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* AI Panel */}
        <div className="border-t pt-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            AI Actions
          </h2>
          <div className="flex gap-3 mb-4">
            <button
              onClick={fetchRecommendations}
              disabled={loadingRec}
              className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loadingRec ? "Loading..." : "Get Recommendations"}
            </button>
            <button
              onClick={fetchReport}
              disabled={loadingReport}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loadingReport ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {/* Recommendations */}
          {recommendations && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Recommendations</h3>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-purple-50 rounded p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-purple-700">
                        {rec.action_type}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${rec.priority === "HIGH" ? "bg-red-100 text-red-700" : ""}
                        ${rec.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : ""}
                        ${rec.priority === "LOW" ? "bg-green-100 text-green-700" : ""}
                      `}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report */}
          {report && (
            <div className="bg-indigo-50 rounded p-4">
              <h3 className="text-sm font-semibold text-indigo-700 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-700 mb-3">{report.summary}</p>
              {report.key_items && report.key_items.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Key Findings</p>
                  <ul className="list-disc list-inside space-y-1">
                    {report.key_items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.recommendations && report.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Recommendations</p>
                  <ul className="list-disc list-inside space-y-1">
                    {report.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      </div>
    </div>
  )
}


export default ConsentDetail