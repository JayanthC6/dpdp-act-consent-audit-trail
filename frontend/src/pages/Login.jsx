import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = (e) => {
  e.preventDefault()

  if (!formData.username.trim() || !formData.password.trim()) {
    setError("Username and password are required")
    return
  }

  setLoading(true)

  api.post("/auth/login", formData)
    .then((res) => {
      login(res.data.token, res.data.username)
      navigate("/")
    })
    .catch(() => {
      setError("Invalid username or password. Please try again.")
      setLoading(false)
    })
}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-md">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-800">
            DPDP Act
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Consent Audit Trail — Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <p className="text-xs text-gray-400 mt-6 text-center">
          DPDP Act 2023 — Consent Management System
        </p>
      </div>
    </div>
  )
}

export default Login