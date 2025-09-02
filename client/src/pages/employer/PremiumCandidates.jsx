
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  StarIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  ShieldCheckIcon,
  BoltIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import CandidateCard from "../../components/ui/CandidateCard";
import { useRole } from "../../context/RoleContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { toast } from "react-hot-toast";

const PremiumCandidates = () => {
  const [premiumCandidates, setPremiumCandidates] = useState([]);

  // Role context for Branch Admin functionality
  const roleContext = useRole();
  const {
    isAdminView = () => false,
    getCurrentEmployerId = () => null,
  } = roleContext || {};

  // Subscription context
  const { subscription, hasHRAssistPlan, isLoading } = useSubscription();
  const hasActivePlan = hasHRAssistPlan();

  useEffect(() => {
    if (hasActivePlan && !isLoading) {
      loadPremiumCandidates();
    }
  }, [hasActivePlan, isLoading]);

  const loadPremiumCandidates = async () => {
    try {
      // TODO: Load premium candidates from API when service is available
      setPremiumCandidates([]);
    } catch (error) {
      console.error("Error loading premium candidates:", error);
      toast.error("Failed to load premium candidates");
    }
  };

  const UpgradeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-4">
                <LockClosedIcon className="h-12 w-12 text-orange-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              🌟 Premium Candidates
            </h1>
            <p className="text-orange-100 text-lg">
              Upgrade to HR-Assist Plan to access pre-screened top talent
            </p>
            
            {/* Current Plan Indicator */}
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full">
              <span className="text-orange-100 text-sm">
                Current Plan: <span className="font-semibold">{subscription?.plan?.name || "Loading..."}</span>
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left side - Benefits */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Why Choose HR-Assist Plan?
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                      <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
                      <p className="text-gray-600">
                        Pre-screened candidates with verified skills and experience. 
                        Only the top 10% make it to your premium list.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <PhoneIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Emergency Support</h3>
                      <p className="text-gray-600">
                        24/7 dedicated support from our recruitment experts. 
                        Get urgent hiring needs resolved within hours.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                      <BoltIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Save Time</h3>
                      <p className="text-gray-600">
                        Skip the initial screening process. Our team does the heavy lifting 
                        so you can focus on final interviews.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Preview */}
              <div>
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <StarIconSolid className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Premium Candidates Preview
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Access to 500+ pre-screened candidates in your industry
                    </p>
                    
                    {/* Mock candidate previews */}
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 opacity-60">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-300 rounded-full h-10 w-10"></div>
                            <div className="flex-1 text-left">
                              <div className="bg-gray-300 h-4 w-32 rounded mb-2"></div>
                              <div className="bg-gray-200 h-3 w-24 rounded"></div>
                            </div>
                            <StarIconSolid className="h-5 w-5 text-orange-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Upgrade?</h3>
                <p className="text-orange-100 mb-6">
                  Join 1000+ employers who trust our HR-Assist plan for their hiring needs
                </p>
                <Link
                  to={
                    isAdminView()
                      ? `/branch-admin/employers/${getCurrentEmployerId()}/subscription`
                      : "/employer/subscription"
                  }
                >
                  <Button className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8 py-3 text-lg">
                    Upgrade to HR-Assist Plan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PremiumCandidatesList = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-2 relative">
                <StarIcon className="h-6 w-6 text-white" />
                {/* Active indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Premium Candidates</h1>
                <p className="text-gray-600 text-sm">
                  Pre-screened top talent exclusively for HR-Assist subscribers
                </p>
                {/* Plan Status */}
                <div className="flex items-center mt-1 space-x-2">
                  <div className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    <CheckCircleIcon className="h-3 w-3" />
                    <span>HR-Assist Active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full">
                <ShieldCheckIcon className="h-5 w-5 text-orange-600" />
                <span className="text-orange-800 font-medium text-sm">Quality Verified</span>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full">
                <StarIconSolid className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium text-sm">Premium Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {premiumCandidates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {premiumCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                variant="premium"
                showPremiumBadge={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <UsersIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Premium Candidates Coming Soon
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Our team is currently curating the best candidates for your industry. 
              You'll be notified as soon as premium candidates are available.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // Show upgrade screen if not on HR-Assist plan
  if (!hasActivePlan) {
    return <UpgradeScreen />;
  }

  // Show premium candidates list if on HR-Assist plan
  return <PremiumCandidatesList />;
};

export default PremiumCandidates;
