import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
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
// Import CandidateJobs component
import CandidateJobs from './pages/candidate/Jobs';
// Import CandidateJobView component
import CandidateJobView from "./pages/candidate/JobView";


// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard'
import EmployerAdsList from './pages/employer/AdsList'
import EmployerAdForm from './pages/employer/AdForm'
import EmployerAdCandidates from './pages/employer/AdCandidates'
import EmployerCandidates from './pages/employer/Candidates'
import EmployerCompanyProfile from './pages/employer/CompanyProfile'
import EmployerAccountSettings from './pages/employer/AccountSettings'
import EmployerSubscription from './pages/employer/Subscription';
import EmployerMou from './pages/employer/Mou';

// Branch Admin Pages
import BranchAdminDashboard from './pages/branch-admin/Dashboard'
import Employers from './pages/branch-admin/Employers'
import CreateEmployer from './pages/branch-admin/CreateEmployer'
import AdsApprovals from './pages/branch-admin/AdsApprovals'
// import Subscriptions from './pages/branch-admin/Subscriptions'


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
import { RoleProvider } from './context/RoleContext'
import RoleAwareRoute from './routes/RoleAwareRoute'

// Shared Pages
import CandidateProfileView from './pages/candidate/CandidateProfileView'
// Import the PublicCandidateProfile component
import PublicCandidateProfile from './pages/PublicCandidateProfile'
// Import Employer specific components
import AdCandidates from "./pages/employer/AdCandidates";
import Candidates from "./pages/employer/Candidates";
import EmployerCandidateProfileView from "./pages/employer/CandidateProfileView";
import CompanyProfile from "./pages/employer/CompanyProfile";


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
              <Route path="/companies" element={<Companies />} />
              {/* Public Candidate Profile Route */}
              <Route path="/candidate/:candidateId/profile" element={<PublicCandidateProfile />} />

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
                <Route index element={<Navigate to="/candidate/dashboard" replace />} />
                <Route path="dashboard" element={<CandidateDashboard />} />
                <Route path="jobs" element={<CandidateJobs />} />
                <Route path="jobs/:id" element={<CandidateJobView />} />
                <Route path="applications" element={<CandidateApplications />} />
                <Route path="bookmarks" element={<CandidateBookmarks />} />
                <Route path="profile" element={<CandidateProfile />} />
                <Route path="resume" element={<CandidateResume />} />
                <Route path="settings" element={<CandidateAccountSettings />} />
                <Route path="account-settings" element={<CandidateAccountSettings />} />
                <Route path="profile/:candidateId" element={<CandidateProfileView />} />
              </Route>

              {/* Protected Employer Routes (With Layout) */}
              <Route path="/employer" element={
                <EmployerRoute>
                  <RoleProvider>
                    <EmployerLayout />
                  </RoleProvider>
                </EmployerRoute>
              }>
                <Route path="dashboard" element={<EmployerDashboard />} />
                <Route path="ads" element={<EmployerAdsList />} />
                <Route path="ads/new" element={<EmployerAdForm />} />
                <Route path="ads/:adId/edit" element={<EmployerAdForm />} />
                <Route path="ads/:adId/candidates" element={<EmployerAdCandidates />} />
                <Route path="candidates" element={<EmployerCandidates />} />
                <Route path="candidate/:candidateId/profile" element={<EmployerCandidateProfileView />} />
                <Route path="/employer/ads/:id/candidates" element={<AdCandidates />} />
                <Route path="/employer/candidates" element={<Candidates />} />
                <Route path="/employer/candidate/:candidateId/profile" element={<EmployerCandidateProfileView />} />
                <Route path="/employer/companies" element={<CompanyProfile />} />
                <Route path="subscription" element={<EmployerSubscription />} />
                <Route path="mou" element={<EmployerMou />} />
                <Route path="account-settings" element={<EmployerAccountSettings />} />
              </Route>

              {/* Protected Branch Admin Routes (With Layout) */}
              <Route path="/branch-admin" element={
                <BranchAdminRoute>
                  <RoleProvider>
                    <BranchAdminLayout />
                  </RoleProvider>
                </BranchAdminRoute>
              }>
                <Route path="dashboard" element={<BranchAdminDashboard />} />
                <Route path="employers" element={<Employers />} />
                <Route path="employers/new" element={<CreateEmployer />} />
                <Route path="ads" element={<AdsApprovals />} />
                {/* <Route path="subscriptions" element={<Subscriptions />} /> */}
                <Route path="employers/:employerId/dashboard" element={<EmployerDashboard />} />
                <Route path="employers/:employerId/ads" element={<EmployerAdsList />} />
                <Route path="employers/:employerId/ads/new" element={<EmployerAdForm />} />
                <Route path="employers/:employerId/ads/:adId/edit" element={<EmployerAdForm />} />
                <Route path="employers/:employerId/ads/:adId/candidates" element={<EmployerAdCandidates />} />
                <Route path="employers/:employerId/companies" element={<EmployerCompanyProfile />} />
                <Route path="employers/:employerId/subscription" element={<EmployerSubscription />} />

                <Route path="screening" element={<Screening />} />
                <Route path="reports" element={<Reports />} />
                <Route path="admin-profile" element={<AdminProfile />} />
                <Route path="account-settings" element={<BranchAdminAccountSettings />} />
                <Route path="mou" element={<BranchAdminMou />} />
                <Route path="logs" element={<Logs />} />

                {/* Branch Admin viewing Employer pages (Employer components within Branch Admin Layout) */}
                <Route path="employers/:employerId/dashboard" element={<EmployerDashboard />} />
                <Route path="employers/:employerId/ads" element={<EmployerAdsList />} />
                <Route path="employers/:employerId/ads/new" element={<EmployerAdForm />} />
                <Route path="employers/:employerId/ads/:adId/edit" element={<EmployerAdForm />} />
                <Route path="employers/:employerId/ads/:adId/candidates" element={<EmployerAdCandidates />} />
                <Route path="employers/:employerId/candidates" element={<EmployerCandidates />} />
                <Route path="employers/:employerId/companies" element={<EmployerCompanyProfile />} />
                <Route path="employers/:employerId/subscription" element={<EmployerSubscription />} />
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