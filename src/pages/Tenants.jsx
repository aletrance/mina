import { useState } from 'react';
import { useTenants } from '../hooks/useTenants';
import { formatDate } from '../lib/utils';
import { Building2, Plus, Edit, Trash2, X, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Tenants() {
  const { tenants, loading, createTenant, updateTenant, deleteTenant } = useTenants();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', location: '' });
  const [saving, setSaving] = useState(false);

  function openDialog(tenant = null) {
    setEditing(tenant);
    setForm({
      name: tenant?.name || '',
      location: tenant?.location || '',
    });
    setDialogOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateTenant(editing.id, form);
        toast.success('Empresa actualizada');
      } else {
        await createTenant(form);
        toast.success('Empresa creada');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tenant) {
    if (!confirm(`¿Eliminar empresa "${tenant.name}"?`)) return;
    try {
      await deleteTenant(tenant.id);
      toast.success('Empresa eliminada');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Empresas</h2>
          <div className="page-header-subtitle">Gestión de tenants / empresas mineras</div>
        </div>
        <button id="add-tenant-btn" className="btn btn-primary" onClick={() => openDialog()}>
          <Plus size={16} /> Nueva Empresa
        </button>
      </div>

      <div className="page-body animate-fade-in">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tenants.length === 0 ? (
          <div className="card empty-state">
            <Building2 size={48} />
            <p>No hay empresas registradas</p>
            <button className="btn btn-primary btn-sm" onClick={() => openDialog()}>
              <Plus size={14} /> Crear Empresa
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {tenants.map(t => (
              <div key={t.id} className="card">
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{t.name}</div>
                      {t.location && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} /> {t.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => openDialog(t)} title="Editar">
                      <Edit size={15} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(t)} title="Eliminar" style={{ color: 'var(--accent-danger)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Creado: {formatDate(t.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {dialogOpen && (
        <div className="modal-overlay" onClick={() => setDialogOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setDialogOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    id="tenant-name"
                    className="form-input"
                    placeholder="Minera del Sur S.A."
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ubicación</label>
                  <input
                    className="form-input"
                    placeholder="San Juan, Argentina"
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDialogOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : (editing ? 'Guardar' : 'Crear Empresa')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
