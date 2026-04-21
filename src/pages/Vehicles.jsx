import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../hooks/useVehicles';
import { getVehicleTypeLabel } from '../lib/utils';
import { Plus, Truck, Search, Eye, Edit, Trash2 } from 'lucide-react';
import AddVehicleDialog from '../components/vehicles/AddVehicleDialog';
import toast from 'react-hot-toast';

export default function Vehicles() {
  const { profile } = useAuth();
  const { vehicles, loading, createVehicle, updateVehicle, deleteVehicle } = useVehicles(profile?.tenant_id);
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('active');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const filtered = vehicles.filter(v => {
    if (typeFilter && v.type !== typeFilter) return false;
    if (activeFilter === 'active' && !v.is_active) return false;
    if (activeFilter === 'inactive' && v.is_active) return false;
    if (search) {
      const q = search.toLowerCase();
      return v.plate.toLowerCase().includes(q) ||
        v.brand?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q) ||
        v.driver_name?.toLowerCase().includes(q);
    }
    return true;
  });

  function handleEdit(vehicle) {
    setEditingVehicle(vehicle);
    setDialogOpen(true);
  }

  async function handleDelete(vehicle) {
    if (!confirm(`¿Eliminar vehículo ${vehicle.plate}?`)) return;
    try {
      await deleteVehicle(vehicle.id);
      toast.success('Vehículo eliminado');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleSave(data) {
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, data);
        toast.success('Vehículo actualizado');
      } else {
        await createVehicle({ ...data, tenant_id: profile?.tenant_id });
        toast.success('Vehículo creado');
      }
      setDialogOpen(false);
      setEditingVehicle(null);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Vehículos</h2>
          <div className="page-header-subtitle">Gestión de flota vehicular</div>
        </div>
        <button
          id="add-vehicle-btn"
          className="btn btn-primary"
          onClick={() => { setEditingVehicle(null); setDialogOpen(true); }}
        >
          <Plus size={16} />
          Agregar Vehículo
        </button>
      </div>

      <div className="page-body animate-fade-in">
        <div className="table-container">
          <div className="table-toolbar">
            <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="vehicle-search"
                className="form-input"
                style={{ paddingLeft: 36, width: '100%' }}
                placeholder="Buscar patente, marca..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select id="vehicle-type-filter" className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="auto">Auto</option>
              <option value="camioneta">Camioneta</option>
              <option value="camion">Camión</option>
            </select>
            <select id="vehicle-active-filter" className="form-select" value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Truck size={48} />
              <p>No se encontraron vehículos</p>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingVehicle(null); setDialogOpen(true); }}>
                <Plus size={14} /> Agregar Vehículo
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Patente</th>
                  <th>Tipo</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Año</th>
                  <th>Conductor</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.plate}</td>
                    <td><span className={`badge badge-${v.type}`}>{getVehicleTypeLabel(v.type)}</span></td>
                    <td>{v.brand || '—'}</td>
                    <td>{v.model || '—'}</td>
                    <td>{v.year || '—'}</td>
                    <td>{v.driver_name || '—'}</td>
                    <td>
                      <span className={`badge badge-${v.is_active ? 'active' : 'inactive'}`}>
                        {v.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to={`/vehicles/${v.id}`} className="btn btn-ghost btn-icon" title="Ver detalle">
                          <Eye size={15} />
                        </Link>
                        <button className="btn btn-ghost btn-icon" onClick={() => handleEdit(v)} title="Editar">
                          <Edit size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(v)} title="Eliminar" style={{ color: 'var(--accent-danger)' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {dialogOpen && (
        <AddVehicleDialog
          vehicle={editingVehicle}
          onSave={handleSave}
          onClose={() => { setDialogOpen(false); setEditingVehicle(null); }}
        />
      )}
    </>
  );
}
