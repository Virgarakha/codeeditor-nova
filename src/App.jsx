// src/App.jsx
import React from 'react';
import CodeEditor from './CodeEditor';
import './App.css';

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CodeEditor />
    </div>
  );
};

export default App;
