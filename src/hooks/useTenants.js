import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('tenants').select('*').order('name');
      if (error) throw error;
      setTenants(data || []);
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  async function createTenant(tenant) {
    const { data, error } = await supabase.from('tenants').insert(tenant).select().single();
    if (error) throw error;
    setTenants(prev => [...prev, data]);
    return data;
  }

  async function updateTenant(id, updates) {
    const { data, error } = await supabase.from('tenants').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setTenants(prev => prev.map(t => t.id === id ? data : t));
    return data;
  }

  async function deleteTenant(id) {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) throw error;
    setTenants(prev => prev.filter(t => t.id !== id));
  }

  return { tenants, loading, fetchTenants, createTenant, updateTenant, deleteTenant };
}
