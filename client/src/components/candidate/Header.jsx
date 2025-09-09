import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bars3Icon,
  BellIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCandidateAuth } from "../../hooks/useCandidateAuth";
import { useTranslation } from "react-i18next";
import ProfileDropdown from "../ui/ProfileDropdown";
import NotificationBell from "../ui/NotificationBell";

const Header = ({ onMenuClick, isMenuOpen }) => {
  const { user, logout } = useCandidateAuth();
  const { t, i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're running in Capacitor (mobile app)
    const checkMobileEnvironment = async () => {
      try {
        if (typeof window !== "undefined" && window.Capacitor) {
          const { Capacitor } = await import("@capacitor/core");
          setIsMobile(Capacitor.isNativePlatform());
        }
      } catch (error) {
        setIsMobile(false);
      }
    };
    checkMobileEnvironment();
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header
      className={`bg-white border-b border-neutral-200 px-4 py-2 sm:px-6 lg:px-8 ${isMobile ? "safe-top mobile-header fixed-header" : ""}`}
    >
      <div className="flex items-center justify-between h-full">
        {/* Left side - Mobile menu button + Logo */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-3 sm:p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
            onClick={onMenuClick}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          {/* Logo - visible on mobile */}
          <div className="ml-3 lg:hidden">
            <img
              src="/images/logo.png"
              alt="LokalHunt"
              className="h-10 w-auto"
            />
          </div>

          {/* Page title - hidden on small screens where sidebar logo is visible */}
          <h1 className="ml-4 text-2xl font-semibold text-neutral-900 lg:ml-0 hidden sm:block lg:hidden">
            {t("dashboard.title", "Dashboard")}
          </h1>
        </div>

        {/* Right side - Apply Job + Language + Notifications + User menu */}
        <div className="flex items-center space-x-3">
          {/* Browse Jobs Button - Hidden on mobile */}
          <Link
            to="/candidate/jobs"
            className="hidden sm:flex w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full items-center justify-center transition-colors duration-200"
            title="Browse Jobs"
          >
            <BriefcaseIcon className="w-4 h-4 text-white" />
          </Link>

          {/* Language Switcher - hidden on mobile */}
          <div className="relative hidden sm:block">
            <button
              className="p-2 text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full transition-colors"
              onClick={() =>
                changeLanguage(i18n.language === "en" ? "te" : "en")
              }
            >
              <GlobeAltIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* User dropdown */}
          <ProfileDropdown
            user={{
              ...user,
              role: "CANDIDATE",
              // Ensure name fields are properly mapped - check multiple nested levels
              firstName:
                user?.firstName ||
                user?.user?.firstName ||
                user?.data?.firstName,
              lastName:
                user?.lastName || user?.user?.lastName || user?.data?.lastName,
              name:
                user?.name ||
                user?.fullName ||
                user?.user?.name ||
                user?.data?.name,
              email: user?.email || user?.user?.email || user?.data?.email,
              profileImage:
                user?.profileImage ||
                user?.profilePhoto ||
                user?.user?.profileImage ||
                user?.data?.profileImage,
            }}
            logout={logout}
            onLanguageChange={changeLanguage}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;