<<<<<<< SEARCH
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

/*
  Inline global style overrides for FullCalendar (minimal, dark theme with palette)
  Also, per-category color highlighting on events!
*/
function StyleOverridesPalette() {
  return (
    <style>{`
/* FullCalendar dark theme overrides */
=======
/**
 * Custom event content renderer for FullCalendar to suppress time and show only event title.
 * PUBLIC_INTERFACE
 */
function renderOnlyTitle(arg) {
  // arg: { event, timeText, isStart, isEnd, ... }
  // We'll render only the event title (no time).
  return {
    domNodes: [
      (() => {
        const div = document.createElement('div');
        div.style.fontWeight = '500';
        div.style.whiteSpace = 'nowrap';
        div.style.overflow = 'hidden';
        div.style.textOverflow = 'ellipsis';
        div.innerText = arg.event.title || '';
        return div;
      })()
    ]
  };
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

/*
  Inline global style overrides for FullCalendar (minimal, dark theme with palette)
  Also, per-category color highlighting on events!
*/
function StyleOverridesPalette() {
  return (
    <style>{`
/* FullCalendar dark theme overrides */
>>>>>>> REPLACE
