import React, { useState, useRef } from "react";
import "./App.css";
import "@fullcalendar/daygrid/index.css";
import "@fullcalendar/timegrid/index.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

// PUBLIC_INTERFACE
/**
 * Event categories with color mapping.
 */
const CATEGORIES = [
  { key: "work", label: "Work", color: "#1976d2" },      // primary
  { key: "personal", label: "Personal", color: "#43a047" }, // secondary
  { key: "deadline", label: "Deadline", color: "#d32f2f" }, // accent
];

// PUBLIC_INTERFACE
/**
 * Legend UI component
 */
function CategoryLegend() {
  return (
    <div className="category-legend">
      {CATEGORIES.map((cat) => (
        <div key={cat.key} className="legend-item">
          <span
            className="legend-swatch"
            style={{
              background: cat.color,
              display: "inline-block",
              width: 16,
              height: 16,
              borderRadius: 4,
              marginRight: 8,
            }}
          />
          <span>{cat.label}</span>
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Filter panel (checkboxes/toggles for filtering categories)
 */
function FilterPanel({ activeCategories, setActiveCategories }) {
  // Handle toggling category filter checkboxes
  function handleChange(key) {
    if (activeCategories.includes(key)) {
      setActiveCategories((prev) => prev.filter((k) => k !== key));
    } else {
      setActiveCategories((prev) => [...prev, key]);
    }
  }

  return (
    <div className="filter-panel">
      <span style={{marginRight: 12, fontWeight: 500 }}>Filter:</span>
      {CATEGORIES.map((cat) => (
        <label key={cat.key} className="checkbox-label" style={{marginRight: 16}}>
          <input
            type="checkbox"
            checked={activeCategories.includes(cat.key)}
            onChange={() => handleChange(cat.key)}
            style={{accentColor: cat.color}}
          />
          <span style={{color: cat.color, marginLeft: 4}}>{cat.label}</span>
        </label>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Event dialog for create/edit
 */
function EventDialog({
  open,
  onClose,
  onSave,
  initialEvent,
  isEditing
}) {
  // Controlled form state
  const [title, setTitle] = useState(initialEvent ? initialEvent.title : "");
  const [start, setStart] = useState(initialEvent ? initialEvent.start.substr(0, 16) : "");
  const [end, setEnd] = useState(initialEvent && initialEvent.end ? initialEvent.end.substr(0, 16) : "");
  const [category, setCategory] = useState(initialEvent ? initialEvent.extendedProps.category : CATEGORIES[0].key);

  // Reset on open/close change
  React.useEffect(() => {
    setTitle(initialEvent ? initialEvent.title : "");
    setStart(initialEvent ? initialEvent.start.substr(0, 16) : "");
    setEnd(initialEvent && initialEvent.end ? initialEvent.end.substr(0, 16) : "");
    setCategory(initialEvent ? initialEvent.extendedProps.category : CATEGORIES[0].key);
  }, [open, initialEvent]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    // Minimal validation
    if (!title.trim() || !start) return;
    onSave({
      ...initialEvent,
      title,
      start,
      end: end || undefined,
      extendedProps: { category },
    });
    onClose();
  }

  function handleDelete() {
    if (onSave) {
      onSave({ ...initialEvent, _delete: true });
    }
    onClose();
  }

  return (
    <div className="dialog-backdrop">
      <div className="event-dialog">
        <form onSubmit={handleSubmit}>
          <h2 style={{ marginTop: 0 }}>
            {isEditing ? "Edit Event" : "Add Event"}
          </h2>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              autoFocus
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Start Date & Time *</label>
            <input
              type="datetime-local"
              value={start}
              onChange={e => setStart(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date & Time</label>
            <input
              type="datetime-local"
              value={end}
              onChange={e => setEnd(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 16,
            }}
          >
            {isEditing && (
              <button
                type="button"
                className="btn"
                style={{ background: "#d32f2f" }}
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              className="btn"
              style={{ background: "#506273" }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="btn btn-large" type="submit">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Main color-coded event scheduler container.
 */
function ColorCodedEventScheduler() {
  // Sample initial events for demo
  const initialEvents = [
    {
      id: "1",
      title: "Work Meeting",
      start: new Date().toISOString().substr(0,16),
      end: null,
      extendedProps: { category: "work" },
    },
    {
      id: "2",
      title: "Doctor Appointment",
      start: new Date(Date.now() + 60*60*1000).toISOString().substr(0,16),
      end: null,
      extendedProps: { category: "personal" },
    },
    {
      id: "3",
      title: "Project Deadline",
      start: new Date(Date.now() + 24*60*60*1000).toISOString().substr(0,16),
      end: null,
      extendedProps: { category: "deadline" },
    },
  ];

  const [events, setEvents] = useState(initialEvents);
  const [activeCategories, setActiveCategories] = useState(CATEGORIES.map(cat => cat.key));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventForDialog, setEventForDialog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Prepare events for FullCalendar
  function getFilteredRenderedEvents() {
    return events
      .filter(e => activeCategories.includes(e.extendedProps.category))
      .map(e => ({
        ...e,
        backgroundColor: CATEGORIES.find(c => c.key === e.extendedProps.category).color,
        borderColor: CATEGORIES.find(c => c.key === e.extendedProps.category).color,
        textColor: "#fff"
      }));
  }

  // Add new event
  function handleDateSelect(selectInfo) {
    setEventForDialog({
      title: "",
      start: selectInfo.startStr ? selectInfo.startStr.substr(0, 16) : "",
      end: selectInfo.endStr ? selectInfo.endStr.substr(0, 16) : "",
      extendedProps: { category: CATEGORIES[0].key }
    });
    setIsEditing(false);
    setDialogOpen(true);
  }

  function handleEventClick(clickInfo) {
    // Find the event in our state, not FullCalendar's object.
    const eventObj = events.find(
      e =>
        e.id === clickInfo.event.id ||
        (e.start === clickInfo.event.startStr &&
          e.title === clickInfo.event.title)
    );
    setEventForDialog(
      eventObj || {
        title: clickInfo.event.title,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr || "",
        extendedProps: { category: clickInfo.event.extendedProps.category },
        id: clickInfo.event.id,
      }
    );
    setIsEditing(true);
    setDialogOpen(true);
  }

  function handleDialogSave(newEvt) {
    // Handle delete
    if (newEvt._delete) {
      setEvents(events =>
        events.filter(e => e !== eventForDialog)
      );
      return;
    }
    // Edit
    if (isEditing && eventForDialog) {
      setEvents(events =>
        events.map(e =>
          e === eventForDialog
            ? {
                ...e,
                title: newEvt.title,
                start: newEvt.start,
                end: newEvt.end,
                extendedProps: { category: newEvt.extendedProps.category },
              }
            : e
        )
      );
    } else {
      // Add - assign unique id; extra check to avoid id collision in small demo
      setEvents(events => [
        ...events,
        {
          id: `${(+new Date()).toString() + Math.random().toString().substr(2,3)}`,
          title: newEvt.title,
          start: newEvt.start,
          end: newEvt.end,
          extendedProps: { category: newEvt.extendedProps.category },
        }
      ]);
    }
  }

  // Layout
  return (
    <div className="app dark-mode" style={{ minHeight: "100vh", background: "var(--kavia-dark)" }}>
      <nav className="navbar">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div className="logo">
              <span className="logo-symbol">*</span> Color-Coded Event Scheduler
            </div>
            <a href="https://fullcalendar.io/" target="_blank" rel="noopener noreferrer" className="btn" style={{marginLeft:12}}>FullCalendar Docs</a>
          </div>
        </div>
      </nav>

      <main>
        <div className="container" style={{ marginTop: 110, marginBottom:32 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 36,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <FilterPanel
              activeCategories={activeCategories}
              setActiveCategories={setActiveCategories}
            />
            <CategoryLegend />
            <button
              className="btn"
              style={{marginLeft:24, marginTop:2}}
              onClick={() => {
                setIsEditing(false);
                setEventForDialog(null);
                setDialogOpen(true);
              }}
            >
              + Add Event
            </button>
          </div>
          <div
            className="calendar-container"
            style={{
              background: "#232939",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 4px 36px 0 rgba(0,0,0,0.18)",
              border: "1px solid var(--border-color)"
            }}
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              editable={true}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={getFilteredRenderedEvents()}
              select={handleDateSelect}
              eventClick={handleEventClick}
              dayMaxEvents={2}
              height="auto"
              // Additional config to match dark mode
              eventDisplay="block"
              eventBackgroundColor="#fff"
              eventTextColor="#000"
              themeSystem="standard"
            />
          </div>
        </div>
      </main>
      <EventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleDialogSave}
        initialEvent={eventForDialog}
        isEditing={isEditing}
      />
    </div>
  );
}

export default ColorCodedEventScheduler;