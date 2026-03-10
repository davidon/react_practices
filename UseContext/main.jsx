import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';

// HashRouter is used so all pages (summary, user posts, post detail)
// are served from the same UseContext/index.html. Hash URLs like
// index.html#/user/1/post/101 work without server-side rewrites.
// This replaces the old setup where the detail page was a separate
// HTML file (LayoutMultiProviders/index.html).
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);