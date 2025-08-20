import React from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const OverviewTab = ({ employer }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{employer.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PhoneIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-gray-900">
                {employer.phone || "Not provided"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-gray-900">{employer.city || "Not provided"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account Status
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Account Status</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                employer.user?.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {employer.user?.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Profile Complete</span>
            <span className="text-blue-600 font-medium">
              {employer.profileCompleteness || "75%"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Last Active</span>
            <span className="text-gray-900">
              {employer.lastActiveAt
                ? new Date(employer.lastActiveAt).toLocaleDateString()
                : "Never"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
