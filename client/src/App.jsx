import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import safeAreaManager from './utils/safeArea'

// Landing Page
import Landing from "./pages/Landing";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import JobPreview from "./pages/JobPreview";
import Companies from "./pages/Companies";
import CareerAdvice from "./pages/CareerAdvice";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Candidate Pages
import CandidateDashboard from "./pages/candidate/Dashboard";
import CandidateProfile from "./pages/candidate/Profile";
import CandidateApplications from "./pages/candidate/Applications";
import CandidateBookmarks from "./pages/candidate/Bookmarks";
import CandidateResume from "./pages/candidate/Resume";
import CandidateLinkedInProfile from "./pages/candidate/LinkedInProfile";
import CandidateAccountSettings from "./pages/candidate/AccountSettings";
import TestInterface from "./pages/candidate/TestInterface";
// Import CandidateJobs component
import CandidateJobs from "./pages/candidate/Jobs";
// Import CandidateJobView component
import CandidateJobView from "./pages/candidate/JobView";

// Employer Pages
import EmployerDashboard from "./pages/employer/Dashboard";
import EmployerAdsList from "./pages/employer/AdsList";
import EmployerAdForm from "./pages/employer/AdForm";
import EmployerAdCandidates from "./pages/employer/AdCandidates";
import EmployerCandidates from "./pages/employer/Candidates";
import EmployerCompanyProfile from "./pages/employer/CompanyProfile";
import EmployerAccountSettings from "./pages/employer/AccountSettings";
import EmployerSubscription from "./pages/employer/Subscription";
import EmployerMou from "./pages/employer/Mou";
// Import new PremiumCandidates page
import PremiumCandidates from "./pages/employer/PremiumCandidates";
// Import EmployerJobView component
import EmployerJobView from "./pages/employer/JobView";

// Branch Admin Pages
import BranchAdminDashboard from "./pages/branch-admin/Dashboard";
import Employers from "./pages/branch-admin/Employers";
import CreateEmployer from "./pages/branch-admin/CreateEmployer";
import AdsApprovals from "./pages/branch-admin/AdsApprovals";
// import Subscriptions from './pages/branch-admin/Subscriptions'

import Screening from "./pages/branch-admin/Screening";
import Reports from "./pages/branch-admin/Reports";
import AdminProfile from "./pages/branch-admin/AdminProfile";
import BranchAdminAccountSettings from "./pages/branch-admin/AccountSettings";
import BranchAdminMou from "./pages/branch-admin/Mou";
import Logs from "./pages/branch-admin/Logs";

// Layout Components
import CandidateLayout from "./components/candidate/Layout";
import EmployerLayout from "./components/employer/Layout";
import BranchAdminLayout from "./components/branch-admin/Layout";
import ProtectedRoute from "./components/candidate/ProtectedRoute";
import EmployerRoute from "./routes/EmployerRoute";
import BranchAdminRoute from "./routes/BranchAdminRoute";

// Context Providers
import { ToastProvider } from "./components/ui/Toast";
import { CandidateProvider } from "./context/CandidateContext";
import { RoleProvider } from "./context/RoleContext";
import RoleAwareRoute from "./routes/RoleAwareRoute";

// Shared Pages
import CandidateProfileView from "./pages/candidate/CandidateProfileView";
// Import the PublicCandidateProfile component
import PublicCandidateProfile from "./pages/PublicCandidateProfile";
// Import Employer specific components
import AdCandidates from "./pages/employer/AdCandidates";
import Candidates from "./pages/employer/Candidates";
import EmployerCandidateProfileView from "./pages/employer/CandidateProfileView";
import CompanyProfile from "./pages/employer/CompanyProfile";
// Import new footer page components
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import DeleteAccount from "./pages/DeleteAccount";

