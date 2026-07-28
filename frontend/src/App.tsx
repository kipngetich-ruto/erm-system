import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import LabResults from './pages/LabResults';
import Billing from './pages/Billing';
import AuditLogs from './pages/AuditLogs';
import Unauthorized from './pages/Unauthorized';
import TwoFactorSetup from './pages/TwoFactorSetup';
import SecuritySettings from './pages/SecuritySettings';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/records" element={<MedicalRecords />} />
            <Route path="/lab" element={<LabResults />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/setup-2fa" element={<TwoFactorSetup />} />
            <Route path="/security" element={<SecuritySettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;