import React from 'react';
import { BrowserRouter, Routes, Route } from './router';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import BusinessRegister from './pages/BusinessRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ApprovalsList from './pages/ApprovalsList';
import ApprovalForm from './pages/ApprovalForm';
import ApprovalDetail from './pages/ApprovalDetail';
import DocumentsList from './pages/DocumentsList';
import DocumentForm from './pages/DocumentForm';
import DocumentDetail from './pages/DocumentDetail';
import ApplyPage from './pages/ApplyPage';
import ApplicationsList from './pages/ApplicationsList';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationDetail from './pages/ApplicationDetail';
import RenewalsList from './pages/RenewalsList';
import RenewalDetail from './pages/RenewalDetail';
import BusinessProfile from './pages/BusinessProfile';
import IncentivesList from './pages/IncentivesList';
import IncentiveDetail from './pages/IncentiveDetail';
import AlertsCenter from './pages/AlertsCenter';
import GraceAssistantPage from './pages/GraceAssistantPage';
import HelpSupport from './pages/HelpSupport';
import SettingsPage from './pages/Settings';
import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/business" element={<BusinessRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-profile"
            element={
              <ProtectedRoute>
                <BusinessProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <ApprovalsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals/new"
            element={
              <ProtectedRoute>
                <ApprovalForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals/:id/edit"
            element={
              <ProtectedRoute>
                <ApprovalForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals/:id"
            element={
              <ProtectedRoute>
                <ApprovalDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/new"
            element={
              <ProtectedRoute>
                <DocumentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id/edit"
            element={
              <ProtectedRoute>
                <DocumentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <ProtectedRoute>
                <DocumentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply"
            element={
              <ProtectedRoute>
                <ApplyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <ApplicationsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/new"
            element={
              <ProtectedRoute>
                <ApplicationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id/edit"
            element={
              <ProtectedRoute>
                <ApplicationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute>
                <ApplicationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/renewals"
            element={
              <ProtectedRoute>
                <RenewalsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/renewals/:id"
            element={
              <ProtectedRoute>
                <RenewalDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incentives"
            element={
              <ProtectedRoute>
                <IncentivesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incentives/:id"
            element={
              <ProtectedRoute>
                <IncentiveDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AlertsCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sneha"
            element={
              <ProtectedRoute>
                <GraceAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grace"
            element={
              <ProtectedRoute>
                <GraceAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpSupport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
