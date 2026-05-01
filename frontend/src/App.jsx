import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ConsentList from "./pages/ConsentList"
import ConsentForm from "./pages/ConsentForm"
import ConsentDetail from "./pages/ConsentDetail"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Analytics from "./pages/Analytics"

function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="bg-white shadow px-4 py-3">
      <div className="flex justify-between items-center">
        <h1
          className="text-lg font-bold text-blue-800 cursor-pointer"
          onClick={() => navigate("/")}
        >
          DPDP Act
        </h1>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {user && (
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs text-gray-600 hover:text-blue-700 font-medium px-2 py-1"
            >
              Dashboard
            </button>
          )}
          {user && (
            <button
              onClick={() => navigate("/analytics")}
              className="text-xs text-gray-600 hover:text-blue-700 font-medium px-2 py-1"
            >
              Analytics
            </button>
          )}
          {user && (
            <span className="text-xs text-gray-500 hidden md:inline">
              Welcome, {user.username}
            </span>
          )}
          {user && (
            <button
              onClick={() => navigate("/create")}
              className="bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-800"
            >
              + New
            </button>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="border px-3 py-1.5 rounded text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto mt-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ConsentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <ConsentForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <ConsentForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/detail/:id"
                element={
                  <ProtectedRoute>
                    <ConsentDetail />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App