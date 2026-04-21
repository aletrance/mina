import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenants } from '../hooks/useTenants';
import { formatDate } from '../lib/utils';
import { Users as UsersIcon, Plus, Edit, Trash2, X, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tenants } = useTenants();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ email: '', full_name: '', role: 'admin', tenant_id: '', password: '' });
  const [saving, setSaving] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*, tenants(name)').order('full_name');
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  function openDialog(user = null) {
    setEditing(user);
    setForm({
      email: user?.email || '',
      full_name: user?.full_name || '',
      role: user?.role || 'admin',
      tenant_id: user?.tenant_id || '',
      password: '',
    });
    setDialogOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('users').update({
          full_name: form.full_name,
          role: form.role,
          tenant_id: form.tenant_id || null,
        }).eq('id', editing.id);
        if (error) throw error;
        toast.success('Usuario actualizado');
      } else {
        // Create auth user first
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: form.email,
          password: form.password,
          email_confirm: true,
        });
        if (authError) throw authError;

        // Create profile
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: form.email,
          full_name: form.full_name,
          role: form.role,
          tenant_id: form.tenant_id || null,
        });
        if (profileError) throw profileError;
        toast.success('Usuario creado');
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    if (!confirm(`¿Eliminar usuario "${user.full_name}"?`)) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', user.id);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast.success('Usuario eliminado');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Usuarios</h2>
          <div className="page-header-subtitle">Administración de usuarios del sistema</div>
        </div>
        <button id="add-user-btn" className="btn btn-primary" onClick={() => openDialog()}>
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      <div className="page-body animate-fade-in">
        <div className="table-container">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <UsersIcon size={48} />
              <p>No hay usuarios registrados</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Empresa</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'super_admin' ? 'badge-camion' : 'badge-auto'}`}>
                        {u.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td>{u.tenants?.name || '—'}</td>
                    <td>
                      <span className={`badge badge-${u.is_active ? 'active' : 'inactive'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => openDialog(u)} title="Editar">
                          <Edit size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(u)} title="Eliminar" style={{ color: 'var(--accent-danger)' }}>
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
        <div className="modal-overlay" onClick={() => setDialogOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setDialogOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input
                    className="form-input"
                    placeholder="Juan Pérez"
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="juan@empresa.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    disabled={!!editing}
                  />
                </div>
                {!editing && (
                  <div className="form-group">
                    <label className="form-label">Contraseña *</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Rol *</label>
                    <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Empresa</label>
                    <select className="form-select" value={form.tenant_id} onChange={e => setForm(p => ({ ...p, tenant_id: e.target.value }))}>
                      <option value="">Sin empresa</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDialogOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : (editing ? 'Guardar' : 'Crear Usuario')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
