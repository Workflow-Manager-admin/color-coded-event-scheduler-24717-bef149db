import React, { useState, useRef } from 'react';
// PUBLIC_INTERFACE
// Main container component for color-coded event scheduler.
//
// Features:
// - Uses FullCalendar for the main event view (week/day/month/grid).
// - Supports three event categories with distinct colors:
//      Work (primary: #1976d2), Personal (secondary: #43a047), Deadline (accent: #d32f2f)
// - Top (or side) filter panel: user can toggle visibility for each category via checkboxes
// - Category legend matches palette and provides quick reference
// - Event creation/editing dialogs with category selection included
// - Retains dark theme and minimal, modern styling; accessible
// - All data in-memory (no backend)
//
/** Required dependency installation (run before using this file):
  npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
*/

// FullCalendar imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// We'll style via CSS-in-JS with a <style> tag below, for palette compliance

const CATEGORY_COLORS = {
  Work:    '#1976d2', // primary
  Personal:'#43a047', // secondary
  Deadline:'#d32f2f', // accent
};
const CATEGORY_OPTIONS = [
  { label: 'Work', value: 'Work', color: CATEGORY_COLORS.Work },
  { label: 'Personal', value: 'Personal', color: CATEGORY_COLORS.Personal },
  { label: 'Deadline', value: 'Deadline', color: CATEGORY_COLORS.Deadline }
];

// Helper to get color for a category
function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#607d8b';
}

const DIALOG_INIT_STATE = {
  open: false,
  isEdit: false,
  id: null,
  title: '',
  date: '',
  category: 'Work',
};

