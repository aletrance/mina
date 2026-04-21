import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getVehicleTypeLabel, getStatusLabel, formatDate } from '../lib/utils';
import { ArrowLeft, Truck, Calendar, User } from 'lucide-react';

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data: v } = await supabase.from('vehicles').select('*').eq('id', id).single();
        setVehicle(v);

        const { data: a } = await supabase
          .from('assignments')
          .select('*')
          .eq('vehicle_id', id)
          .order('date_from', { ascending: false });
        setAssignments(a || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) {
    return (
      <>
        <div className="page-header"><h2>Cargando...</h2></div>
        <div className="page-body"><div className="loading-center"><div className="spinner" /></div></div>
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <div className="page-header"><h2>Vehículo no encontrado</h2></div>
        <div className="page-body">
          <Link to="/vehicles" className="btn btn-secondary"><ArrowLeft size={16} /> Volver</Link>
        </div>
      </>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const currentAssignment = assignments.find(
    a => a.date_from <= today && a.date_to >= today && ['scheduled', 'in_progress'].includes(a.status)
  );

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/vehicles" className="btn btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
          <div>
            <h2>{vehicle.plate}</h2>
            <div className="page-header-subtitle">
              {getVehicleTypeLabel(vehicle.type)} · {vehicle.brand} {vehicle.model} {vehicle.year || ''}
            </div>
          </div>
        </div>
        <span className={`badge badge-${vehicle.is_active ? 'active' : 'inactive'}`}>
          {vehicle.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="page-body animate-fade-in">
        {/* Vehicle Info Cards */}
        <div className="kpi-grid" style={{ marginBottom: 32 }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="kpi-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-primary)' }}>
              <Truck size={22} />
            </div>
            <div>
              <div className="kpi-card-label">Tipo</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{getVehicleTypeLabel(vehicle.type)}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="kpi-card-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-secondary)' }}>
              <User size={22} />
            </div>
            <div>
              <div className="kpi-card-label">Conductor</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{vehicle.driver_name || 'Sin asignar'}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="kpi-card-icon" style={{ background: currentAssignment ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: currentAssignment ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
              <Calendar size={22} />
            </div>
            <div>
              <div className="kpi-card-label">Estado Actual</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                {currentAssignment ? (
                  <span style={{ color: 'var(--accent-danger)' }}>
                    Ocupado hasta {formatDate(currentAssignment.date_to)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--accent-success)' }}>Disponible</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assignment History */}
        <h3 style={{ marginBottom: 16, fontSize: '1.1rem', fontWeight: 600 }}>Historial de Asignaciones</h3>
        <div className="table-container">
          {assignments.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>Sin asignaciones registradas</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Estado</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id}>
                    <td>{formatDate(a.date_from)}</td>
                    <td>{formatDate(a.date_to)}</td>
                    <td><span className={`badge badge-${a.status}`}>{getStatusLabel(a.status)}</span></td>
                    <td>{a.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
