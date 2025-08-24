import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  HomeIcon,
  MegaphoneIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PlusIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  MapPinIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from 'react-i18next';
import { useRole } from '../../context/RoleContext';
import logoImage from "../../assets/lokalhunt-logo.png";
import Modal from "../ui/Modal";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { employerId } = useParams();
  const { t } = useTranslation();
  const { isAdminView, getCurrentEmployerId } = useRole();
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Get the correct employer ID for routing
  const currentEmployerId = getCurrentEmployerId() || employerId;
  
  // Determine the correct route base based on context
  const getRouteBase = () => {
    if (isAdminView() && currentEmployerId) {
      return `/branch-admin/employers/${currentEmployerId}`;
    }
    return '/employer';
  };

  const routeBase = getRouteBase();

  const navigation = [
    { name: t('employer.sidebar.dashboard', 'Dashboard'), href: `${routeBase}/dashboard`, icon: HomeIcon },
    { name: t('employer.sidebar.myAds', 'My Ads'), href: `${routeBase}/ads`, icon: MegaphoneIcon },
    { name: t('employer.sidebar.candidates', 'Candidates'), href: `${routeBase}/candidates`, icon: UsersIcon },
    { name: t('employer.sidebar.companies', 'Companies'), href: `${routeBase}/companies`, icon: BuildingOfficeIcon },
    { name: t('employer.sidebar.subscription', 'Subscription'), href: `${routeBase}/subscription`, icon: CreditCardIcon },
    // { name: t('employer.sidebar.mou', 'MOU Management'), href: `${routeBase}/mou`, icon: DocumentTextIcon },
  ];

  const quickActions = [
    { name: t('employer.sidebar.postJob', 'Post New Job'), href: `${routeBase}/ads/new`, icon: PlusIcon },
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
          <Link to={`${routeBase}/dashboard`} className="flex items-center hover:scale-105 transition-transform duration-200">
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
                    {item.href ? (
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
                    ) : (
                      <button
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200"
                      >
                        <Icon
                          className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-blue-500"
                          aria-hidden="true"
                        />
                        {item.name}
                      </button>
                    )}
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
              <button
                onClick={() => {
                  setShowHelpModal(true);
                  onClose();
                }}
                className="mt-3 block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2.5 px-3 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                {t('employer.sidebar.customerSupport', 'Customer Support')}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Customer Support Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Customer Support"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Get in touch with your local Branch Admin for personalized support with your employer account, job postings, and subscription plans.
          </p>
          
          {/* Branch Office Info */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Mumbai Branch Office</h3>
            </div>
            <p className="text-xs text-gray-600">Your assigned branch based on company location</p>
          </div>

          {/* Branch Admin Contact Details */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <UserIcon className="h-6 w-6 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Branch Administrator</h4>
                <p className="text-base text-gray-700 font-semibold">Rajesh Kumar</p>
                <p className="text-sm text-gray-500">Senior Branch Manager</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <PhoneIcon className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Direct Phone</p>
                  <p className="text-sm text-gray-700 font-mono">+91 9876543210</p>
                  <p className="text-xs text-gray-500">Mon-Fri, 9 AM - 6 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Support</p>
                  <p className="text-sm text-gray-700 font-mono break-all">rajesh.kumar@lokalhunt.com</p>
                  <p className="text-xs text-gray-500">Response within 4 hours</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <MapPinIcon className="h-5 w-5 text-orange-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">Office Address</p>
                <p className="text-sm text-gray-700">304, Business Hub, Andheri East, Mumbai - 400069</p>
                <p className="text-xs text-gray-500">Visit by appointment only</p>
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-blue-800 font-medium">
                Office Hours: Monday to Friday, 9:00 AM - 6:00 PM IST
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;