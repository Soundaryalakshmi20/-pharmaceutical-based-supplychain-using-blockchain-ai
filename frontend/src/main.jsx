import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './index.css';
import './styles/enhanced.css';
import { OfflineProvider } from './context/OfflineContext';
import OfflineIndicator from './components/OfflineIndicator';
import { register as registerSW } from './utils/serviceWorkerRegistration';

// Public
import LoginPage from './pages/LoginPage';
import PatientVerify from './pages/patient/PatientVerify';
import PatientScan from './pages/patient/PatientScan';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMedicines from './pages/admin/ManageMedicines';
import ManageBatches from './pages/admin/ManageBatches';
import RegulatoryManager from './pages/admin/RegulatoryManager';
import AlertsPage from './pages/admin/AlertsPage';
import BlockchainHistory from './pages/admin/BlockchainHistory';
import CDSCOManager from './pages/admin/CDSCOManager';
import PatientsPage from './pages/admin/PatientsPage';
import PrescriptionsPage from './pages/admin/PrescriptionsPage';
import BillingPage from './pages/admin/BillingPage';
import DrugInteractionsPage from './pages/admin/DrugInteractionsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Distributor
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import ReceiveMedicine from './pages/distributor/ReceiveMedicine';
import TransferMedicine from './pages/distributor/TransferMedicine';
import DistributorGenerateQR from './pages/distributor/DistributorGenerateQR';

// Pharmacy
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import DispenseMedicine from './pages/pharmacy/DispenseMedicine';

// Shared
import InventoryPage from './pages/shared/InventoryPage';
import ScanVerify from './pages/shared/ScanVerify';

// Icons for Nav
import { LayoutDashboard, Package, Box, ShieldAlert, Bell, Database, Download, Truck, Activity, ScanLine, QrCode, Users, FileText, DollarSign, AlertTriangle, BarChart3, ClipboardList } from 'lucide-react';

const adminNav = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/medicines', label: 'Medicines', icon: Package },
  { path: '/admin/batches', label: 'Batches', icon: Box },
  { path: '/admin/cdsco', label: 'CDSCO Data', icon: ShieldAlert },
  { path: '/admin/regulatory', label: 'Regulatory', icon: ShieldAlert },
  { path: '/admin/alerts', label: 'System Alerts', icon: Bell },
  { path: '/admin/blockchain', label: 'Audit Trail', icon: Database },
  { path: '/admin/patients', label: 'Patients', icon: Users },
  { path: '/admin/prescriptions', label: 'Prescriptions', icon: FileText },
  { path: '/admin/billing', label: 'Billing', icon: DollarSign },
  { path: '/admin/drug-interactions', label: 'Drug Checker', icon: AlertTriangle },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
];

const distributorNav = [
  { path: '/distributor', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/distributor/receive', label: 'Receive Stock', icon: Download },
  { path: '/distributor/transfer', label: 'Transfer Stock', icon: Truck },
  { path: '/distributor/inventory', label: 'My Inventory', icon: Package },
  { path: '/distributor/generate-qr', label: 'Generate QR Codes', icon: QrCode },
  { path: '/distributor/scan', label: 'Scan & Verify', icon: ScanLine },
];

const pharmacyNav = [
  { path: '/pharmacy', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pharmacy/receive', label: 'Receive Stock', icon: Download },
  { path: '/pharmacy/dispense', label: 'Dispense', icon: Activity },
  { path: '/pharmacy/inventory', label: 'My Inventory', icon: Package },
  { path: '/pharmacy/scan', label: 'Scan & Verify', icon: ScanLine },
];

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerSW({
      onUpdate: (registration) => {
        console.log('[App] New content available — refresh to update');
      },
      onSuccess: (registration) => {
        console.log('[App] Content cached for offline use');
      },
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OfflineProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify/:serialNumber" element={<PatientVerify />} />
          <Route path="/scan" element={<PatientScan />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<Layout title="Admin Dashboard" navLinks={adminNav}><AdminDashboard /></Layout>} />
            <Route path="/admin/medicines" element={<Layout title="Manage Medicines" navLinks={adminNav}><ManageMedicines /></Layout>} />
            <Route path="/admin/batches" element={<Layout title="Manage Batches" navLinks={adminNav}><ManageBatches /></Layout>} />
            <Route path="/admin/cdsco" element={<Layout title="CDSCO Regulatory Data" navLinks={adminNav}><CDSCOManager /></Layout>} />
            <Route path="/admin/regulatory" element={<Layout title="Regulatory Manager" navLinks={adminNav}><RegulatoryManager /></Layout>} />
            <Route path="/admin/alerts" element={<Layout title="System Alerts" navLinks={adminNav}><AlertsPage /></Layout>} />
            <Route path="/admin/blockchain" element={<Layout title="Blockchain Audit Trail" navLinks={adminNav}><BlockchainHistory /></Layout>} />
            <Route path="/admin/patients" element={<Layout title="Patient Records" navLinks={adminNav}><PatientsPage /></Layout>} />
            <Route path="/admin/prescriptions" element={<Layout title="Prescriptions" navLinks={adminNav}><PrescriptionsPage /></Layout>} />
            <Route path="/admin/billing" element={<Layout title="Billing & Invoicing" navLinks={adminNav}><BillingPage /></Layout>} />
            <Route path="/admin/drug-interactions" element={<Layout title="Drug Interaction Checker" navLinks={adminNav}><DrugInteractionsPage /></Layout>} />
            <Route path="/admin/reports" element={<Layout title="Reports & Analytics" navLinks={adminNav}><ReportsPage /></Layout>} />
            <Route path="/admin/audit-logs" element={<Layout title="Audit Trail Logs" navLinks={adminNav}><AuditLogsPage /></Layout>} />
          </Route>

          {/* Distributor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['DISTRIBUTOR']} />}>
            <Route path="/distributor" element={<Layout title="Distributor Dashboard" navLinks={distributorNav}><DistributorDashboard /></Layout>} />
            <Route path="/distributor/receive" element={<Layout title="Receive Medicine" navLinks={distributorNav}><ReceiveMedicine /></Layout>} />
            <Route path="/distributor/transfer" element={<Layout title="Transfer Medicine" navLinks={distributorNav}><TransferMedicine /></Layout>} />
            <Route path="/distributor/inventory" element={<Layout title="My Inventory" navLinks={distributorNav}><InventoryPage /></Layout>} />
            <Route path="/distributor/generate-qr" element={<Layout title="Generate QR Codes" navLinks={distributorNav}><DistributorGenerateQR /></Layout>} />
            <Route path="/distributor/scan" element={<Layout title="Scan & Verify" navLinks={distributorNav}><ScanVerify /></Layout>} />
          </Route>

          {/* Pharmacy Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PHARMACY']} />}>
            <Route path="/pharmacy" element={<Layout title="Pharmacy Dashboard" navLinks={pharmacyNav}><PharmacyDashboard /></Layout>} />
            <Route path="/pharmacy/receive" element={<Layout title="Receive Medicine" navLinks={pharmacyNav}><ReceiveMedicine /></Layout>} />
            <Route path="/pharmacy/dispense" element={<Layout title="Dispense Medicine" navLinks={pharmacyNav}><DispenseMedicine /></Layout>} />
            <Route path="/pharmacy/inventory" element={<Layout title="My Inventory" navLinks={pharmacyNav}><InventoryPage /></Layout>} />
            <Route path="/pharmacy/scan" element={<Layout title="Scan & Verify" navLinks={pharmacyNav}><ScanVerify /></Layout>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <OfflineIndicator />
        </OfflineProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
