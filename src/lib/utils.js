import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getVehicleTypeLabel(type) {
  const labels = {
    auto: 'Auto',
    camioneta: 'Camioneta',
    camion: 'Camión',
  };
  return labels[type] || type;
}

export function getStatusLabel(status) {
  const labels = {
    scheduled: 'Programado',
    in_progress: 'En curso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
}

export function getStatusColor(status) {
  const colors = {
    scheduled: '#3B82F6',
    in_progress: '#F59E0B',
    completed: '#22C55E',
    cancelled: '#EF4444',
  };
  return colors[status] || '#6B7280';
}

export function getVehicleTypeColor(type) {
  const colors = {
    auto: '#3B82F6',
    camioneta: '#22C55E',
    camion: '#F97316',
  };
  return colors[type] || '#6B7280';
}
