import React from 'react';
import ReactDOM from 'react-dom/client';
import TaskApp from './app.js'; // This is your file with useReducer

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TaskApp />
  </React.StrictMode>
);