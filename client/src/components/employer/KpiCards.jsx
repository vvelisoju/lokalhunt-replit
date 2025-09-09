import React from "react";
import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  EyeIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

const KpiCards = ({ stats }) => {
  // Main metrics for prominent display
  const mainMetrics = [
    {
      name: "Jobs",
      value: stats?.totalAds || 0,
      icon: DocumentTextIcon,
      color: "bg-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      link: "/employer/ads",
    },
    {
      name: "Candidates",
      value: stats?.allocatedCandidates || 0,
      icon: UserGroupIcon,
      color: "bg-purple-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      link: "/employer/candidates",
    },
  ];

  const kpis = [
    {
      name: "Pending Approval",
      value: stats?.pendingApproval || 0,
      icon: ClockIcon,
      color: "bg-yellow-500",
      bgLight: "bg-yellow-50",
      textColor: "text-yellow-600",
      link: "/employer/ads?status=PENDING_APPROVAL",
    },
    {
      name: "Approved",
      value: stats?.approved || 0,
      icon: CheckCircleIcon,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
      link: "/employer/ads?status=APPROVED",
    },
    {
      name: "Draft",
      value: stats?.draft || 0,
      icon: EyeIcon,
      color: "bg-gray-500",
      bgLight: "bg-gray-50",
      textColor: "text-gray-600",
      link: "/employer/ads?status=DRAFT",
    },
    {
      name: "Closed",
      value: stats?.archived || 0,
      icon: ArchiveBoxIcon,
      color: "bg-red-500",
      bgLight: "bg-red-50",
      textColor: "text-red-600",
      link: "/employer/ads?status=CLOSED",
    },
    {
      name: "Job Views",
      value: stats?.jobViews || 0,
      icon: EyeIcon,
      color: "bg-indigo-500",
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
      link: "/employer/ads?status=APPROVED",
    },
    {
      name: "Bookmarked Candidates",
      value: stats?.bookmarkedCandidates || 0,
      icon: BookmarkIcon,
      color: "bg-emerald-500",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
      link: "/employer/candidates?bookmarked=true",
    },
  ];

  return (
    <div className="space-y-3 safe-area-full">
      {/* Prominent Main Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        {mainMetrics.map((metric) => (
          <Link key={metric.name} to={metric.link} className="block">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg active:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`${metric.bgLight} rounded-lg p-2.5 flex-shrink-0`}
                >
                  <metric.icon className={`h-6 w-6 ${metric.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-600 truncate">
                    Total
                  </h3>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 leading-none mb-1">
                    {metric.value}
                  </p>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${metric.bgLight} ${metric.textColor}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                    {metric.name}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Compact Secondary Metrics Grid */}
      <div className="grid grid-cols-3 gap-2">
        {kpis.map((kpi) => (
          <Link key={kpi.name} to={kpi.link} className="block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md active:shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-2">
                {/* Icon */}
                <div
                  className={`${kpi.bgLight} rounded-lg p-2 w-8 h-8 flex items-center justify-center flex-shrink-0`}
                >
                  <kpi.icon className={`h-4 w-4 ${kpi.textColor}`} />
                </div>

                {/* Value */}
                <div className="space-y-0.5">
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {kpi.value}
                  </p>
                  <p className="text-xs font-medium text-gray-600 leading-tight line-clamp-2">
                    {kpi.name}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default KpiCards;
