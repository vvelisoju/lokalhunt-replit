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
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Mobile optimized */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-secondary-50">
          <Link
            to="/candidate/dashboard"
            className="flex items-center hover:scale-105 transition-transform duration-200"
          >
            <img
              src={logoImage}
              alt="LokalHunt"
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02]
                      ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 hover:text-green-600"
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile completion card - Mobile optimized */}
        <div className="mt-8 mx-4 hidden lg:block">
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
              className="block w-full bg-gradient-brand text-white text-center py-2.5 px-3 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              {t("dashboard.completeProfileButton", "Complete Profile")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
