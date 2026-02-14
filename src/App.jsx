import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

import HelpSupport from './pages/HelpSupport';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';


// Public Pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FAQ from "./pages/FAQ";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";

// Citizen Services
import TrafficFines from "./pages/TrafficFines";
import CrimeReports from "./pages/CrimeReports";
import LostItems from "./pages/LostItems";
import MissingPersons from "./pages/MissingPersons";
import GDReports from "./pages/GDReports";
import PCC from "./pages/PCC";
import SOS from "./pages/SOS";
import CrimeMap from "./pages/CrimeMap";
import CrimeRiskMap from "./pages/CrimeRiskMap";
import SafeRoute from "./pages/SafeRoute";
import PaymentMethod from "./pages/PaymentMethod";

// Officer Tools
import CrimePrediction from "./pages/CrimePrediction";
import PatrollingHeatmap from "./pages/PatrollingHeatmap";
import CriminalSearch from "./pages/CriminalSearch";

// Officer Feature Pages
import GDPage from "./pages/GDPage";
import ReviewReports from "./pages/ReviewReports";
import MissingPersonManagement from "./pages/MissingPersonManagement";
import PCCApproval from "./pages/PCCApproval";
import SOSMonitoring from "./pages/SOSMonitoring";
import CrimePredictionAnalytics from "./pages/CrimePredictionAnalytics";

// Admin Feature Pages
import OfficerPerformanceAnalytics from "./pages/OfficerPerformanceAnalytics";
import AuditLogs from "./pages/AuditLogs";
import CrimeTrendsDashboard from "./pages/CrimeTrendsDashboard";
import AlertBroadcasting from "./pages/AlertBroadcasting";
import SystemConfigPanel from "./pages/SystemConfigPanel";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />

        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Common Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Role-Based Dashboards */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />

          {/* Citizen Services */}
          <Route path="/traffic-fines" element={<TrafficFines />} />
          <Route path="/crime-reports" element={<CrimeReports />} />
          <Route path="/crime-reports/submit" element={<CrimeReports />} />
          <Route path="/lost-items" element={<LostItems />} />
          <Route path="/lost-items/report" element={<LostItems />} />
          <Route path="/missing-persons" element={<MissingPersons />} />
          <Route path="/missing-persons/report" element={<MissingPersons />} />
          <Route path="/gd-reports" element={<GDReports />} />
          <Route path="/pcc" element={<PCC />} />
          <Route path="/pcc/apply" element={<PCC />} />
          <Route path="/sos" element={<SOS />} />
          <Route path="/crime-map" element={<CrimeMap />} />
          <Route path="/citizen/crime-risk-map" element={<CrimeRiskMap />} />
          <Route path="/citizen/safe-route" element={<SafeRoute />} />
          <Route path="/payment-method" element={<PaymentMethod />} />

          {/* Officer Tools */}
          <Route path="/officer/crime-prediction" element={<CrimePrediction />} />
          <Route path="/officer/patrolling-heatmap" element={<PatrollingHeatmap />} />
          <Route path="/officer/criminal-search" element={<CriminalSearch />} />

          {/* Officer Feature Pages */}
          <Route path="/officer/gd" element={<GDPage />} />
          <Route path="/officer/reports" element={<ReviewReports />} />
          <Route path="/officer/missing-persons-management" element={<MissingPersonManagement />} />
          <Route path="/officer/pcc-approval" element={<PCCApproval />} />
          <Route path="/officer/sos-monitoring" element={<SOSMonitoring />} />
          <Route path="/officer/crime-prediction-analytics" element={<CrimePredictionAnalytics />} />

          {/* Admin Feature Pages */}
          <Route path="/admin/officer-performance" element={<OfficerPerformanceAnalytics />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/crime-trends" element={<CrimeTrendsDashboard />} />
          <Route path="/admin/alerts" element={<AlertBroadcasting />} />
          <Route path="/admin/config" element={<SystemConfigPanel />} />

          <Route path="/help" element={<HelpSupport />} />
<Route path="/privacy-policy" element={<PrivacyPolicy />} />
<Route path="/terms-conditions" element={<TermsConditions />} />

        </Routes>

        <Footer />
      </Router>
    </AuthProvider>
  );
}
