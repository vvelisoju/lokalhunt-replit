import React from "react";
import { Bars3Icon, BellIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useCandidateAuth } from "../../hooks/useCandidateAuth";
import { useTranslation } from "react-i18next";
import ProfileDropdown from "../ui/ProfileDropdown";

const Header = ({ onMenuClick }) => {
  const { user, logout } = useCandidateAuth();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-white border-b border-neutral-200 px-4 py-3 sm:px-6 lg:px-8 h-16">
      <div className="flex items-center justify-between h-full">
        {/* Left side - Mobile menu button + Logo */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
            onClick={onMenuClick}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Page title - hidden on small screens where sidebar logo is visible */}
          <h1 className="ml-4 text-2xl font-semibold text-neutral-900 lg:ml-0 hidden sm:block lg:hidden">
            {t("dashboard.title", "Dashboard")}
          </h1>
        </div>

        {/* Right side - Language + Notifications + User menu */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <div className="relative">
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
          <button className="relative p-2 text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full transition-colors">
            <BellIcon className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-secondary-500 ring-2 ring-white"></span>
          </button>

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
