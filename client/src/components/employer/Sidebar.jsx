import React, { useState, useEffect } from "react";
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
      name: t("employer.sidebar.postJob", "Create Job"),
      href: `${routeBase}/ads/new`,
      icon: PlusIcon,
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
        lg:shadow-none shadow-2xl overflow-x-hidden
       ${isMobile && window.Capacitor ? "safe-top main-content-with-fixed-header" : ""}
        `}
      >
        {/* Mobile Header with Close Button - Native iOS/Android style */}
        {!isMobile && (
          <div className="relative flex items-center justify-between h-16 px-5 border-b border-gray-100 bg-white lg:bg-gradient-to-r lg:from-green-50 lg:to-blue-50 lg:border-neutral-200 lg:h-20 lg:justify-center">
            <Link
              to={`${routeBase}/dashboard`}
              onClick={onClose}
              className="flex items-center lg:hover:scale-105 transition-transform duration-200"
            >
              <img
                src={logoImage}
                alt="LokalHunt"
                className="h-10 lg:h-16 w-auto object-contain"
              />
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 active:scale-95"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* Navigation - Mobile native list style */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 lg:bg-white">
          <nav className="pt-2 lg:pt-6 lg:px-4">
            <ul className="space-y-0 lg:space-y-2">
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
                        className={`
                          group flex items-center w-full px-5 py-4 lg:px-4 lg:py-3.5 text-base lg:text-base font-medium lg:rounded-xl 
                          transition-all duration-200 active:bg-gray-200 lg:active:scale-[0.98] lg:hover:scale-[1.02] 
                          min-h-[52px] lg:min-h-[44px] border-b border-gray-200 lg:border-0
                          text-gray-600 bg-white hover:bg-orange-50 lg:hover:bg-orange-50 hover:text-orange-600 lg:border lg:border-transparent lg:hover:border-orange-200
                        `}
                        title={item.tooltip}
                      >
                        <Icon className="mr-4 lg:mr-4 h-6 w-6 lg:h-6 lg:w-6 flex-shrink-0 text-gray-400 group-hover:text-orange-500" />
                        <span className="flex-1 text-left font-medium lg:font-medium text-base lg:text-base text-gray-700 truncate">
                          {item.name}
                        </span>
                        <LockClosedIcon className="h-4 w-4 text-gray-400 group-hover:text-orange-500 ml-2 flex-shrink-0" />

                        {/* Desktop Tooltip */}
                        <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                          {item.tooltip}
                          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className={`
                          group flex items-center px-5 py-4 lg:px-4 lg:py-3.5 text-base lg:text-base font-medium lg:rounded-xl 
                          transition-all duration-200 active:bg-gray-200 lg:active:scale-[0.98] lg:hover:scale-[1.02] 
                          min-h-[52px] lg:min-h-[44px] border-b border-gray-200 lg:border-0
                          ${
                            isActive(item.href)
                              ? "bg-blue-50 text-blue-600 border-l-4 border-l-blue-600 lg:border-l-0 lg:bg-gradient-to-r lg:from-green-500 lg:to-blue-500 lg:text-white lg:shadow-lg"
                              : isPremiumItem
                                ? "text-gray-700 bg-white hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 lg:hover:bg-gradient-to-r lg:hover:from-yellow-50 lg:hover:to-orange-50 hover:text-orange-600 lg:border lg:border-transparent lg:hover:border-orange-200"
                                : "text-gray-700 bg-white hover:bg-gray-100 lg:hover:bg-gray-50 hover:text-green-600"
                          }
                        `}
                      >
                        <Icon
                          className={`mr-4 lg:mr-4 h-6 w-6 lg:h-6 lg:w-6 flex-shrink-0 ${
                            isActive(item.href)
                              ? "text-blue-600 lg:text-white"
                              : isPremiumItem
                                ? "text-orange-400 group-hover:text-orange-500"
                                : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`flex-1 font-medium lg:font-medium text-base lg:text-base truncate ${
                            isActive(item.href)
                              ? "text-blue-600 lg:text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {item.name}
                        </span>
                        {isPremiumItem && (
                          <StarIcon
                            className={`h-4 w-4 ml-2 flex-shrink-0 ${
                              isActive(item.href)
                                ? "text-blue-600 lg:text-white"
                                : "text-orange-400 group-hover:text-orange-500"
                            }`}
                          />
                        )}

                        {/* iOS style chevron indicator for active item on mobile */}
                        {isActive(item.href) && (
                          <div className="ml-auto lg:hidden flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}

                        {/* Desktop Tooltip for premium item */}
                        {isPremiumItem && item.tooltip && (
                          <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none max-w-xs">
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
          </nav>
        </div>

        {/* Quick Actions */}
        <div className="mt-0 lg:mt-8 overflow-hidden">
          <h3 className="hidden lg:block px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <ul className="space-y-0 lg:space-y-2">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  {item.href ? (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`
                          group flex items-center px-5 py-4 lg:px-4 lg:py-3.5 text-base lg:text-base font-medium lg:rounded-xl 
                          transition-all duration-200 active:bg-gray-200 lg:active:scale-[0.98] lg:hover:scale-[1.02] 
                          min-h-[52px] lg:min-h-[44px] border-b border-gray-200 lg:border-0
                          text-gray-700 bg-white hover:bg-green-50 lg:hover:bg-green-50 hover:text-green-600 lg:border lg:border-transparent lg:hover:border-green-200
                        `}
                    >
                      <Icon className="mr-4 lg:mr-4 h-6 w-6 lg:h-6 lg:w-6 flex-shrink-0 text-gray-500 group-hover:text-green-500" />
                      <span className="font-medium lg:font-medium text-base lg:text-base text-gray-900 truncate">
                        {item.name}
                      </span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      className={`
                          group flex items-center w-full px-5 py-4 lg:px-4 lg:py-3.5 text-base lg:text-base font-medium lg:rounded-xl 
                          transition-all duration-200 active:bg-gray-200 lg:active:scale-[0.98] lg:hover:scale-[1.02] 
                          min-h-[52px] lg:min-h-[44px] border-b border-gray-200 lg:border-0
                          text-gray-700 bg-white hover:bg-blue-50 lg:hover:bg-blue-50 hover:text-blue-600 lg:border lg:border-transparent lg:hover:border-blue-200
                        `}
                    >
                      <Icon className="mr-4 lg:mr-4 h-6 w-6 lg:h-6 lg:w-6 flex-shrink-0 text-gray-500 group-hover:text-blue-500" />
                      <span className="font-medium lg:font-medium text-base lg:text-base text-gray-900 truncate">
                        {item.name}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Help & Support */}
        <div className="mt-0 lg:mt-auto lg:pt-8 overflow-hidden">
          <button
            onClick={() => {
              setShowHelpModal(true);
              onClose();
            }}
            className={`
                group flex items-center w-full px-5 py-4 lg:px-4 lg:py-3.5 text-base lg:text-base font-medium lg:rounded-xl 
                transition-all duration-200 active:bg-gray-200 lg:active:scale-[0.98] lg:hover:scale-[1.02] 
                min-h-[52px] lg:min-h-[44px] border-b border-gray-200 lg:border-0
                text-gray-700 bg-white hover:bg-blue-50 lg:hover:bg-blue-50 hover:text-blue-600 lg:border lg:border-transparent lg:hover:border-blue-200
              `}
          >
            <QuestionMarkCircleIcon className="mr-4 lg:mr-4 h-6 w-6 lg:h-6 lg:w-6 flex-shrink-0 text-gray-500 group-hover:text-blue-500" />
            <span className="font-medium lg:font-medium text-base lg:text-base text-gray-900 truncate">
              {t("employer.sidebar.helpSupport", "Help & Support")}
            </span>
          </button>
        </div>

        {/* Mobile-specific bottom safe area */}
        <div className="h-8 lg:h-0 bg-gray-50 lg:bg-white border-t border-gray-200 lg:border-0"></div>
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
