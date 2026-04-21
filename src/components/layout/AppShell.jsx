import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  CalendarDays,
  ClipboardList,
  Building2,
  Users,
  LogOut,
  Menu,
  X,
  HardHat,
} from 'lucide-react';

export default function AppShell() {
  const { profile, signOut, isSuperAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 35, display: 'none',
          }}
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <HardHat size={22} color="#0B0F19" />
          </div>
          <div>
            <h1>MineFleet</h1>
            <span>Gestión de Vehículos</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Principal</div>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink to="/vehicles" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <Truck size={18} />
              Vehículos
            </NavLink>
            <NavLink to="/assignments/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <ClipboardList size={18} />
              Nueva Asignación
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <CalendarDays size={18} />
              Calendario
            </NavLink>
          </div>

          {isSuperAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Administración</div>
              <NavLink to="/tenants" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <Building2 size={18} />
                Empresas
              </NavLink>
              <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <Users size={18} />
                Usuarios
              </NavLink>
            </div>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.full_name || 'Usuario'}</div>
            <div className="sidebar-user-role">
              {profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              {profile?.tenants?.name && ` · ${profile.tenants.name}`}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile menu button in header */}
        <div style={{ display: 'none' }} className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
