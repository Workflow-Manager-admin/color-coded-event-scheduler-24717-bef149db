import React from 'react';
import './App.css';
import EventScheduler from './EventScheduler';
import './EventScheduler.css';

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
            <span style={{color: 'var(--kavia-orange, #E87A41)', fontWeight: 600}}>
              Color-Coded Event Scheduler
            </span>
          </div>
        </div>
      </nav>
      <main>
        <EventScheduler />
      </main>
    </div>
  );
}

export default App;