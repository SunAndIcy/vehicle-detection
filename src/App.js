import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';      // Login page component
import Register from './Register'; // Register page component
import MainApp from './MainApp';   // Main page component for form submission
import Dashboard from './Dashboard'; // Dashboard page component (middle page)
import ListPage from './ListPage';   // List page component

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />         {/* Root path displays the login page */}
          <Route path="/login" element={<Login />} /> 
          <Route path="/register" element={<Register />} /> {/* Register page */}
          <Route path="/main" element={<MainApp />} />   {/* Form submission page */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Middle page */}
          <Route path="/list" element={<ListPage />} />   {/* List page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
