import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Landing Page
import Landing from './pages/Landing'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import JobPreview from './pages/JobPreview'
import Companies from './pages/Companies'

// Auth Pages
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// Candidate Pages
import CandidateDashboard from './pages/candidate/Dashboard'
import CandidateProfile from './pages/candidate/Profile'
import CandidateApplications from './pages/candidate/Applications'
import CandidateBookmarks from './pages/candidate/Bookmarks'
import CandidateResume from './pages/candidate/Resume'
import CandidateLinkedInProfile from './pages/candidate/LinkedInProfile'
import CandidateAccountSettings from './pages/candidate/AccountSettings'
import TestInterface from './pages/candidate/TestInterface'

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard'
import EmployerAdsList from './pages/employer/AdsList'
import EmployerAdForm from './pages/employer/AdForm'
import EmployerAdCandidates from './pages/employer/AdCandidates'
import EmployerCandidates from './pages/employer/Candidates'
import EmployerCompanyProfile from './pages/employer/CompanyProfile'
import EmployerAccountSettings from './pages/employer/AccountSettings'
import EmployerMou from './pages/employer/Mou'

// Branch Admin Pages
import BranchAdminDashboard from './pages/branch-admin/Dashboard'
import Employers from './pages/branch-admin/Employers'
import CreateEmployer from './pages/branch-admin/CreateEmployer'
import EmployerDetails from './pages/branch-admin/EmployerDetails'
import AdsApprovals from './pages/branch-admin/AdsApprovals'
import Screening from './pages/branch-admin/Screening'
import Reports from './pages/branch-admin/Reports'
import AdminProfile from './pages/branch-admin/AdminProfile'
import BranchAdminAccountSettings from './pages/branch-admin/AccountSettings'
import BranchAdminMou from './pages/branch-admin/Mou'
import Logs from './pages/branch-admin/Logs'

// Layout Components
import CandidateLayout from './components/candidate/Layout'
import EmployerLayout from './components/employer/Layout'
import BranchAdminLayout from './components/branch-admin/Layout'
import ProtectedRoute from './components/candidate/ProtectedRoute'
import EmployerRoute from './routes/EmployerRoute'
import BranchAdminRoute from './routes/BranchAdminRoute'

// Context Providers
import { ToastProvider } from './components/ui/Toast'
import { CandidateProvider } from './context/CandidateContext'

function App() {
  return (
    <ToastProvider>
      <CandidateProvider>
        <div className="min-h-screen flex flex-col">
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<Landing />} />

              {/* Jobs Page */}
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/jobs/:id/preview" element={<JobPreview />} />

              {/* Companies Page */}
              <Route path="/companies" element={<Companies />} />

              {/* Dashboard redirect for logged in users */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <CandidateLayout>
                    <CandidateDashboard />
                  </CandidateLayout>
                </ProtectedRoute>
              } />

              {/* Auth Routes (No Layout) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Legacy redirects */}
              <Route path="/candidate/login" element={<Login />} />
              <Route path="/candidate/register" element={<Register />} />

              {/* Protected Candidate Routes (With Layout) */}
              <Route path="/candidate" element={
                <ProtectedRoute>
                  <CandidateLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<CandidateDashboard />} />
                <Route path="profile" element={<CandidateProfile />} />
                <Route path="applications" element={<CandidateApplications />} />
                <Route path="bookmarks" element={<CandidateBookmarks />} />
                <Route path="resume" element={<CandidateResume />} />
                <Route path="linkedin-profile" element={<CandidateLinkedInProfile />} />
                <Route path="account-settings" element={<CandidateAccountSettings />} />
                <Route path="test" element={<TestInterface />} />
              </Route>

              {/* Protected Employer Routes (With Layout) */}
              <Route path="/employer" element={
                <EmployerRoute>
                  <EmployerLayout />
                </EmployerRoute>
              }>
                <Route path="dashboard" element={<EmployerDashboard />} />
                <Route path="ads" element={<EmployerAdsList />} />
                <Route path="ads/new" element={<EmployerAdForm />} />
                <Route path="ads/:adId/edit" element={<EmployerAdForm />} />
                <Route path="ads/:adId/candidates" element={<EmployerAdCandidates />} />
                <Route path="candidates" element={<EmployerCandidates />} />
                <Route path="company-profile" element={<EmployerCompanyProfile />} />
                <Route path="account-settings" element={<EmployerAccountSettings />} />
                <Route path="mou" element={<EmployerMou />} />
              </Route>

              {/* Protected Branch Admin Routes (With Layout) */}
              <Route path="/branch-admin" element={
                <BranchAdminRoute>
                  <BranchAdminLayout />
                </BranchAdminRoute>
              }>
                <Route path="dashboard" element={<BranchAdminDashboard />} />
                <Route path="employers" element={<Employers />} />
                <Route path="employers/new" element={<CreateEmployer />} />
                <Route path="employers/:employerId" element={<EmployerDetails />} />
                <Route path="employers/:employerId/:tab" element={<EmployerDetails />} />
                <Route path="ads-approvals" element={<AdsApprovals />} />
                <Route path="screening" element={<Screening />} />
                <Route path="reports" element={<Reports />} />
                <Route path="admin-profile" element={<AdminProfile />} />
                <Route path="account-settings" element={<BranchAdminAccountSettings />} />
                <Route path="mou" element={<BranchAdminMou />} />
                <Route path="logs" element={<Logs />} />
              </Route>
            </Routes>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </CandidateProvider>
    </ToastProvider>
  )
}

export default App