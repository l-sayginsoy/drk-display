import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp.js';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(AdminApp)
  )
);