function App() {
  const [pushToken, setPushToken] = useState(null);
  const [isNativePlatform, setIsNativePlatform] = useState(false);
  const [platformDetected, setPlatformDetected] = useState(false);

  // Initialize push notifications on component mount
  useEffect(() => {
    initializeCapacitor();
  }, []);

  // Initialize safe area manager in App component
  useEffect(() => {
    // Initialize safe area detection - no await needed as init() doesn't return a promise
    safeAreaManager.init();
    console.log('Safe area manager initialized');
    
    // Expose for debugging
    if (typeof window !== 'undefined') {
      window.safeAreaManager = safeAreaManager;
      console.log('SafeAreaManager exposed globally for debugging');
    }
  }, []);

  // Initialize Capacitor and push notifications
  const initializeCapacitor = async () => {
    try {
      // Check if we're in a mobile environment first
      if (typeof window !== "undefined" && window.Capacitor) {
        // Try to import Capacitor modules dynamically
        const { Capacitor } = await import("@capacitor/core");
        const isNative = Capacitor.isNativePlatform();
        setIsNativePlatform(isNative);

        if (isNative) {
          const { PushNotifications } = await import(
            "@capacitor/push-notifications"
          );
          await initPushNotifications(PushNotifications);
        }
      } else {
        console.log("Capacitor not available - running in web mode");
        setIsNativePlatform(false);
      }
    } catch (error) {
      console.log("Capacitor not available - running in web mode");
      setIsNativePlatform(false);
    } finally {
      setPlatformDetected(true);
    }
  };

  // Initialize push notifications
  const initPushNotifications = async (PushNotifications) => {
    try {
      // Check permissions
      const permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === "prompt") {
        const requestResult = await PushNotifications.requestPermissions();
        if (requestResult.receive !== "granted") {
          console.log("Push notification permissions denied");
          return;
        }
      } else if (permStatus.receive !== "granted") {
        console.log("Push notification permissions not granted");
        return;
      }

      // Register for push notifications
      await PushNotifications.register({
        showWhenInForeground: false,
      });

      // Add listeners
      addPushListeners(PushNotifications);
    } catch (error) {
      console.error("Error initializing push notifications:", error);
    }
  };

  // Add push notification listeners
  const addPushListeners = (PushNotifications) => {
    // Called when the app receives the registration token
    PushNotifications.addListener("registration", async (token) => {
      console.log("Push registration success, token: " + token.value);
      setPushToken(token.value);

      // Store token locally for later use
      localStorage.setItem("push_device_token", token.value);

      // Token will be sent to backend by authService after login
      await sendTokenToBackend(token.value);
    });

    // Called when there's an error during registration
    PushNotifications.addListener("registrationError", (error) => {
      console.error("Error on registration: " + JSON.stringify(error));
    });

    // Called when the app receives a push notification (foreground)
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("Push notification received (foreground): ", notification);
        // You can show a toast notification here
        // toast.info(notification.title, notification.body)
      },
    );

    // Called when user taps on a push notification (background/closed app)
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        console.log(
          "Push notification action performed (background): ",
          notification,
        );
        // Handle navigation or actions based on notification data
      },
    );
  };

  // Send device token to backend (only stores locally for later use)
  const sendTokenToBackend = async (deviceToken) => {
    console.log("📱 Device token received, storing locally for login:", {
      token: `${deviceToken.slice(0, 20)}...`,
    });
    // Token will be sent to backend by authService after login
  };

  // Manual registration trigger
  const handleRegisterForPush = async () => {
    if (!isNativePlatform) {
      alert("Push notifications only work on mobile devices");
      return;
    }

    try {
      await initializeCapacitor();
    } catch (error) {
      console.error("Error registering for push:", error);
      alert("Failed to register for push notifications");
    }
  };

  return (
    <ToastProvider>
      <CandidateProvider>
        <div className={`min-h-screen flex flex-col ${isNativePlatform ? 'safe-area-full capacitor-mobile capacitor-android' : ''}`}>
          {/* Push notification registration button - hidden to prevent UI overlap */}
          {false && isNativePlatform && (
            <div className="fixed top-4 right-4 z-50">
              <button
                onClick={handleRegisterForPush}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
                title={
                  pushToken
                    ? `Token: ${pushToken.slice(0, 20)}...`
                    : "Register for Push Notifications"
                }
              >
                {pushToken ? "🔔 Push Enabled" : "Register for Push"}
              </button>
            </div>
          )}
          <Routes>
            {/* Landing Page - Redirect mobile users to login */}
            <Route
              path="/"
              element={
                !platformDetected ? (
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-6">
                        <img
                          src="/images/logo.png"
                          alt="LokalHunt Logo"
                          className="h-14"
                        />
                      </div>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-4 text-sm text-gray-600">Loading...</p>
                    </div>
                  </div>
                ) : isNativePlatform ? (
                  <Navigate to="/login" replace />
                ) : (
                  <Landing />
                )
              }
            />

            {/* Jobs Page */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/career-advice" element={<CareerAdvice />} />
            <Route path="/job-preview/:jobId" element={<JobPreview />} />
            <Route path="/candidate/:id" element={<PublicCandidateProfile />} />
            {/* Footer Pages */}
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/delete-account" element={<DeleteAccount />} />

            {/* Dashboard redirect for logged in users */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CandidateLayout>
                    <CandidateDashboard />
                  </CandidateLayout>
                </ProtectedRoute>
              }
            />

            {/* Auth Routes (No Layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Legacy redirects */}
            <Route path="/candidate/login" element={<Login />} />
            <Route path="/candidate/register" element={<Register />} />

            {/* Protected Candidate Routes (With Layout) */}
            <Route
              path="/candidate"
              element={
                <ProtectedRoute>
                  <CandidateLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/candidate/dashboard" replace />}
              />
              <Route path="dashboard" element={<CandidateDashboard />} />
              <Route path="jobs" element={<CandidateJobs />} />
              <Route path="jobs/:id" element={<CandidateJobView />} />
              <Route path="applications" element={<CandidateApplications />} />
              <Route path="bookmarks" element={<CandidateBookmarks />} />
              <Route path="profile" element={<CandidateProfile />} />
              <Route path="resume" element={<CandidateResume />} />
              <Route path="settings" element={<CandidateAccountSettings />} />
              <Route
                path="account-settings"
                element={<CandidateAccountSettings />}
              />
              <Route
                path="profile/:candidateId"
                element={<CandidateProfileView />}
              />
            </Route>

            {/* Protected Employer Routes (With Layout) */}
            <Route
              path="/employer"
              element={
                <EmployerRoute>
                  <RoleProvider>
                    <EmployerLayout />
                  </RoleProvider>
                </EmployerRoute>
              }
            >
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="ads" element={<EmployerAdsList />} />
              <Route path="ads/new" element={<EmployerAdForm />} />
              <Route path="ads/:adId/edit" element={<EmployerAdForm />} />
              <Route
                path="ads/:adId/candidates"
                element={<EmployerAdCandidates />}
              />
              <Route path="candidates" element={<EmployerCandidates />} />
              <Route
                path="candidate/:candidateId/profile"
                element={<EmployerCandidateProfileView />}
              />
              <Route
                path="/employer/ads/:id/candidates"
                element={<AdCandidates />}
              />
              <Route path="/employer/candidates" element={<Candidates />} />
              <Route
                path="/employer/candidate/:candidateId/profile"
                element={<EmployerCandidateProfileView />}
              />
              <Route path="/employer/companies" element={<CompanyProfile />} />
              <Route
                path="/employer/premium-candidates"
                element={<PremiumCandidates />}
              />
              <Route path="subscription" element={<EmployerSubscription />} />
              <Route path="mou" element={<EmployerMou />} />
              <Route
                path="account-settings"
                element={<EmployerAccountSettings />}
              />
              <Route
                path="/employer/jobs/:adId"
                element={<EmployerJobView />}
              />
            </Route>

            {/* Protected Branch Admin Routes (With Layout) */}
            <Route
              path="/branch-admin"
              element={
                <BranchAdminRoute>
                  <RoleProvider>
                    <BranchAdminLayout />
                  </RoleProvider>
                </BranchAdminRoute>
              }
            >
              <Route path="dashboard" element={<BranchAdminDashboard />} />
              <Route path="employers" element={<Employers />} />
              <Route path="employers/new" element={<CreateEmployer />} />
              <Route path="ads" element={<AdsApprovals />} />
              {/* <Route path="subscriptions" element={<Subscriptions />} /> */}
              <Route
                path="employers/:employerId/dashboard"
                element={<EmployerDashboard />}
              />
              <Route
                path="employers/:employerId/ads"
                element={<EmployerAdsList />}
              />
              <Route
                path="employers/:employerId/ads/new"
                element={<EmployerAdForm />}
              />
              <Route
                path="employers/:employerId/ads/:adId/edit"
                element={<EmployerAdForm />}
              />
              <Route
                path="employers/:employerId/ads/:adId/candidates"
                element={<EmployerAdCandidates />}
              />
              <Route
                path="employers/:employerId/companies"
                element={<EmployerCompanyProfile />}
              />
              <Route
                path="employers/:employerId/subscription"
                element={<EmployerSubscription />}
              />

              <Route path="screening" element={<Screening />} />
              <Route path="reports" element={<Reports />} />
              <Route path="admin-profile" element={<AdminProfile />} />
              <Route
                path="account-settings"
                element={<BranchAdminAccountSettings />}
              />
              <Route path="mou" element={<BranchAdminMou />} />
              <Route path="logs" element={<Logs />} />

              {/* Branch Admin viewing Employer pages (Employer components within Branch Admin Layout) */}
              <Route
                path="employers/:employerId/dashboard"
                element={<EmployerDashboard />}
              />
              <Route
                path="employers/:employerId/ads"
                element={<EmployerAdsList />}
              />
              <Route
                path="employers/:employerId/ads/new"
                element={<EmployerAdForm />}
              />
              <Route
                path="employers/:employerId/ads/:adId/edit"
                element={<EmployerAdForm />}
              />
              <Route
                path="employers/:employerId/ads/:adId/candidates"
                element={<EmployerAdCandidates />}
              />
              <Route
                path="employers/:employerId/candidates"
                element={<EmployerCandidates />}
              />
              <Route
                path="employers/:employerId/companies"
                element={<EmployerCompanyProfile />}
              />
              <Route
                path="employers/:employerId/subscription"
                element={<EmployerSubscription />}
              />
              <Route
                path="employers/:employerId/premium-candidates"
                element={<PremiumCandidates />}
              />
              {/* Add branch admin employer job view route */}
              <Route
                path="employers/:employerId/ads/:adId"
                element={<EmployerJobView />}
              />
            </Route>
          </Routes>
        </div>
      </CandidateProvider>
    </ToastProvider>
  );
}

export default App;