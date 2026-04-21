import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../hooks/useVehicles';
import { useAssignments } from '../hooks/useAssignments';
import { getVehicleTypeLabel, formatDate } from '../lib/utils';
import { AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewAssignment() {
  const { profile } = useAuth();
  const { vehicles, loading: vehiclesLoading } = useVehicles(profile?.tenant_id);
  const { createAssignment, checkOverlap, getVehicleAssignments } = useAssignments(profile?.tenant_id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    vehicle_id: '',
    date_from: '',
    date_to: '',
    notes: '',
  });
  const [conflicts, setConflicts] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load blocked dates when vehicle is selected
  useEffect(() => {
    if (form.vehicle_id) {
      getVehicleAssignments(form.vehicle_id).then(data => {
        setBlockedDates(data);
      });
    } else {
      setBlockedDates([]);
    }
  }, [form.vehicle_id]);

  // Check overlap when dates change
  useEffect(() => {
    if (form.vehicle_id && form.date_from && form.date_to) {
      setChecking(true);
      checkOverlap(form.vehicle_id, form.date_from, form.date_to).then(data => {
        setConflicts(data);
        setChecking(false);
      });
    } else {
      setConflicts([]);
    }
  }, [form.vehicle_id, form.date_from, form.date_to]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (conflicts.length > 0) {
      toast.error('No se puede crear: existe conflicto de fechas');
      return;
    }
    setSaving(true);
    try {
      await createAssignment({
        vehicle_id: form.vehicle_id,
        date_from: form.date_from,
        date_to: form.date_to,
        notes: form.notes || null,
        created_by: profile?.id,
      });
      toast.success('Asignación creada exitosamente');
      navigate('/calendar');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const activeVehicles = vehicles.filter(v => v.is_active);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Nueva Asignación</h2>
          <div className="page-header-subtitle">Asignar vehículo a un período de fechas</div>
        </div>
      </div>

      <div className="page-body animate-fade-in">
        <div style={{ maxWidth: 640 }}>
          <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
            <div className="form-group">
              <label className="form-label">Vehículo *</label>
              <select
                id="assignment-vehicle"
                name="vehicle_id"
                className="form-select"
                value={form.vehicle_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar vehículo...</option>
                {activeVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.plate} — {getVehicleTypeLabel(v.type)} {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha Desde *</label>
                <input
                  id="assignment-date-from"
                  type="date"
                  name="date_from"
                  className="form-input"
                  value={form.date_from}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha Hasta *</label>
                <input
                  id="assignment-date-to"
                  type="date"
                  name="date_to"
                  className="form-input"
                  value={form.date_to}
                  onChange={handleChange}
                  required
                  min={form.date_from || undefined}
                />
              </div>
            </div>

            {/* Blocked dates info */}
            {blockedDates.length > 0 && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                marginBottom: 20,
                fontSize: '0.82rem',
              }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} /> Fechas ocupadas para este vehículo:
                </div>
                {blockedDates.map(b => (
                  <div key={b.id} style={{ color: 'var(--text-secondary)', marginLeft: 20 }}>
                    • {formatDate(b.date_from)} — {formatDate(b.date_to)}
                  </div>
                ))}
              </div>
            )}

            {/* Conflict warning */}
            {conflicts.length > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                marginBottom: 20,
                fontSize: '0.85rem',
                color: '#F87171',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <AlertTriangle size={16} />
                <strong>¡Conflicto!</strong> Las fechas seleccionadas se superponen con una asignación existente.
              </div>
            )}

            {/* No conflict badge */}
            {form.vehicle_id && form.date_from && form.date_to && conflicts.length === 0 && !checking && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                marginBottom: 20,
                fontSize: '0.85rem',
                color: '#4ADE80',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <CheckCircle2 size={16} />
                <strong>Disponible.</strong> No hay conflictos con otras asignaciones.
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notas</label>
              <textarea
                id="assignment-notes"
                name="notes"
                className="form-textarea"
                placeholder="Notas opcionales sobre la asignación..."
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button
                id="assignment-submit"
                type="submit"
                className="btn btn-primary"
                disabled={saving || conflicts.length > 0 || !form.vehicle_id || !form.date_from || !form.date_to}
              >
                <ClipboardList size={16} />
                {saving ? 'Creando...' : 'Crear Asignación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
