import React, { useReducer, useState, useEffect } from 'https://esm.sh/react';
import ReactDOM from "https://esm.sh/react-dom/client"; // Use /client for React 18+

import { reducer, getStoredState, TYPES } from 'https://codepen.io/micropresident/pen/jEMOMMJ.js';

 function TaskApp() {
  // Initialize useReducer with the data found in LocalStorage
  const [state, dispatch] = useReducer(reducer, getStoredState());
  const [text, setText] = useState("");

  // 3. PERSISTENCE LAYER: Save state whenever it changes
  useEffect(() => {
    localStorage.setItem('task_app_state', JSON.stringify(state));
    console.log("State synced to LocalStorage");
  }, [state]); // Only runs when 'state' object updates

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: TYPES.ADD_TASK, payload: text });
    setText("");
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Persistent Task Manager</h2>
      
      {/* Metrics Dashboard */}
      <section style={metricsStyle}>
        <div>Rate: {state.metrics.completionRate}%</div>
        <button onClick={() => {
          localStorage.removeItem('task_app_state');
          window.location.reload(); // Hard reset
        }} style={{fontSize: '10px'}}>Clear Storage</button>
      </section>

      {/* Input and List (same as previous example) */}
      <form onSubmit={handleAdd}>
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Add Task</button>
      </form>
      
      <ul>
        {state.tasks.map(task => (
          <li key={task.id}>
             <input type="checkbox" checked={task.done} onChange={() => dispatch({ type: TYPES.TOGGLE_TASK, payload: task.id })} />
             {task.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

const metricsStyle = { display: 'flex', justifyContent: 'space-between', background: '#eee', padding: '10px', marginBottom: '10px' };

// At the bottom of app.js
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(<TaskApp />);