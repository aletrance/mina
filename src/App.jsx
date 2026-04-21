import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import NewAssignment from './pages/NewAssignment';
import CalendarPage from './pages/Calendar';
import Tenants from './pages/Tenants';
import UsersPage from './pages/Users';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A2036',
              color: '#F1F5F9',
              border: '1px solid #1E293B',
              borderRadius: '10px',
              fontSize: '0.85rem',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#0B0F19' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#0B0F19' },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="vehicles/:id" element={<VehicleDetail />} />
            <Route path="assignments/new" element={<NewAssignment />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tenants" element={
              <ProtectedRoute requireSuperAdmin>
                <Tenants />
              </ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute requireSuperAdmin>
                <UsersPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
