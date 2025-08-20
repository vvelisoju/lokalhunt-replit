import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  MegaphoneIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from 'react-i18next';
import logoImage from "../../assets/lokalhunt-logo.png";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    { name: t('employer.sidebar.dashboard', 'Dashboard'), href: "/employer/dashboard", icon: HomeIcon },
    { name: t('employer.sidebar.myAds', 'My Ads'), href: "/employer/ads", icon: MegaphoneIcon },
    { name: t('employer.sidebar.candidates', 'Candidates'), href: "/employer/candidates", icon: UsersIcon },
    { name: t('employer.sidebar.companies', 'Companies'), href: "/employer/company-profile", icon: BuildingOfficeIcon },
    { name: t('employer.sidebar.mou', 'MOU Management'), href: "/employer/mou", icon: DocumentTextIcon },
  ];

  const quickActions = [
    { name: t('employer.sidebar.postJob', 'Post New Job'), href: "/employer/ads/new", icon: PlusIcon },
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
        <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200 bg-gradient-to-r from-green-50 to-blue-50">
          <Link to="/employer/dashboard" className="flex items-center hover:scale-105 transition-transform duration-200">
            <img 
              src={logoImage} 
              alt="LokalHunt" 
              className="h-10 w-auto object-contain"
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
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                        isActive(item.href) ? "text-white" : "text-gray-400 group-hover:text-green-500"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t('employer.sidebar.quickActions', 'Quick Actions')}
            </h3>
            <ul className="mt-2 space-y-2">
              {quickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] text-gray-700 hover:bg-green-50 hover:text-green-600 border border-transparent hover:border-green-200"
                    >
                      <Icon
                        className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-green-500"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>



          {/* Employer Info Card */}
          <div className="mt-8 px-3">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <BuildingOfficeIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Employer</p>
                  <p className="text-xs text-gray-500">Job Management</p>
                </div>
              </div>
              <Link
                to="/employer/ads/new"
                className="mt-3 block w-full bg-gradient-to-r from-green-500 to-blue-500 text-white text-center py-2.5 px-3 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                {t('employer.sidebar.postJobCta', 'Post a Job')}
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;