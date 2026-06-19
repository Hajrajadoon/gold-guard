import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing still exists */}
        <Route path="/landing" element={<Landing />} />

        {/* DEFAULT → DASHBOARD */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}