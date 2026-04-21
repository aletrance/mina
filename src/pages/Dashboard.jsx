import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Truck, CalendarDays, CheckCircle2, Plus, ClipboardPlus } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    activeVehicles: 0,
    weekAssignments: 0,
    availableToday: 0,
    totalAssignments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

        // Active vehicles
        const { count: activeVehicles } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Assignments this week
        const { count: weekAssignments } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .gte('date_from', today)
          .lte('date_from', weekEnd)
          .in('status', ['scheduled', 'in_progress']);

        // Vehicles with active assignment today
        const { data: busyVehicles } = await supabase
          .from('assignments')
          .select('vehicle_id')
          .lte('date_from', today)
          .gte('date_to', today)
          .in('status', ['scheduled', 'in_progress']);

        const busyCount = new Set(busyVehicles?.map(a => a.vehicle_id) || []).size;
        const availableToday = (activeVehicles || 0) - busyCount;

        // Total assignments
        const { count: totalAssignments } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true });

        setStats({
          activeVehicles: activeVehicles || 0,
          weekAssignments: weekAssignments || 0,
          availableToday: Math.max(0, availableToday),
          totalAssignments: totalAssignments || 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <div className="page-header-subtitle">
            Bienvenido, {profile?.full_name || 'Usuario'}
            {profile?.tenants?.name && ` · ${profile.tenants.name}`}
          </div>
        </div>
      </div>

      <div className="page-body animate-fade-in">
        <div className="kpi-grid">
          <div className="kpi-card gold">
            <div className="kpi-card-icon">
              <Truck size={22} />
            </div>
            <div className="kpi-card-label">Vehículos Activos</div>
            <div className="kpi-card-value">
              {loading ? '—' : stats.activeVehicles}
            </div>
          </div>

          <div className="kpi-card blue">
            <div className="kpi-card-icon">
              <CalendarDays size={22} />
            </div>
            <div className="kpi-card-label">Asignaciones esta semana</div>
            <div className="kpi-card-value">
              {loading ? '—' : stats.weekAssignments}
            </div>
          </div>

          <div className="kpi-card green">
            <div className="kpi-card-icon">
              <CheckCircle2 size={22} />
            </div>
            <div className="kpi-card-label">Disponibles hoy</div>
            <div className="kpi-card-value">
              {loading ? '—' : stats.availableToday}
            </div>
          </div>

          <div className="kpi-card orange">
            <div className="kpi-card-icon">
              <ClipboardPlus size={22} />
            </div>
            <div className="kpi-card-label">Total Asignaciones</div>
            <div className="kpi-card-value">
              {loading ? '—' : stats.totalAssignments}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 style={{ marginBottom: 16, fontSize: '1.1rem', fontWeight: 600 }}>Acciones Rápidas</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/vehicles" className="btn btn-primary" id="quick-add-vehicle">
            <Plus size={16} />
            Ver Vehículos
          </Link>
          <Link to="/assignments/new" className="btn btn-secondary" id="quick-new-assignment">
            <ClipboardPlus size={16} />
            Nueva Asignación
          </Link>
          <Link to="/calendar" className="btn btn-secondary" id="quick-calendar">
            <CalendarDays size={16} />
            Ver Calendario
          </Link>
        </div>
      </div>
    </>
  );
}
