import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddVehicleDialog({ vehicle, onSave, onClose }) {
  const [form, setForm] = useState({
    plate: vehicle?.plate || '',
    type: vehicle?.type || 'auto',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    driver_name: vehicle?.driver_name || '',
    is_active: vehicle?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      year: form.year ? parseInt(form.year) : null,
    });
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Patente *</label>
                <input
                  id="vehicle-plate"
                  name="plate"
                  className="form-input"
                  placeholder="ABC 123"
                  value={form.plate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo *</label>
                <select id="vehicle-type" name="type" className="form-select" value={form.type} onChange={handleChange}>
                  <option value="auto">Auto</option>
                  <option value="camioneta">Camioneta</option>
                  <option value="camion">Camión</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Marca</label>
                <input name="brand" className="form-input" placeholder="Toyota" value={form.brand} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Modelo</label>
                <input name="model" className="form-input" placeholder="Hilux" value={form.model} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Año</label>
                <input name="year" type="number" className="form-input" placeholder="2024" value={form.year} onChange={handleChange} min="1990" max="2030" />
              </div>
              <div className="form-group">
                <label className="form-label">Conductor</label>
                <input name="driver_name" className="form-input" placeholder="Juan Pérez" value={form.driver_name} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                Vehículo activo
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : (vehicle ? 'Guardar Cambios' : 'Crear Vehículo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