export default function EventScheduler() {
  // In-memory state for events (as array of event objects)
  const [events, setEvents] = useState([
    // Example initial events
    {
      id: '1',
      title: 'Team Sync',
      start: new Date().toISOString().slice(0, 10) + 'T10:00:00',
      end: new Date().toISOString().slice(0, 10) + 'T11:00:00',
      category: 'Work',
    },
    {
      id: '2',
      title: 'Family Dinner',
      start: new Date().toISOString().slice(0, 10) + 'T18:00:00',
      end: new Date().toISOString().slice(0, 10) + 'T20:00:00',
      category: 'Personal',
    },
    {
      id: '3',
      title: 'Tax Deadline',
      start: new Date().toISOString().slice(0, 10) + 'T23:59:00',
      end: new Date().toISOString().slice(0, 10) + 'T23:59:59',
      category: 'Deadline',
    }
  ]);
  // Categories to display (enabled by checkboxes)
  const [activeCategories, setActiveCategories] = useState(CATEGORY_OPTIONS.map(c => c.value));
  // Dialog state for create/edit
  const [dialog, setDialog] = useState(DIALOG_INIT_STATE);
  const calendarRef = useRef();

  // Filter events to only those with matching category
  const filteredEvents = events.filter(ev => activeCategories.includes(ev.category));

  // ==== Dialog logic ====
  function openDialog(options) {
    setDialog({ ...DIALOG_INIT_STATE, ...options, open: true });
  }
  function closeDialog() {
    setDialog(DIALOG_INIT_STATE);
  }

  function handleDateClick(info) {
    // Open dialog for new event, with date pre-filled (yyyy-MM-dd)
    openDialog({
      date: info.dateStr,
      isEdit: false,
    });
  }

  function handleEventClick(info) {
    // Edit existing event (single date, populate fields)
    const ev = events.find(e => e.id === info.event.id);
    if (ev) {
      // parse date part from start
      let stripDate = (isoStr) =>
        isoStr ? isoStr.slice(0, 10) : '';
      openDialog({
        isEdit: true,
        id: ev.id,
        title: ev.title,
        date: stripDate(ev.start),
        category: ev.category,
      });
    }
  }

  function handleDialogChange(e) {
    const { name, value } = e.target;
    setDialog(prev => ({ ...prev, [name]: value }));
  }

  function handleDialogSubmit(e) {
    e.preventDefault();
    // Validate
    const title = dialog.title.trim();
    if (!title || !dialog.date) return;

    // generate ISO date string. Use date at midnight for all-day.
    let eventDate = dialog.date; // yyyy-MM-dd
    let isoStart = eventDate + "T00:00:00";
    let isoEnd = eventDate + "T23:59:59"; // for 'end' field, not actually used by FullCalendar for one-day events

    if (dialog.isEdit) {
      setEvents(evts =>
        evts.map(ev =>
          ev.id === dialog.id
            ? { ...ev, title, category: dialog.category, start: isoStart, end: isoEnd }
            : ev
        )
      );
    } else {
      // New event
      setEvents(evts => [
        ...evts,
        {
          id: Math.random().toString(36).slice(2),
          title,
          start: isoStart,
          end: isoEnd,
          category: dialog.category,
        }
      ]);
    }
    closeDialog();
  }

  function handleEventRemove() {
    if (dialog.isEdit && dialog.id) {
      setEvents(evts => evts.filter(ev => ev.id !== dialog.id));
      closeDialog();
    }
  }

  function handleCategoryToggle(cat) {
    setActiveCategories(current =>
      current.includes(cat)
        ? current.filter(c => c !== cat)
        : [...current, cat]
    );
  }

  // For accessibility, dark background, modern minimal styling.
  // For actual dark theme, inherit from App.css with custom palette.
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--kavia-dark, #191b1f)',
      color: 'var(--text-color, #fff)',
      paddingTop: 40,
    }}>
      {/* Inline palette and calendar overrides */}
      <StyleOverridesPalette />
      {/* Titlebar and Control row */}
      <div className="event-scheduler-header" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(30,32,36,0.95)',
        padding: '1.5rem 2rem 1.25rem 2rem',
        borderBottom: '1px solid var(--border-color, #242424)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontWeight: 600,
            letterSpacing: '0.03em',
            fontSize: '2rem',
          }}>
            <span style={{
              color: 'var(--kavia-orange,#E87A41)',
              marginRight: 10,
              fontWeight: 700,
              verticalAlign: 'middle'
            }}>*</span>
            Color-Coded Event Scheduler
          </h2>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <CategoryFilterPanel
            activeCategories={activeCategories}
            onToggle={handleCategoryToggle}
          />
          <CategoryLegend />
          <button
            className="btn"
            style={{
              background: 'linear-gradient(90deg, #1976d2 60%, #d32f2f 100%)',
              color: '#fff',
              fontWeight: '500',
              border: 0, borderRadius: 4,
              padding: '10px 18px',
              marginLeft: '1.2rem'
            }}
            onClick={() =>
              openDialog({
                isEdit: false,
                date: '',
                category: 'Work'
              })
            }
            aria-label="Create new task"
            tabIndex={0}
          >+ New Task</button>
        </div>
      </div>
      {/* Calendar */}
      <div className="event-scheduler-main" style={{
        margin: '0 auto',
        maxWidth: 1100,
        padding: '1.5rem 1rem'
      }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          height="auto"
          editable
          selectable
          eventColor=""
          events={filteredEvents.map(ev => ({
            ...ev,
            backgroundColor: getCategoryColor(ev.category),
            borderColor: getCategoryColor(ev.category),
            textColor: '#fff',
          }))}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          // themeSystem: none; we override via custom CSS for dark
        />
      </div>

      {/* Event Create/Edit Dialog */}
      {dialog.open &&
        <DialogBackdrop>
          <form className="event-dialog"
            tabIndex={0}
            onSubmit={handleDialogSubmit}
            style={{
              background: '#23272F',
              color: '#fff',
              padding: 24,
              minWidth: 320,
              minHeight: 280,
              borderRadius: 12,
              boxShadow: '0 2px 16px #0007',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              zIndex: 200,
              position: 'relative'
            }}
            aria-modal="true"
            role="dialog"
            onKeyDown={e => {
              if (e.key === 'Escape') closeDialog();
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{
                margin: 0,
                fontWeight: 500,
              }}>{dialog.isEdit ? 'Edit Task' : 'Add New Task'}</h3>
              <button type="button"
                aria-label="Close dialog"
                onClick={closeDialog}
                className="btn"
                style={{
                  background: 'transparent', color: '#fff', fontWeight: 700,
                  border: 0, fontSize: 22, lineHeight: 1, cursor: 'pointer'
                }}>&#10006;</button>
            </div>
            <label style={{ fontWeight: 500 }}>
              Title
              <input
                type="text"
                name="title"
                value={dialog.title}
                onChange={handleDialogChange}
                autoFocus
                style={inputStyle()}
                required
                placeholder="Task name"
                maxLength={32}
              />
            </label>
            <label style={{ fontWeight: 500 }}>
              Date
              <input
                type="date"
                name="date"
                value={dialog.date}
                onChange={handleDialogChange}
                style={inputStyle()}
                required
                placeholder="Select date"
                min={new Date().getFullYear() + '-01-01'}
                max={(new Date().getFullYear() + 5) + '-12-31'}
              />
            </label>
            <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
              <div style={{
                fontWeight: 500, marginBottom: 4, color: '#eee'
              }}>Category</div>
              <div style={{
                display: 'flex', gap: 10
              }}>
                {CATEGORY_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      cursor: 'pointer',
                      fontWeight: 400
                    }}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={opt.value}
                      checked={dialog.category === opt.value}
                      onChange={handleDialogChange}
                      style={{ accentColor: opt.color }}
                    />
                    <span style={{
                      width: 15,
                      height: 15,
                      display: 'inline-block',
                      borderRadius: '50%',
                      background: opt.color,
                      marginRight: 3,
                      border: '2px solid #222'
                    }} />
                    <span style={{
                      color: '#fff'
                    }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8
            }}>
              {dialog.isEdit &&
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: '#d32f2f', color: '#fff',
                    fontWeight: 500, border: 0
                  }}
                  onClick={handleEventRemove}
                  tabIndex={0}
                >Delete</button>
              }
              <button
                type="submit"
                className="btn"
                style={{
                  background: dialog.isEdit
                    ? `linear-gradient(90deg, #1976d2 60%, #d32f2f 100%)`
                    : CATEGORY_COLORS[dialog.category],
                  color: '#fff',
                  fontWeight: 500,
                  border: 0
                }}
                tabIndex={0}
              >{dialog.isEdit ? 'Update' : 'Add'} Task</button>
            </div>
          </form>
        </DialogBackdrop>
      }
    </div>
  );
}

