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
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import logoImage from "../../assets/lokalhunt-logo.png";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    {
      name: t("sidebar.home", "Home"),
      href: "/candidate/dashboard",
      icon: HomeIcon,
    },
    {
      name: t("sidebar.findJobs", "Find Jobs"),
      href: "/candidate/jobs",
      icon: BriefcaseIcon,
    },
    {
      name: t("sidebar.myApplications", "My Applications"),
      href: "/candidate/applications",
      icon: BriefcaseIcon,
    },
    {
      name: t("sidebar.savedJobs", "Saved Jobs"),
      href: "/candidate/bookmarks",
      icon: BookmarkIcon,
    },
    {
      name: t("sidebar.myProfile", "My Profile"),
      href: "/candidate/profile",
      icon: UserIcon,
    },
    {
      name: t("sidebar.myResume", "My Resume"),
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
        {/* Mobile Header with Close Button - Native iOS/Android style */}
        <div className="relative flex items-center justify-between h-16 px-5 border-b border-gray-100 bg-white lg:bg-gradient-to-r lg:from-primary-50 lg:to-secondary-50 lg:border-neutral-200 lg:h-20 lg:justify-center">
          {/* Logo - Left aligned on mobile, centered on desktop */}
          <Link
            to="/candidate/dashboard"
            onClick={onClose}
            className="flex items-center lg:hover:scale-105 transition-transform duration-200"
          >
            <img
              src={logoImage}
              alt="LokalHunt"
              className="h-10 lg:h-16 w-auto object-contain"
            />
          </Link>

          {/* Close button - Mobile native style */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 active:scale-95"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation - Mobile native list style */}
        <div className="flex-1 overflow-y-auto bg-gray-50 lg:bg-white">
          <nav className="pt-2 lg:mt-8 lg:px-4">
            <ul className="space-y-0 lg:space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center px-5 py-4 lg:px-3 lg:py-3 text-base lg:text-sm font-medium lg:rounded-lg 
                        transition-all duration-200 active:bg-gray-200 lg:active:scale-[0.98] lg:hover:scale-[1.02] 
                        min-h-[52px] lg:min-h-[44px] border-b border-gray-200 lg:border-0
                        ${
                          isActive(item.href)
                            ? "bg-blue-50 text-blue-600 border-l-4 border-l-blue-600 lg:border-l-0 lg:bg-gradient-to-r lg:from-green-500 lg:to-blue-500 lg:text-white lg:shadow-lg"
                            : "text-gray-700 bg-white hover:bg-gray-100 lg:hover:bg-gray-100 lg:hover:text-green-600"
                        }
                      `}
                    >
                      <Icon className={`mr-4 lg:mr-3 h-6 w-6 lg:h-5 lg:w-5 flex-shrink-0 ${
                        isActive(item.href) ? "text-blue-600 lg:text-white" : "text-gray-500"
                      }`} />
                      <span className={`font-medium lg:font-medium text-base lg:text-sm ${
                        isActive(item.href) ? "text-blue-600 lg:text-white" : "text-gray-900"
                      }`}>
                        {item.name}
                      </span>
                      {/* iOS style chevron indicator for active item on mobile */}
                      {isActive(item.href) && (
                        <div className="ml-auto lg:hidden">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Help/Support Section */}
        {/* <div className="mt-6 px-4 lg:mt-6 lg:px-4">
          <div className="border-t border-gray-200 pt-4">
            <Link
              to="/help-center"
              onClick={onClose}
              className="group flex items-center px-4 lg:px-3 py-4 lg:py-2.5 text-base lg:text-sm font-medium rounded-xl lg:rounded-lg 
                text-gray-700 hover:bg-gray-50 lg:hover:bg-gray-100 hover:text-blue-600 active:bg-gray-100
                transition-all duration-200 active:scale-[0.98] lg:hover:scale-[1.02]"
            >
              <QuestionMarkCircleIcon className="mr-4 lg:mr-3 h-6 w-6 lg:h-5 lg:w-5 flex-shrink-0" />
              <span className="font-medium lg:font-medium">
                {t("sidebar.helpSupport", "Help / Support")}
              </span>
            </Link>
          </div>
        </div> */}

        {/* Profile completion card - Mobile optimized */}
        {/* <div className="mt-8 mx-4 lg:mt-8 lg:mx-4 lg:hidden lg:lg:block">
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
        </div> */}

        {/* Mobile-specific bottom safe area */}
        <div className="h-8 lg:h-0 bg-gray-50 lg:bg-white border-t border-gray-200 lg:border-0"></div>
      </div>
    </>
  );
};

export default Sidebar;
