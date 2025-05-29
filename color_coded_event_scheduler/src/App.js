import React, { useState, useRef } from "react";
import "./App.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// PUBLIC_INTERFACE
const CATEGORY_DATA = [
  {
    key: "work",
    name: "Work",
    color: "#1976d2", // primary
  },
  {
    key: "personal",
    name: "Personal",
    color: "#43a047", // secondary
  },
  {
    key: "deadline",
    name: "Deadline",
    color: "#d32f2f", // accent
  },
];

// PUBLIC_INTERFACE
function getCategoryByKey(key) {
  return CATEGORY_DATA.find((cat) => cat.key === key);
}

// PUBLIC_INTERFACE
function CategoryLegend() {
  return (
    <div className="legend">
      {CATEGORY_DATA.map((cat) => (
        <div key={cat.key} className="legend-item">
          <span
            className="legend-color"
            style={{
              background: `${cat.color}`
            }}
          />
          <span className="legend-label">{cat.name}</span>
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function CategoryFilter({ selectedCategories, setSelectedCategories }) {
  function onToggle(key) {
    setSelectedCategories((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  }
  return (
    <div className="category-filter">
      <span className="category-filter-label">Filter Categories:</span>
      {CATEGORY_DATA.map((cat) => (
        <label key={cat.key} className="category-checkbox">
          <input
            type="checkbox"
            checked={selectedCategories.includes(cat.key)}
            onChange={() => onToggle(cat.key)}
          />
          <span
            className="category-checkbox-color"
            style={{ background: cat.color }}
          />
          {cat.name}
        </label>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function EventDialog({
  open,
  onClose,
  onSave,
  initialEvent,
  isEdit,
}) {
  const [title, setTitle] = useState(initialEvent?.title || "");
  const [start, setStart] = useState(
    initialEvent?.start
      ? new Date(initialEvent.start).toISOString().slice(0, 16)
      : ""
  );
  const [end, setEnd] = useState(
    initialEvent?.end
      ? new Date(initialEvent.end).toISOString().slice(0, 16)
      : ""
  );
  const [category, setCategory] = useState(initialEvent?.extendedProps?.category || "work");

  React.useEffect(() => {
    setTitle(initialEvent?.title || "");
    setStart(
      initialEvent?.start
        ? new Date(initialEvent.start).toISOString().slice(0, 16)
        : ""
    );
    setEnd(
      initialEvent?.end
        ? new Date(initialEvent.end).toISOString().slice(0, 16)
        : ""
    );
    setCategory(initialEvent?.extendedProps?.category || "work");
  }, [initialEvent, open]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !start || !category) return;
    onSave({
      title,
      start,
      end: end || start,
      extendedProps: { category },
      id: initialEvent?.id,
    });
  }

  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h3>{isEdit ? "Edit Event" : "Add Event"}</h3>
        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-row">
            <label>
              Title
              <input
                type="text"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Start
              <input
                type="datetime-local"
                value={start}
                required
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              End
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                min={start}
              />
            </label>
          </div>
          <div className="form-row">
            Category
            <div className="category-radio-group">
              {CATEGORY_DATA.map((cat) => (
                <label key={cat.key} className="category-radio">
                  <input
                    type="radio"
                    value={cat.key}
                    checked={category === cat.key}
                    onChange={() => setCategory(cat.key)}
                  />
                  <span
                    className="category-checkbox-color"
                    style={{ background: cat.color }}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
          <div className="dialog-actions">
            <button
              type="button"
              className="btn dialog-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="btn btn-large" type="submit">
              {isEdit ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // State for events
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Team Standup",
      start: new Date().toISOString().slice(0, 10) + "T09:30",
      end: new Date().toISOString().slice(0, 10) + "T10:00",
      extendedProps: { category: "work" },
    },
    {
      id: "2",
      title: "Doctor Appointment",
      start: new Date().toISOString().slice(0, 10) + "T13:00",
      end: new Date().toISOString().slice(0, 10) + "T14:00",
      extendedProps: { category: "personal" },
    },
    {
      id: "3",
      title: "Project Deadline",
      start: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
      end: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
      extendedProps: { category: "deadline" },
    },
  ]);

  // State for category filter
  const [selectedCategories, setSelectedCategories] = useState(
    CATEGORY_DATA.map((cat) => cat.key)
  );

  // Event dialog state
  const [dialogState, setDialogState] = useState({
    open: false,
    isEdit: false,
    event: null,
  });

  // Handler for event creation
  function handleDateSelect(selectInfo) {
    setDialogState({
      open: true,
      isEdit: false,
      event: {
        title: "",
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        extendedProps: { category: "work" },
      },
    });
  }

  // Handler for FAB 'Add Task' button (defaults to today)
  function handleAddTaskClick() {
    const today = new Date();
    // yyyy-MM-ddTHH:mm for local input date format
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const dateStr =
      today.getFullYear() +
      "-" +
      pad(today.getMonth() + 1) +
      "-" +
      pad(today.getDate()) +
      "T09:00";
    setDialogState({
      open: true,
      isEdit: false,
      event: {
        title: "",
        start: dateStr,
        end: dateStr,
        extendedProps: { category: "work" },
      },
    });
  }

  // Handler for event clicking (edit)
  function handleEventClick(clickInfo) {
    setDialogState({
      open: true,
      isEdit: true,
      event: {
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        extendedProps: {
          category: clickInfo.event.extendedProps.category || "work",
        },
      },
    });
  }

  // Handler for event addition/edit dialog save
  function handleDialogSave(eventData) {
    if (dialogState.isEdit && eventData.id) {
      // update existing event
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventData.id
            ? {
                ...ev,
                title: eventData.title,
                start: eventData.start,
                end: eventData.end,
                extendedProps: { category: eventData.extendedProps.category },
              }
            : ev
        )
      );
    } else {
      // add new event; (generate unique id)
      const newId =
        Math.max(0, ...events.map((ev) => parseInt(ev.id, 10) || 0)) + 1;
      setEvents((prev) => [
        ...prev,
        {
          ...eventData,
          id: String(newId),
        },
      ]);
    }
    setDialogState({ open: false, isEdit: false, event: null });
  }

  // Handler for dialog close
  function handleDialogClose() {
    setDialogState({ open: false, isEdit: false, event: null });
  }

  // Handler for event removal (on delete via DEL key)
  function handleEventRemove(eventId) {
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  }

  // Calendar component ref
  const calendarRef = useRef(null);

  // Keydown handler for event deletion
  React.useEffect(() => {
    function onKeydown(e) {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        calendarRef.current &&
        calendarRef.current.getApi().getEvents().some((ev) => ev.selected)
      ) {
        // Remove selected event(s)
        const calendarApi = calendarRef.current.getApi();
        const selectedEv = calendarApi.getEvents().find((ev) => ev.selected);
        if (selectedEv) handleEventRemove(selectedEv.id);
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
    // eslint-disable-next-line
  }, []);

  // Filtered events by selectedCategories
  const filteredEvents = events.filter((ev) =>
    selectedCategories.includes(ev.extendedProps.category)
  );

  // Event rendering to apply custom style per category
  function renderEventContent(eventInfo) {
    const cat =
      CATEGORY_DATA.find(
        (cat) => cat.key === eventInfo.event.extendedProps.category
      ) || CATEGORY_DATA[0];
    return (
      <div
        className="fc-event-content-custom"
        style={{
          background: cat.color,
          color: "#fff",
          borderRadius: "4px",
          padding: "2px 6px",
        }}
      >
        <b>{eventInfo.timeText}</b>{" "}
        <span
          className="fc-event-title-ellipsis"
          title={eventInfo.event.title}
        >
          {eventInfo.event.title}
        </span>
      </div>
    );
  }

  // Calendar height calculation (for fixed top nav and filters)
  const calendarLayoutOffset = 190; // px

  return (
    <div className="app dark-theme">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div className="logo">
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
            <span className="calendar-title">Color-Coded Event Scheduler</span>
          </div>
        </div>
      </nav>
      <main>
        <div className="container">
          {/* Category Filter + Legend */}
          <div className="scheduler-controls">
            <CategoryFilter
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
            <CategoryLegend />
          </div>
          {/* Add Task FAB */}
          <button
            className="btn btn-large fab-add-task"
            type="button"
            aria-label="Add Task"
            onClick={handleAddTaskClick}
            style={{
              position: "fixed",
              bottom: 38,
              right: 38,
              zIndex: 1200,
              background: "var(--kavia-orange)",
              color: "white",
              borderRadius: "50%",
              width: 62,
              height: 62,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.3rem",
              fontWeight: 700,
              boxShadow: "0 5px 24px 0 rgba(232, 122, 65, 0.18)",
              border: "none",
              transition: "background .2s"
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#FF8B4D")}
            onMouseOut={e => (e.currentTarget.style.background = "var(--kavia-orange)")}
            tabIndex={0}
          >
            +
          </button>
          {/* Calendar */}
          <div
            style={{
              marginTop: "18px",
              marginBottom: "20px",
              background: "var(--kavia-dark)",
              borderRadius: "8px",
              boxShadow: "0 1px 8px 0 rgba(40,40,40,0.15)"
            }}
          >
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              height={`calc(100vh - ${calendarLayoutOffset}px)`}
              selectable={true}
              selectMirror={true}
              events={filteredEvents}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              dayMaxEvents={true}
              eventDisplay="block"
              editable={false}
              allDaySlot={true}
              slotMinTime="07:00:00"
              slotMaxTime="20:00:00"
              eventBackgroundColor={null} // We use custom background!
              eventClassNames={(arg) => {
                const cat = CATEGORY_DATA.find(
                  (c) => c.key === arg.event.extendedProps.category
                );
                return [
                  "fc-event-custom",
                  cat ? `cat-${cat.key}` : "",
                ];
              }}
              // focus accessibility
              handleWindowResize={true}
            />
          </div>
        </div>
        {/* Dialog Modal for Create/Edit */}
        <EventDialog
          open={dialogState.open}
          onClose={handleDialogClose}
          onSave={handleDialogSave}
          initialEvent={dialogState.event}
          isEdit={dialogState.isEdit}
        />
      </main>
    </div>
  );
}

export default App;

