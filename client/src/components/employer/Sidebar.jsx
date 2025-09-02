
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
  StarIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { useRole } from "../../context/RoleContext";
import { useSubscription } from "../../context/SubscriptionContext";
import logoImage from "../../assets/lokalhunt-logo.png";
import Modal from "../ui/Modal";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { employerId } = useParams();
  const { t } = useTranslation();
  const { isAdminView, getCurrentEmployerId } = useRole();
  const {
    subscription,
    hasHRAssistPlan,
    isLoading: isLoadingSubscription,
  } = useSubscription();
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Get the correct employer ID for routing
  const currentEmployerId = getCurrentEmployerId() || employerId;

  // Check if employer has HR-Assist plan (with safety check)
  const hasActivePlan =
    typeof hasHRAssistPlan === "function" ? hasHRAssistPlan() : false;

  // Determine the correct route base based on context
  const getRouteBase = () => {
    if (isAdminView() && currentEmployerId) {
      return `/branch-admin/employers/${currentEmployerId}`;
    }
    return "/employer";
  };

  const routeBase = getRouteBase();

  const navigation = [
    {
      name: t("employer.sidebar.dashboard", "Dashboard"),
      href: `${routeBase}/dashboard`,
      icon: HomeIcon,
    },
    {
      name: t("employer.sidebar.myJobs", "My Jobs"),
      href: `${routeBase}/ads`,
      icon: DocumentTextIcon,
    },
    {
      name: t("employer.sidebar.jobSeekers", "Job Seekers"),
      href: `${routeBase}/candidates`,
      icon: UsersIcon,
    },
    {
      name: t("employer.sidebar.topCandidates", "Top Candidates"),
      href: `${routeBase}/premium-candidates`,
      icon: StarIcon,
      isPremium: true,
      tooltip: "Pre-screened top talent – Available with HR-Assist Plan",
    },
    {
      name: t("employer.sidebar.myBusiness", "My Business"),
      href: `${routeBase}/companies`,
      icon: BuildingOfficeIcon,
    },
    {
      name: t("employer.sidebar.myPlan", "My Plan"),
      href: `${routeBase}/subscription`,
      icon: CreditCardIcon,
    },
  ];

  const quickActions = [
    {
      name: t("employer.sidebar.postJob", "Post Job"),
      href: `${routeBase}/ads/new`,
      icon: PlusIcon,
    },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Mobile optimized */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-full sm:w-80 lg:w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Header with Logo and Close Button - Increased height */}
        <div className="flex items-center justify-center relative h-20 px-4 border-b border-neutral-200 bg-gradient-to-r from-green-50 to-blue-50">
          <Link
            to={`${routeBase}/dashboard`}
            className="flex items-center hover:scale-105 transition-transform duration-200"
          >
            <img
              src={logoImage}
              alt="LokalHunt"
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* Close button - only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute right-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 active:bg-white/80 transition-all duration-200"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isPremiumItem = item.isPremium;
              const isLocked = isPremiumItem && !hasActivePlan;

              return (
                <li key={item.name} className="relative group">
                  {isPremiumItem && isLocked ? (
                    <button
                      onClick={() => {
                        // Show upgrade modal instead of being completely disabled
                        window.dispatchEvent(
                          new CustomEvent("showPremiumUpgrade"),
                        );
                        onClose();
                      }}
                      className="group flex items-center w-full px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 text-gray-600 hover:text-orange-600 hover:bg-orange-50 relative"
                      title={item.tooltip}
                    >
                      <div className="flex items-center w-full">
                        <Icon
                          className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-orange-500"
                          aria-hidden="true"
                        />
                        <span className="flex-1 text-left">{item.name}</span>
                        <LockClosedIcon className="h-4 w-4 text-gray-400 group-hover:text-orange-500 ml-2" />
                      </div>

                      {/* Tooltip */}
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                        {item.tooltip}
                        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 active:scale-[0.98] relative
                        ${
                          isActive(item.href)
                            ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-200"
                            : isPremiumItem
                              ? "text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 active:bg-gradient-to-r active:from-yellow-100 active:to-orange-100 hover:text-orange-600 border border-transparent hover:border-orange-200"
                              : "text-gray-700 hover:bg-gray-50 active:bg-gray-100 hover:text-green-600"
                        }
                      `}
                    >
                      <div
                        className={`flex items-center w-full ${item.name === "Top Candidates" ? "justify-start" : ""}`}
                      >
                        <Icon
                          className={`mr-4 flex-shrink-0 h-6 w-6 transition-colors ${
                            isActive(item.href)
                              ? "text-white"
                              : isPremiumItem
                                ? "text-orange-400 group-hover:text-orange-500"
                                : "text-gray-400 group-hover:text-green-500"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="flex-1 text-left">{item.name}</span>
                        {isPremiumItem && (
                          <StarIcon
                            className={`h-4 w-4 ml-2 text-left ${
                              isActive(item.href)
                                ? "text-white"
                                : "text-orange-400 group-hover:text-orange-500"
                            }`}
                          />
                        )}
                      </div>

                      {/* Tooltip for premium item */}
                      {isPremiumItem && item.tooltip && (
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none max-w-xs">
                          {hasActivePlan ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                                <span className="font-semibold">
                                  HR-Assist Active
                                </span>
                              </div>
                              <div className="text-xs text-gray-300">
                                Access premium pre-screened candidates
                              </div>
                            </div>
                          ) : (
                            item.tooltip
                          )}
                          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      )}

                      {/* HR-Assist Active Badge */}
                      {isPremiumItem && hasActivePlan && !isLocked && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <ul className="space-y-2">
              {quickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    {item.href ? (
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className="group flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 active:scale-[0.98] text-gray-700 hover:bg-green-50 active:bg-green-100 hover:text-green-600 border border-transparent hover:border-green-200"
                      >
                        <Icon
                          className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-green-500"
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
                        className="group flex items-center w-full px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 active:scale-[0.98] text-gray-700 hover:bg-blue-50 active:bg-blue-100 hover:text-blue-600 border border-transparent hover:border-blue-200"
                      >
                        <Icon
                          className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-blue-500"
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

          {/* Help & Support */}
          <div className="mt-auto pt-8">
            <button
              onClick={() => {
                setShowHelpModal(true);
                onClose();
              }}
              className="group flex items-center w-full px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 active:scale-[0.98] text-gray-700 hover:bg-blue-50 active:bg-blue-100 hover:text-blue-600 border border-transparent hover:border-blue-200"
            >
              <QuestionMarkCircleIcon
                className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-blue-500"
                aria-hidden="true"
              />
              {t("employer.sidebar.helpSupport", "Help & Support")}
            </button>

            {/* Mobile-specific bottom spacing */}
            <div className="h-6 lg:h-0"></div>
          </div>
        </nav>
      </div>

      {/* Help & Support Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Help & Support"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Get in touch with your local Branch Admin for personalized support
            with your employer account, job postings, and subscription plans.
          </p>

          {/* Branch Office Info */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                Mumbai Branch Office
              </h3>
            </div>
            <p className="text-xs text-gray-600">
              Your assigned branch based on company location
            </p>
          </div>

          {/* Branch Admin Contact Details */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <UserIcon className="h-6 w-6 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  Branch Administrator
                </h4>
                <p className="text-base text-gray-700 font-semibold">
                  Rajesh Kumar
                </p>
                <p className="text-sm text-gray-500">Senior Branch Manager</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <PhoneIcon className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Direct Phone
                  </p>
                  <p className="text-sm text-gray-700 font-mono">
                    +91 9876543210
                  </p>
                  <p className="text-xs text-gray-500">Mon-Fri, 9 AM - 6 PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Email Support
                  </p>
                  <p className="text-sm text-gray-700 font-mono break-all">
                    rajesh.kumar@lokalhunt.com
                  </p>
                  <p className="text-xs text-gray-500">
                    Response within 4 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <MapPinIcon className="h-5 w-5 text-orange-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Office Address
                </p>
                <p className="text-sm text-gray-700">
                  304, Business Hub, Andheri East, Mumbai - 400069
                </p>
                <p className="text-xs text-gray-500">
                  Visit by appointment only
                </p>
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
