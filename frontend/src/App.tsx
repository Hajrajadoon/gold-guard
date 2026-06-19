import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
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

        {/* RECORDS */}
        <Route path="/records" element={<Records />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}