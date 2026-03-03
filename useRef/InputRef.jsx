import { useRef } from 'react';

const SimpleForm = () => {
  const inputRef = useRef(null); // A "pointer" to the input element

  const handleSave = () => {
    // This is "getting the value directly"
    const val = inputRef.current.value;
    console.log("Saving:", val);
  };

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={handleSave}>Save</button>
    </>
  );
};

// --- main.jsx ---
import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SimpleForm />
  </React.StrictMode>
);