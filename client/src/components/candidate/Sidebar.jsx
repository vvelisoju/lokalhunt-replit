import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BriefcaseIcon,
  BookmarkIcon,
  UserIcon,
  DocumentIcon,
  ChatBubbleLeftIcon,
  BeakerIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import logoImage from "../../assets/lokalhunt-logo.png";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    {
      name: t("sidebar.dashboard", "Dashboard"),
      href: "/candidate/dashboard",
      icon: HomeIcon,
    },
    {
      name: t("sidebar.browseJobs", "Browse Jobs"),
      href: "/candidate/jobs",
      icon: BriefcaseIcon,
    },
    {
      name: t("sidebar.appliedJobs", "Applied Jobs"),
      href: "/candidate/applications",
      icon: BriefcaseIcon,
    },
    {
      name: t("sidebar.bookmarks", "Bookmarks"),
      href: "/candidate/bookmarks",
      icon: BookmarkIcon,
    },
    {
      name: t("sidebar.myProfile", "My Digital Resume"),
      href: "/candidate/profile",
      icon: UserIcon,
    },
    {
      name: t("sidebar.manageResume", "Manage Resume"),
      href: "/candidate/resume",
      icon: DocumentIcon,
    },
  ];

  const developmentNav = [
    {
      name: t("sidebar.testInterface", "Test Interface"),
      href: "/candidate/test",
      icon: BeakerIcon,
    },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Mobile overlay with blur effect */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Full width on mobile, native mobile design */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-full sm:w-80 lg:w-64 bg-white lg:bg-white lg:border-r lg:border-gray-200 
        transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:shadow-none shadow-2xl
      `}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between h-16 px-4 lg:px-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-secondary-50 lg:justify-center lg:border-neutral-200">
          <Link
            to="/candidate/dashboard"
            onClick={onClose}
            className="flex items-center hover:scale-105 transition-transform duration-200"
          >
            <img
              src={logoImage}
              alt="LokalHunt"
              className="h-12 lg:h-14 w-auto object-contain"
            />
          </Link>
          
          {/* Close button - visible only on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-full hover:bg-white hover:bg-opacity-80 transition-all duration-200 active:scale-95"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Navigation - Mobile optimized spacing */}
        <nav className="mt-6 px-4 lg:mt-8 lg:px-4">
          <ul className="space-y-1 lg:space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center px-4 lg:px-3 py-4 lg:py-2.5 text-base lg:text-sm font-medium rounded-xl lg:rounded-lg 
                      transition-all duration-200 active:scale-[0.98] lg:hover:scale-[1.02]
                      ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg lg:shadow-md"
                          : "text-gray-700 hover:bg-gray-50 lg:hover:bg-gray-100 hover:text-green-600 active:bg-gray-100"
                      }
                    `}
                  >
                    <Icon className="mr-4 lg:mr-3 h-6 w-6 lg:h-5 lg:w-5 flex-shrink-0" />
                    <span className="font-medium lg:font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile completion card - Mobile optimized */}
        <div className="mt-8 mx-4 lg:mt-8 lg:mx-4 lg:hidden lg:lg:block">
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-4 border border-primary-100 shadow-sm">
            <h3 className="text-sm font-semibold text-primary-900 mb-2">
              {t("sidebar.completeProfile", "Complete Your Profile")}
            </h3>
            <div className="w-full bg-primary-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-gradient-to-r from-primary-600 to-secondary-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: "75%" }}
              ></div>
            </div>
            <p className="text-xs text-primary-700 mb-3 font-medium">
              {t("sidebar.percentComplete", "{{percent}}% complete", {
                percent: 75,
              })}
            </p>
            <Link
              to="/candidate/profile"
              onClick={onClose}
              className="block w-full bg-gradient-brand text-white text-center py-2.5 px-3 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {t("dashboard.completeProfileButton", "Complete Profile")}
            </Link>
          </div>
        </div>

        {/* Mobile-specific bottom spacing */}
        <div className="h-8 lg:h-0"></div>
      </div>
    </>
  );
};

export default Sidebar;
