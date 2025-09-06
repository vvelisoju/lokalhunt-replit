import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  HomeIcon,
  BuildingOfficeIcon,
  DocumentCheckIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useRole } from "../../context/RoleContext";
import logoImage from "../../assets/lokalhunt-logo.png";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { employerId } = useParams();
  const { t } = useTranslation();
  const { targetEmployer } = useRole();

  // Check if we're in an employer context
  const isInEmployerContext =
    location.pathname.startsWith("/branch-admin/employers/") && employerId;

  const navigation = [
    {
      name: t("branchAdmin.sidebar.dashboard", "Dashboard"),
      href: "/branch-admin/dashboard",
      icon: HomeIcon,
    },
    {
      name: t("branchAdmin.sidebar.employers", "Employers"),
      href: "/branch-admin/employers",
      icon: BuildingOfficeIcon,
    },
    {
      name: t("branchAdmin.sidebar.adsApproval", "Ads Approval"),
      href: "/branch-admin/ads",
      icon: DocumentCheckIcon,
    },
    {
      name: t("branchAdmin.sidebar.screening", "Candidate Screening"),
      href: "/branch-admin/screening",
      icon: UsersIcon,
    },
    /* MOU Management - Commented out as not in use
        {
          name: 'MOU Management',
          href: '/branch-admin/mou',
          icon: DocumentTextIcon,
          current: location.pathname === '/branch-admin/mou'
        },
        */
    {
      name: t("branchAdmin.sidebar.profile", "Admin Profile"),
      href: "/branch-admin/profile",
      icon: UsersIcon,
    },
    {
      name: t("branchAdmin.sidebar.reports", "Reports"),
      href: "/branch-admin/reports",
      icon: ChartBarIcon,
    },
    {
      name: t("branchAdmin.sidebar.logs", "Activity Logs"),
      href: "/branch-admin/logs",
      icon: ClipboardDocumentListIcon,
    },
  ];

  // Employer submenu items (mirrors Employer navigation)
  const employerSubmenuItems = [
    {
      name: "Dashboard",
      href: `/branch-admin/employers/${employerId}/dashboard`,
      icon: HomeIcon,
    },
    {
      name: "Ads",
      href: `/branch-admin/employers/${employerId}/ads`,
      icon: DocumentTextIcon,
    },
    {
      name: "Candidates",
      href: `/branch-admin/employers/${employerId}/candidates`,
      icon: UsersIcon,
    },
    {
      name: "Companies",
      href: `/branch-admin/employers/${employerId}/companies`,
      icon: BuildingOfficeIcon,
    },
    {
      name: "Subscription",
      href: `/branch-admin/employers/${employerId}/subscription`,
      icon: ChartBarIcon,
    },
  ];

  const developmentNav = [
    {
      name: t("branchAdmin.sidebar.testInterface", "Test Interface"),
      href: "/branch-admin/test",
      icon: BeakerIcon,
    },
  ];

  const isActive = (href) => location.pathname === href;
  const isEmployerSubmenuActive = (href) => location.pathname === href;

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
        <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-orange-50">
          <Link
            to="/branch-admin/dashboard"
            className="flex items-center hover:scale-105 transition-transform duration-200"
          >
            <img
              src={logoImage}
              alt="LokalHunt"
              className="h-10 lg:h-16 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isEmployersItem = item.href === "/branch-admin/employers";

              return (
                <li key={item.name}>
                  {/* Main navigation item */}
                  <Link
                    to={item.href}
                    onClick={
                      isEmployersItem && isInEmployerContext
                        ? undefined
                        : onClose
                    }
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02]
                      ${
                        isActive(item.href) ||
                        (isEmployersItem && isInEmployerContext)
                          ? "bg-gradient-to-r from-blue-500 to-orange-500 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      }
                    `}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                        isActive(item.href) ||
                        (isEmployersItem && isInEmployerContext)
                          ? "text-white"
                          : "text-gray-400 group-hover:text-blue-500"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}

                    {/* Chevron for Employers item when in context */}
                    {isEmployersItem && isInEmployerContext && (
                      <ChevronDownIcon
                        className={`ml-auto h-4 w-4 transition-colors ${
                          isActive(item.href) || isInEmployerContext
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      />
                    )}
                  </Link>

                  {/* Employer submenu - only show when in employer context */}
                  {isEmployersItem && isInEmployerContext && employerId && (
                    <ul className="mt-2 ml-6 space-y-1">
                      {/* Back to Employers List link */}
                      <li className="px-3 py-1">
                        <Link
                          to="/branch-admin/employers"
                          onClick={onClose}
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <ChevronRightIcon className="h-3 w-3 mr-1 rotate-180" />
                          Back to Employers List
                        </Link>
                      </li>

                      {/* Employer context indicator */}
                      <li className="px-3 py-1 pt-2">
                        <div className="text-xs text-gray-500 font-medium truncate">
                          {targetEmployer?.companyName ||
                            `Employer ${employerId.slice(0, 8)}...`}
                        </div>
                      </li>

                      {/* Submenu items */}
                      {employerSubmenuItems.map((submenuItem) => {
                        const SubmenuIcon = submenuItem.icon;
                        return (
                          <li key={submenuItem.name}>
                            <Link
                              to={submenuItem.href}
                              onClick={onClose}
                              className={`
                                group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200
                                ${
                                  isEmployerSubmenuActive(submenuItem.href)
                                    ? "bg-blue-100 text-blue-700 border-l-2 border-blue-500"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                                }
                              `}
                            >
                              <SubmenuIcon
                                className={`mr-3 flex-shrink-0 h-4 w-4 transition-colors ${
                                  isEmployerSubmenuActive(submenuItem.href)
                                    ? "text-blue-600"
                                    : "text-gray-400 group-hover:text-blue-500"
                                }`}
                                aria-hidden="true"
                              />
                              {submenuItem.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Development Section */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t("branchAdmin.sidebar.development", "Development")}
              </h3>
              <ul className="mt-2 space-y-2">
                {developmentNav.map((item) => {
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
                              ? "bg-gradient-to-r from-blue-500 to-orange-500 text-white shadow-md"
                              : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                          }
                        `}
                      >
                        <Icon
                          className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                            isActive(item.href)
                              ? "text-white"
                              : "text-gray-400 group-hover:text-blue-500"
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Admin Info Card */}
          <div className="mt-8 px-3">
            <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Branch Admin
                  </p>
                  <p className="text-xs text-gray-500">City Management</p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;