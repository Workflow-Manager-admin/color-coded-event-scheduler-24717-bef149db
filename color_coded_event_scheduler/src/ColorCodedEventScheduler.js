import React, { useState, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "@fullcalendar/daygrid/main.css";

// Category definitions and color palette
const CATEGORY_DEFS = [
  { name: "Work", color: "#1976d2" },
  { name: "Personal", color: "#43a047" },
  { name: "Deadline", color: "#d32f2f" },
];

const COLOR_PALETTE = {
  primary: "#1976d2",
  secondary: "#43a047",
  accent: "#d32f2f",
  dark: "#1A1A1A",
  border: "rgba(255,255,255,0.08)",
  text: "#fff",
};

// Get category object by name
function getCategoryByName(name) {
  return CATEGORY_DEFS.find((cat) => cat.name === name) || CATEGORY_DEFS[0];
}

// PUBLIC_INTERFACE
function ColorCodedEventScheduler() {
  // Event state
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Team Standup",
      start: new Date().toISOString().slice(0, 10),
      category: "Work",
    },
    {
      id: "2",
      title: "Dinner with family",
      start: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      category: "Personal",
    },
    {
      id: "3",
      title: "Project Deadline",
      start: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      category: "Deadline",
    },
  ]);

  // Filtering state
  const [activeCategories, setActiveCategories] = useState(
    CATEGORY_DEFS.map((cat) => cat.name)
  );

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' or 'edit'
  const [dialogData, setDialogData] = useState({
    id: null,
    title: "",
    start: "",
    category: CATEGORY_DEFS[0].name,
  });

  // Used for keyboard accessibility
  const dialogTitleInput = useRef();

  // Filtered events for FullCalendar
  const filteredEvents = events.filter((ev) =>
    activeCategories.includes(ev.category)
  );

  // Handle toggling of category filters
  const toggleCategory = (catName) => {
    setActiveCategories((cur) =>
      cur.includes(catName)
        ? cur.filter((c) => c !== catName)
        : [...cur, catName]
    );
  };

  // Open event dialog for creating or editing
  const openDialog = (mode, initialData = {}) => {
    setDialogMode(mode);
    setDialogData(
      mode === "edit"
        ? { ...initialData }
        : {
            id: null,
            title: "",
            start: initialData.date || "",
            category: CATEGORY_DEFS[0].name,
          }
    );
    setDialogOpen(true);
    setTimeout(() => dialogTitleInput.current && dialogTitleInput.current.focus(), 10);
  };

  // PUBLIC_INTERFACE
  const handleDateSelect = useCallback((selectInfo) => {
    openDialog("create", { date: selectInfo.startStr });
  }, []);

  // PUBLIC_INTERFACE
  const handleEventClick = useCallback(
    (clickInfo) => {
      const eventObj = events.find((ev) => ev.id === clickInfo.event.id);
      if (eventObj) {
        openDialog("edit", { ...eventObj });
      }
    },
    [events]
  );

  // Handle dialog field changes
  const onDialogField = (field, value) => {
    setDialogData((cur) => ({ ...cur, [field]: value }));
  };

  // Handle dialog Save
  const onDialogSave = () => {
    if (!dialogData.title.trim() || !dialogData.start || !dialogData.category) {
      alert("Please enter a title, date, and category.");
      return;
    }
    if (dialogMode === "create") {
      setEvents((cur) => [
        ...cur,
        {
          id: Math.random().toString(36).substr(2, 8),
          title: dialogData.title,
          start: dialogData.start,
          category: dialogData.category,
        },
      ]);
    } else if (dialogMode === "edit") {
      setEvents((cur) =>
        cur.map((ev) =>
          ev.id === dialogData.id
            ? {
                ...ev,
                title: dialogData.title,
                start: dialogData.start,
                category: dialogData.category,
              }
            : ev
        )
      );
    }
    setDialogOpen(false);
  };

  // Handle dialog Delete
  const onDialogDelete = () => {
    if (window.confirm("Delete this event?")) {
      setEvents((cur) => cur.filter((ev) => ev.id !== dialogData.id));
      setDialogOpen(false);
    }
  };

  // Handle dialog Cancel
  const onDialogCancel = () => setDialogOpen(false);

  // Custom event rendering to apply category color
  const eventContent = (eventInfo) => {
    const cat = getCategoryByName(eventInfo.event.extendedProps.category);
    return (
      <div
        style={{
          borderLeft: `6px solid ${cat.color}`,
          paddingLeft: 8,
          fontWeight: 500,
        }}
      >
        {eventInfo.event.title}
      </div>
    );
  };

  // --- Render
  return (
    <div className="scheduler-root">
      <div className="scheduler-toolbar">
        <div className="filter-section">
          <div className="filter-label">Filter:</div>
          {CATEGORY_DEFS.map((cat) => (
            <label
              key={cat.name}
              className="filter-checkbox"
              style={{ "--cat-color": cat.color }}
            >
              <input
                type="checkbox"
                checked={activeCategories.includes(cat.name)}
                onChange={() => toggleCategory(cat.name)}
              />
              <span className="cat-swatch" />
              <span className="cat-name">{cat.name}</span>
            </label>
          ))}
        </div>
        <div className="legend-section">
          <div className="legend-label">Legend:</div>
          <div className="legend-items">
            {CATEGORY_DEFS.map((cat) => (
              <span key={cat.name} className="legend-item">
                <span
                  className="legend-swatch"
                  style={{ backgroundColor: cat.color }}
                ></span>
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="calendar-section">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          select={handleDateSelect}
          events={filteredEvents}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          eventContent={eventContent}
          eventClick={handleEventClick}
          height="auto"
          aspectRatio={1.45}
          dayMaxEvents
        />
      </div>
      {dialogOpen && (
        <EventDialog
          dialogMode={dialogMode}
          dialogData={dialogData}
          onFieldChange={onDialogField}
          onSave={onDialogSave}
          onCancel={onDialogCancel}
          onDelete={dialogMode === "edit" ? onDialogDelete : null}
          categories={CATEGORY_DEFS}
          titleInputRef={dialogTitleInput}
        />
      )}
    </div>
  );
}

export default ColorCodedEventScheduler;


// --------- Event Creation/Edit Dialog ------------

function EventDialog({
  dialogMode,
  dialogData,
  onFieldChange,
  onSave,
  onCancel,
  onDelete,
  categories,
  titleInputRef,
}) {
  // Prevent background scroll when dialog open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, []);

  return (
    <div className="event-dialog-backdrop">
      <div className="event-dialog">
        <div className="event-dialog-title">
          {dialogMode === "edit" ? "Edit Event" : "Create Event"}
        </div>
        <form
          className="event-dialog-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <label>
            Title:
            <input
              type="text"
              required
              ref={titleInputRef}
              value={dialogData.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              autoFocus
            />
          </label>

          <label>
            Date:
            <input
              type="date"
              required
              value={dialogData.start}
              onChange={(e) => onFieldChange("start", e.target.value)}
            />
          </label>

          <label>
            Category:
            <select
              required
              value={dialogData.category}
              onChange={(e) => onFieldChange("category", e.target.value)}
            >
              {categories.map((cat) => (
                <option
                  key={cat.name}
                  value={cat.name}
                  style={{ color: cat.color }}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <div className="event-dialog-actions">
            <button type="button" onClick={onCancel} className="btn-outline">
              Cancel
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="btn-outline btn-danger"
              >
                Delete
              </button>
            )}
            <button type="submit" className="btn-primary">
              {dialogMode === "edit" ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
