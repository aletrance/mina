import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useVehicles(tenantId) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('vehicles').select('*').order('plate');
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  async function createVehicle(vehicle) {
    const { data, error } = await supabase.from('vehicles').insert(vehicle).select().single();
    if (error) throw error;
    setVehicles(prev => [...prev, data]);
    return data;
  }

  async function updateVehicle(id, updates) {
    const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setVehicles(prev => prev.map(v => v.id === id ? data : v));
    return data;
  }

  async function deleteVehicle(id) {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) throw error;
    setVehicles(prev => prev.filter(v => v.id !== id));
  }

  return { vehicles, loading, fetchVehicles, createVehicle, updateVehicle, deleteVehicle };
}
