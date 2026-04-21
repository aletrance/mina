import { useState, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../hooks/useAssignments';
import { getVehicleTypeLabel, getVehicleTypeColor, getStatusLabel, formatDate } from '../lib/utils';
import { X, Truck, Calendar } from 'lucide-react';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Sin asignaciones en este período',
  showMore: (total) => `+${total} más`,
};

export default function CalendarPage() {
  const { profile } = useAuth();
  const { assignments, loading } = useAssignments(profile?.tenant_id);
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = useMemo(() => {
    return assignments
      .filter(a => {
        if (typeFilter && a.vehicles?.type !== typeFilter) return false;
        return ['scheduled', 'in_progress'].includes(a.status);
      })
      .map(a => ({
        id: a.id,
        title: `${a.vehicles?.plate || '?'} — ${getVehicleTypeLabel(a.vehicles?.type)}`,
        start: new Date(a.date_from + 'T00:00:00'),
        end: new Date(a.date_to + 'T23:59:59'),
        allDay: true,
        resource: a,
        color: getVehicleTypeColor(a.vehicles?.type),
      }));
  }, [assignments, typeFilter]);

  const eventStyleGetter = useCallback((event) => ({
    style: {
      backgroundColor: event.color,
      border: 'none',
      borderRadius: '4px',
      color: '#fff',
      fontSize: '0.75rem',
      fontWeight: 500,
      padding: '2px 6px',
    },
  }), []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event.resource);
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Calendario</h2>
          <div className="page-header-subtitle">Vista de asignaciones por fecha</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select
            id="calendar-type-filter"
            className="form-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="">Todos los tipos</option>
            <option value="auto">🔵 Auto</option>
            <option value="camioneta">🟢 Camioneta</option>
            <option value="camion">🟠 Camión</option>
          </select>
        </div>
      </div>

      <div className="page-body animate-fade-in">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div style={{ height: 650 }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              views={['month', 'week']}
              defaultView="month"
              messages={messages}
              culture="es"
              popup
            />
          </div>
        )}

        {/* Legend */}
        <div style={{
          display: 'flex', gap: 20, marginTop: 20, padding: '12px 16px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)', fontSize: '0.8rem',
          color: 'var(--text-secondary)', alignItems: 'center',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Leyenda:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#3B82F6' }} /> Auto
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#22C55E' }} /> Camioneta
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#F97316' }} /> Camión
          </span>
        </div>
      </div>

      {/* Event Detail Dialog */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={18} /> Detalle de Asignación
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedEvent(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <div className="form-label">Vehículo</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {selectedEvent.vehicles?.plate} — {selectedEvent.vehicles?.brand} {selectedEvent.vehicles?.model}
                  </div>
                </div>
                <div>
                  <div className="form-label">Tipo</div>
                  <span className={`badge badge-${selectedEvent.vehicles?.type}`}>
                    {getVehicleTypeLabel(selectedEvent.vehicles?.type)}
                  </span>
                </div>
                <div className="form-row">
                  <div>
                    <div className="form-label">Desde</div>
                    <div style={{ fontWeight: 500 }}>{formatDate(selectedEvent.date_from)}</div>
                  </div>
                  <div>
                    <div className="form-label">Hasta</div>
                    <div style={{ fontWeight: 500 }}>{formatDate(selectedEvent.date_to)}</div>
                  </div>
                </div>
                <div>
                  <div className="form-label">Estado</div>
                  <span className={`badge badge-${selectedEvent.status}`}>
                    {getStatusLabel(selectedEvent.status)}
                  </span>
                </div>
                {selectedEvent.notes && (
                  <div>
                    <div className="form-label">Notas</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedEvent.notes}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
