import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import './EventScheduler.css';

const CATEGORY_DEFINITIONS = [
  { key: 'work', label: 'Work', color: '#1976d2' },      // primary
  { key: 'personal', label: 'Personal', color: '#43a047' }, // secondary
  { key: 'deadline', label: 'Deadline', color: '#d32f2f' }, // accent
];

// Helper for getting color by category key
const getCategoryColor = (catKey) =>
  (CATEGORY_DEFINITIONS.find(cat => cat.key === catKey) || {}).color || '#6c757d';

function getInitialEvents() {
  // Seed example events (could be empty initially)
  return [
    {
      id: String(Date.now()),
      title: 'Work Meeting',
      start: new Date().toISOString().slice(0, 10),
      end: new Date().toISOString().slice(0, 10),
      category: 'work',
    },
    {
      id: String(Date.now() + 1),
      title: 'Dinner with Family',
      start: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      end: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      category: 'personal',
    },
    {
      id: String(Date.now() + 2),
      title: 'Project Deadline',
      start: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      end: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      category: 'deadline',
    },
  ];
}

// PUBLIC_INTERFACE
const EventScheduler = () => {
  // State
  const [events, setEvents] = useState(getInitialEvents());
  const [filter, setFilter] = useState({
    work: true,
    personal: true,
    deadline: true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogEvent, setDialogEvent] = useState(null);

  // Open dialog for create/new event via calendar date click
  const handleDateSelect = (selectInfo) => {
    setDialogEvent({
      id: undefined,
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr || selectInfo.startStr,
      category: CATEGORY_DEFINITIONS[0].key,
    });
    setDialogOpen(true);
  };

  // Open dialog for editing event
  const handleEventClick = (clickInfo) => {
    setDialogEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr || clickInfo.event.startStr,
      category: clickInfo.event.extendedProps.category || CATEGORY_DEFINITIONS[0].key,
    });
    setDialogOpen(true);
  };

  // Handle category filter toggle
  const handleFilterChange = (catKey) => {
    setFilter(f => ({
      ...f,
      [catKey]: !f[catKey]
    }));
  };

  // Handle dialog close
  const closeDialog = () => {
    setDialogOpen(false);
    setDialogEvent(null);
  };

  // Save or Update event
  const handleDialogSave = () => {
    if (!dialogEvent.title || !dialogEvent.start || !dialogEvent.category) {
      return;
    }
    setEvents(evts => {
      if (dialogEvent.id) {
        // Update existing
        return evts.map(ev =>
          ev.id === dialogEvent.id ? { ...dialogEvent } : ev
        );
      } else {
        // New event
        return [
          ...evts,
          {
            ...dialogEvent,
            id: Date.now().toString(),
          },
        ];
      }
    });
    closeDialog();
  };

  // Delete event
  const handleDialogDelete = () => {
    setEvents(evts =>
      evts.filter(ev => ev.id !== dialogEvent.id)
    );
    closeDialog();
  };

  // Show the "New Task" modal (empty task, defaults to today, first category)
  const showNewTaskDialog = () => {
    // Today date for input[type=date]
    const todayISO = new Date().toISOString().slice(0, 10);
    setDialogEvent({
      id: undefined,
      title: '',
      start: todayISO,
      end: todayISO,
      category: CATEGORY_DEFINITIONS[0].key,
    });
    setDialogOpen(true);
  };

  // Only show filtered events
  const filteredEvents = events.filter(e => filter[e.category]);

  // Custom event content - colored via category, with truncation and prevented overflow
  function renderEventContent(eventInfo) {
    const cat = CATEGORY_DEFINITIONS.find(c => c.key === eventInfo.event.extendedProps.category);
    return (
      <div
        className="fc-event-content-wrapper scheduler-event-contained"
        style={{
          borderLeft: `6px solid ${cat ? cat.color : '#444'}`,
          background: 'inherit',
        }}
        title={eventInfo.event.title}
      >
        <span className="fc-event-title-text">
          {eventInfo.event.title}
        </span>
      </div>
    );
  }

  return (
    <div className="scheduler-root">
      <h2 className="scheduler-title">Event Scheduler</h2>
      <div className="scheduler-top-panel" style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '26px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="scheduler-filter">
            <span className="panel-label">Show:</span>
            {CATEGORY_DEFINITIONS.map(cat => (
              <label
                key={cat.key}
                className="filter-checkbox"
                style={{ '--cat-color': cat.color }}
              >
                <input
                  type="checkbox"
                  checked={filter[cat.key]}
                  onChange={() => handleFilterChange(cat.key)}
                  style={{ accentColor: cat.color }}
                />{' '}
                <span className="cat-dot" style={{ background: cat.color }}></span>
                {cat.label}
              </label>
            ))}
          </div>
          <div className="scheduler-legend">
            <span className="panel-label">Legend:</span>
            {CATEGORY_DEFINITIONS.map(cat => (
              <span key={cat.key} className="legend-item">
                <span
                  className="legend-color"
                  style={{ background: cat.color }}
                ></span>
                {cat.label}
              </span>
            ))}
          </div>
        </div>
        <button
          className="btn btn-large btn-new-task"
          style={{
            background: '#f7ac35', color: '#25323e', fontWeight: 600, borderRadius: 5, marginBottom: 4, minWidth: 120
          }}
          type="button"
          onClick={showNewTaskDialog}
        >
          + New Task
        </button>
      </div>
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay',
          }}
          initialView="dayGridMonth"
          themeSystem="standard"
          selectable={true}
          select={handleDateSelect}
          events={filteredEvents.map(evt => ({
            ...evt,
            backgroundColor: getCategoryColor(evt.category),
            borderColor: getCategoryColor(evt.category),
            textColor: '#fff',
          }))}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height={600}
        />
      </div>
      {/* Dialog Modal */}
      {dialogOpen && (
        <div className="modal-overlay" onClick={closeDialog}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>
              {dialogEvent.id
                ? 'Edit Event'
                : 'New Task'}
            </h3>
            <div className="form-group">
              <label>
                Task Name
                <input
                  type="text"
                  value={dialogEvent.title}
                  onChange={e => setDialogEvent(ev => ({ ...ev, title: e.target.value }))}
                  autoFocus
                  placeholder="Enter task name"
                />
              </label>
            </div>
            <div className="form-group half">
              <label>
                Date
                <input
                  type="date"
                  value={dialogEvent.start}
                  onChange={e => setDialogEvent(ev => ({ ...ev, start: e.target.value, end: e.target.value }))}
                />
              </label>
              <label>
                Category
                <select
                  value={dialogEvent.category}
                  onChange={e => setDialogEvent(ev => ({ ...ev, category: e.target.value }))}
                >
                  {CATEGORY_DEFINITIONS.map(cat => (
                    <option value={cat.key} key={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              {dialogEvent.id && (
                <button className="btn danger" onClick={handleDialogDelete} title="Delete Event">
                  Delete
                </button>
              )}
              <button className="btn" onClick={closeDialog}>Cancel</button>
              <button
                className="btn primary"
                onClick={handleDialogSave}
                disabled={!dialogEvent.title || !dialogEvent.start || !dialogEvent.category}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventScheduler;
