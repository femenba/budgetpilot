import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Dashboard    from './pages/Dashboard'
import AuthCallback from './pages/AuthCallback'
import AddIncome    from './pages/AddIncome'
import AddExpense   from './pages/AddExpense'
import Transactions from './pages/Transactions'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login"    element={<Login />}    />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Legacy redirect */}
          <Route path="/auth" element={<Navigate to="/login" replace />} />

          {/* Protected app */}
          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/income/add" element={
            <ProtectedRoute><AddIncome /></ProtectedRoute>
          } />
          <Route path="/expense/add" element={
            <ProtectedRoute><AddExpense /></ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute><Transactions /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
