import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './EventScheduler.css';

// PUBLIC_INTERFACE
/**
 * Main container for the Color-Coded Event Scheduler.
 * Features: Color-coded categories, category filtering, category legend,
 * event dialog for creation/editing with category selection.
 * Category colors (dark theme):
 *   - Work:      #1976d2 (Blue)
 *   - Personal:  #43a047 (Green)
 *   - Deadline:  #d32f2f (Red)
 */

const CATEGORY_CONFIG = [
  { label: 'Work',     value: 'work',     color: '#1976d2' },
  { label: 'Personal', value: 'personal', color: '#43a047' },
  { label: 'Deadline', value: 'deadline', color: '#d32f2f' }
];

const CATEGORY_COLOR_MAP = CATEGORY_CONFIG.reduce((acc, entry) => {
  acc[entry.value] = entry.color;
  return acc;
}, {});

function getCategoryColor(category) {
  return CATEGORY_COLOR_MAP[category] || '#ffffff';
}

const INITIAL_EVENTS = [
  {
    id: '1',
    title: 'Project Kickoff',
    start: new Date().toISOString().substr(0, 10),
    category: 'work'
  },
  {
    id: '2',
    title: 'Family Dinner',
    start: new Date(Date.now() + 24*60*60*1000).toISOString().substr(0, 10),
    category: 'personal'
  },
  {
    id: '3',
    title: 'Submit Tax Forms',
    start: new Date(Date.now() + 2*24*60*60*1000).toISOString().substr(0, 10),
    category: 'deadline'
  }
];

export default function EventScheduler() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [filterCategories, setFilterCategories] = useState(CATEGORY_CONFIG.map(c => c.value));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogEvent, setDialogEvent] = useState(null); // null or { id, title, start, category }
  const calendarRef = useRef();

  // PUBLIC_INTERFACE
  function handleDateClick(info) {
    setDialogEvent({
      id: null, // new event
      title: '',
      start: info.dateStr,
      category: CATEGORY_CONFIG[0].value
    });
    setDialogOpen(true);
  }

  // PUBLIC_INTERFACE
  function handleEventClick(info) {
    const { id, title, start, extendedProps } = info.event;
    setDialogEvent({
      id,
      title,
      start: start.toISOString().substr(0, 10),
      category: extendedProps.category
    });
    setDialogOpen(true);
  }

  // PUBLIC_INTERFACE
  function handleDialogClose() {
    setDialogOpen(false);
    setDialogEvent(null);
  }

  // PUBLIC_INTERFACE
  function handleDialogSave(evt) {
    evt.preventDefault();
    const form = evt.target;
    const id = dialogEvent.id || Date.now().toString();
    const newEvent = {
      id,
      title: form.title.value,
      start: form.start.value,
      category: form.category.value
    };
    setEvents(prev => {
      // update if editing, add if new
      const exists = prev.find(e => e.id === id);
      if (exists) {
        return prev.map(e => e.id === id ? newEvent : e);
      } else {
        return [...prev, newEvent];
      }
    });
    handleDialogClose();
  }

  // PUBLIC_INTERFACE
  function handleEventDelete() {
    if (!dialogEvent || !dialogEvent.id) return;
    setEvents(prev => prev.filter(e => e.id !== dialogEvent.id));
    handleDialogClose();
  }

  // PUBLIC_INTERFACE
  function handleFilterChange(category) {
    setFilterCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }

  // PUBLIC_INTERFACE
  function getFilteredEvents() {
    return events.filter(e => filterCategories.includes(e.category));
  }

  // For calendar rendering: assign correct color style
  function eventContentRender(arg) {
    // arg.event.extendedProps.category
    const category = arg.event.extendedProps.category;
    const color = getCategoryColor(category);
    return (
      <div title={arg.event.title} style={{
        borderLeft: `5px solid ${color}`,
        paddingLeft: 6
      }}>
        <b>{arg.timeText}</b> {arg.event.title}
      </div>
    );
  }

  // Handler for opening the Add Task dialog with default values
  // PUBLIC_INTERFACE
  function handleAddTaskClick() {
    const todayStr = new Date().toISOString().substr(0, 10);
    setDialogEvent({
      id: null,
      title: '',
      start: todayStr,
      category: CATEGORY_CONFIG[0].value
    });
    setDialogOpen(true);
  }

  return (
    <div className="scheduler-root">
      <aside className="scheduler-controls">
        {/* Add Task Button */}
        <button
          className="btn btn-large"
          style={{ marginBottom: 20 }}
          onClick={handleAddTaskClick}
          aria-label="Add Task"
          type="button"
        >
          + Add Task
        </button>
        <div className="scheduler-filter">
          <span className="section-title">Filter by Category:</span>
          {CATEGORY_CONFIG.map(cat => (
            <label key={cat.value} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterCategories.includes(cat.value)}
                onChange={() => handleFilterChange(cat.value)}
              />
              <span
                className="swatch"
                style={{
                  backgroundColor: cat.color,
                  border: '1px solid #333',
                  marginRight: 6
                }}
              />
              {cat.label}
            </label>
          ))}
        </div>
        <div className="scheduler-legend">
          <span className="section-title">Legend:</span>
          <ul>
            {CATEGORY_CONFIG.map(cat => (
              <li key={cat.value}>
                <span
                  className="swatch"
                  style={{
                    backgroundColor: cat.color,
                    border: '1px solid #333',
                  }}
                />
                <span style={{marginLeft: 6}}>{cat.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="scheduler-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
          initialView="dayGridMonth"
          editable={false}
          selectable={true}
          events={getFilteredEvents().map(e => ({
            ...e,
            backgroundColor: getCategoryColor(e.category),
            borderColor: getCategoryColor(e.category),
            extendedProps: { category: e.category }
          }))}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={eventContentRender}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          dayMaxEvents={true}
          themeSystem={null}
        />
      </div>
      {/* Event Dialog */}
      {dialogOpen && (
        <div className="modal-overlay">
          <div className="event-dialog">
            <form onSubmit={handleDialogSave} autoComplete="off">
              <div className="dialog-title">
                {dialogEvent && dialogEvent.id ? 'Edit Event' : 'Add Task'}
              </div>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  autoFocus
                  type="text"
                  name="title"
                  id="title"
                  defaultValue={dialogEvent?.title || ''}
                  required
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label htmlFor="start">Date</label>
                <input
                  type="date"
                  name="start"
                  id="start"
                  defaultValue={dialogEvent?.start || ''}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <div className="category-selectors">
                  {CATEGORY_CONFIG.map(cat => (
                    <label key={cat.value} style={{ marginRight: 10 }}>
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        defaultChecked={dialogEvent?.category === cat.value}
                        required
                      />{' '}
                      <span className="swatch" style={{
                        backgroundColor: cat.color,
                        border: '1px solid #333',
                        display: 'inline-block',
                        verticalAlign: 'middle'
                      }} />
                      <span style={{marginLeft: 6}}>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="dialog-actions">
                <button type="submit" className="btn btn-primary">OK</button>
                <button type="button" className="btn" onClick={handleDialogClose}>Cancel</button>
                {dialogEvent?.id && (
                  <button type="button" className="btn btn-danger" onClick={handleEventDelete}>Delete</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
