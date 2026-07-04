import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importing Pages
import StaffDashboard from './pages/StaffDashboard';
import PatientRegister from './pages/PatientRegister';
import PatientLogin from './pages/PatientLogin';
import PatientProfile from './pages/PatientProfile';
import AdminLogin from './pages/AdminLogin';// Newly added Admin Login

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Patients Routes--- */}
        <Route path="/register" element={<PatientRegister />} />
        <Route path="/login" element={<PatientLogin />} />
        <Route path="/profile" element={<PatientProfile />} />

        {/* --- Admin/Staff Routes --- */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<StaffDashboard />} />

        {/* --- Default Route --- */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;