// PUBLIC_INTERFACE
// Category filter panel for toggling which categories are visible.
function CategoryFilterPanel({ activeCategories, onToggle }) {
  return (
    <div className="category-filter-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(30,32,36,0.7)',
        borderRadius: 6,
        padding: '5px 18px 5px 12px',
        border: '1px solid var(--border-color, #2d2d2d)',
        userSelect: 'none'
      }}
    >
      <span style={{ marginRight: 8, fontWeight: 500, color: 'var(--text-secondary, #eef)' }}>
        Filter:
      </span>
      {CATEGORY_OPTIONS.map(opt => (
        <label key={opt.value} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          cursor: 'pointer', fontWeight: 400, fontSize: 15,
          color: activeCategories.includes(opt.value) ? '#fff' : 'var(--text-secondary, #ccc)'
        }}>
          <input
            type="checkbox"
            checked={activeCategories.includes(opt.value)}
            onChange={() => onToggle(opt.value)}
            style={{
              accentColor: opt.color,
              width: 16, height: 16, marginRight: 4
            }}
            tabIndex={0}
          />
          <span style={{
            display: 'inline-block',
            width: 9, height: 9,
            background: opt.color,
            borderRadius: '50%', marginRight: 3,
            border: `1.5px solid #222`
          }} />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
// Category legend next to controls
function CategoryLegend() {
  return (
    <div className="category-legend"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginLeft: 16
      }}>
      <span style={{
        fontWeight: 500,
        fontSize: 15,
        letterSpacing: '0.01em',
        color: 'var(--text-secondary, #cccccc)'
      }}>Legend:</span>
      {CATEGORY_OPTIONS.map(opt => (
        <span key={opt.value} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(23,28,35,0.7)', padding: '2px 9px', borderRadius: 5,
          fontSize: 14,
          border: `1.5px solid ${opt.color}55`,
          color: '#fff'
        }}>
          <span style={{
            background: opt.color,
            width: 13, height: 13, display: 'inline-block', borderRadius: '50%',
            marginRight: 2, border: `2px solid #15181d`
          }} />
          {opt.label}
        </span>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
// Simple dialog modal backdrop and focus trap
function DialogBackdrop({ children }) {
  // Trap focus when open - for accessibility, skip full implementation for brevity.
  // Focus first input by default (handled in dialog)
  return (
    <div style={{
      position: 'fixed',
      zIndex: 150,
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'rgba(48,50,60, 0.80)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.2s',
    }}
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

// Helper: Accessible input styling
function inputStyle() {
  return {
    background: '#16181C',
    color: '#fff',
    border: '1.5px solid #383872',
    padding: '7px 8px',
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 400,
    boxShadow: '0 1px 4px #0002',
    outline: 'none',
    marginTop: 2,
    marginBottom: 0,
  };
}

// Inline global style overrides for FullCalendar (minimal, dark theme with palette)
function StyleOverridesPalette() {
  return (
    <style>{`
/* FullCalendar dark theme overrides */
.fc {
  --fc-page-bg-color: #181A21;
  --fc-border-color: #252631;
  --fc-list-event-hover-bg-color: #242442;
  --fc-neutral-bg-color: #23233c;
  --fc-button-bg-color: #1976d2;
  --fc-button-border-color: #1976d2;
  --fc-button-hover-bg-color: #254ea3;
  --fc-button-active-bg-color: #174389;
  --fc-list-event-dot-width: 12px;
  --fc-event-bg-color: #333;
  --fc-event-border-color: #1e1e30;
}
/* Button style */
.fc .fc-button {
  background: var(--fc-button-bg-color, #1976d2);
  color: #fff;
  border-radius: 5px;
  border: 1.5px solid #174389;
  font-weight: 500;
}
.fc .fc-button-primary:not(:disabled).fc-button-active,
.fc .fc-button-primary:focus {
  background: linear-gradient(90deg, #1976d2 60%, #d32f2f 100%);
}
.fc .fc-toolbar {
  color: #fff;
}
.fc-toolbar-title {
  color: #fff;
  font-weight: 600;
  font-size: 1.3em;
}
/* Grid colors */
.fc-scrollgrid {
  background: #191b1f;
}
.fc-col-header-cell {
  background: #232432;
  color: #fff;
}

.fc-daygrid-day {
  background: #181a22;
  color: #eee;
  border-color: #272729;
}

.fc-day-today {
  background: #262641 !important;
}
.fc-event {
  color: #fff;
  font-weight: 500;
  border-width: 2px;
  border-style: solid;
}
.fc-daygrid-event-dot {
  display: none;
}
  `}</style>
  );
}
