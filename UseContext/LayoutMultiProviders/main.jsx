import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';

// HashRouter is used instead of BrowserRouter because:
//   1. This app is served as a static file (no server-side rewrite)
//   2. Hash URLs (e.g., index.html#/user/1/post/101) work without
//      any server configuration — the browser sends only the part
//      before # to the server, and React Router handles the rest.
//   3. The summary page (UseContext/index.html) can link directly
//      to detail pages using hash URLs.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);