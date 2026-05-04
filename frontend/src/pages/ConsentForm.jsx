import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../services/api"

function ConsentForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    dataPrincipalId: "",
    dataPrincipalName: "",
    dataPrincipalEmail: "",
    dataFiduciaryId: "",
    dataFiduciaryName: "",
    purpose: "",
    dataCategories: "",
    consentStatus: "PENDING",
    consentDate: "",
    expiryDate: "",
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingRecord, setLoadingRecord] = useState(false)

  useEffect(() => {
    if (isEditing) {
      setLoadingRecord(true)
      api.get(`/consent-records/${id}`)
        .then((res) => {
          const r = res.data
          setFormData({
            dataPrincipalId: r.dataPrincipalId || "",
            dataPrincipalName: r.dataPrincipalName || "",
            dataPrincipalEmail: r.dataPrincipalEmail || "",
            dataFiduciaryId: r.dataFiduciaryId || "",
            dataFiduciaryName: r.dataFiduciaryName || "",
            purpose: r.purpose || "",
            dataCategories: r.dataCategories || "",
            consentStatus: r.consentStatus || "PENDING",
            consentDate: r.consentDate ? r.consentDate.slice(0, 10) : "",
            expiryDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "",
          })
          setLoadingRecord(false)
        })
        .catch(() => {
          alert("Could not load record for editing.")
          setLoadingRecord(false)
        })
    }
  }, [id, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.dataPrincipalId.trim())
      newErrors.dataPrincipalId = "Principal ID is required"

    if (!formData.dataPrincipalName.trim())
      newErrors.dataPrincipalName = "Principal Name is required"

    if (!formData.dataPrincipalEmail.trim()) {
      newErrors.dataPrincipalEmail = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.dataPrincipalEmail)) {
      newErrors.dataPrincipalEmail = "Enter a valid email address"
    }

    if (!formData.dataFiduciaryId.trim())
      newErrors.dataFiduciaryId = "Fiduciary ID is required"

    if (!formData.dataFiduciaryName.trim())
      newErrors.dataFiduciaryName = "Fiduciary Name is required"

    if (!formData.purpose.trim())
      newErrors.purpose = "Purpose is required"

    if (!formData.dataCategories.trim())
      newErrors.dataCategories = "Data Categories is required"

    if (
      formData.consentDate &&
      formData.expiryDate &&
      formData.expiryDate < formData.consentDate
    ) {
      newErrors.expiryDate = "Expiry date cannot be before consent date"
    }

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)

    // convert date strings to LocalDateTime format for backend
    const payload = {
      ...formData,
      consentDate: formData.consentDate ? formData.consentDate + "T00:00:00" : null,
      expiryDate: formData.expiryDate ? formData.expiryDate + "T00:00:00" : null,
    }

    const request = isEditing
      ? api.put(`/consent-records/${id}`, payload)
      : api.post("/consent-records", payload)

    request
      .then(() => {
        navigate("/")
      })
      .catch(() => {
        alert("Failed to save record. Please try again.")
        setSubmitting(false)
      })
  }

  if (loadingRecord) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading record...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? "Edit Consent Record" : "Create Consent Record"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Data Principal (Citizen)
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Principal ID *
          </label>
          <input
            type="text"
            name="dataPrincipalId"
            value={formData.dataPrincipalId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. CUST-001"
          />
          {errors.dataPrincipalId && (
            <p className="text-red-500 text-xs mt-1">{errors.dataPrincipalId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Principal Name *
          </label>
          <input
            type="text"
            name="dataPrincipalName"
            value={formData.dataPrincipalName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Rahul Sharma"
          />
          {errors.dataPrincipalName && (
            <p className="text-red-500 text-xs mt-1">{errors.dataPrincipalName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Principal Email *
          </label>
          <input
            type="text"
            name="dataPrincipalEmail"
            value={formData.dataPrincipalEmail}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. rahul@example.com"
          />
          {errors.dataPrincipalEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.dataPrincipalEmail}</p>
          )}
        </div>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-4">
          Data Fiduciary (Organisation)
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fiduciary ID *
          </label>
          <input
            type="text"
            name="dataFiduciaryId"
            value={formData.dataFiduciaryId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. ORG-101"
          />
          {errors.dataFiduciaryId && (
            <p className="text-red-500 text-xs mt-1">{errors.dataFiduciaryId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fiduciary Name *
          </label>
          <input
            type="text"
            name="dataFiduciaryName"
            value={formData.dataFiduciaryName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. HDFC Bank"
          />
          {errors.dataFiduciaryName && (
            <p className="text-red-500 text-xs mt-1">{errors.dataFiduciaryName}</p>
          )}
        </div>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-4">
          Consent Details
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose *
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Credit score assessment and loan processing"
          />
          {errors.purpose && (
            <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Categories *
          </label>
          <input
            type="text"
            name="dataCategories"
            value={formData.dataCategories}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Financial data, Identity documents"
          />
          {errors.dataCategories && (
            <p className="text-red-500 text-xs mt-1">{errors.dataCategories}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consent Status
          </label>
          <select
            name="consentStatus"
            value={formData.consentStatus}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PENDING">PENDING</option>
            <option value="GRANTED">GRANTED</option>
            <option value="REVOKED">REVOKED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consent Date
            </label>
            <input
              type="date"
              name="consentDate"
              value={formData.consentDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEditing ? "Update Record" : "Create Record"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="border px-6 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}

export default ConsentForm