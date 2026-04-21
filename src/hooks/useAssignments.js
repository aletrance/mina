import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAssignments(tenantId) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('assignments')
        .select('*, vehicles(plate, type, brand, model)')
        .order('date_from', { ascending: false });
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  async function createAssignment(assignment) {
    const { data, error } = await supabase.from('assignments').insert(assignment).select('*, vehicles(plate, type, brand, model)').single();
    if (error) throw error;
    setAssignments(prev => [data, ...prev]);
    return data;
  }

  async function updateAssignment(id, updates) {
    const { data, error } = await supabase.from('assignments').update(updates).eq('id', id).select('*, vehicles(plate, type, brand, model)').single();
    if (error) throw error;
    setAssignments(prev => prev.map(a => a.id === id ? data : a));
    return data;
  }

  async function checkOverlap(vehicleId, dateFrom, dateTo, excludeId = null) {
    let query = supabase
      .from('assignments')
      .select('id, date_from, date_to, status')
      .eq('vehicle_id', vehicleId)
      .in('status', ['scheduled', 'in_progress'])
      .lt('date_from', dateTo)
      .gt('date_to', dateFrom);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function getVehicleAssignments(vehicleId) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .in('status', ['scheduled', 'in_progress'])
      .order('date_from');
    if (error) throw error;
    return data || [];
  }

  return {
    assignments,
    loading,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    checkOverlap,
    getVehicleAssignments,
  };
}
