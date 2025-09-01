import React, { useState, useEffect } from "react";
import { subscriptionService } from "../../services/employer/subscription";
import { branchAdminSubscriptionService } from "../../services/branch-admin/subscription";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import {
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  StarIcon,
  ClockIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useRole } from "../../context/RoleContext";
import { toast } from "react-hot-toast";

const Subscription = () => {
  const { t } = useTranslation();

  // Role context for Branch Admin functionality
  const roleContext = useRole();
  const {
    isAdminView = () => false,
    isBranchAdmin = () => false,
    can = () => false,
    targetEmployer = null,
    getCurrentEmployerId = () => null,
  } = roleContext || {};

  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [error, setError] = useState("");

  // Branch Admin specific states
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(""); // Clear any previous errors
      
      const [plansResponse, subscriptionResponse] = await Promise.allSettled([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription(),
      ]);

      if (plansResponse.status === "fulfilled" && plansResponse.value.success) {
        const plansData = plansResponse.value.data;
        setPlans(Array.isArray(plansData) ? plansData : []);
      } else {
        console.error("Failed to load plans:", plansResponse.reason || plansResponse.value?.error);
        setError(plansResponse.value?.error || "Failed to load subscription plans");
      }

      if (subscriptionResponse.status === "fulfilled" && subscriptionResponse.value.success) {
        // Handle case where API returns successful response but no subscription data
        setCurrentSubscription(subscriptionResponse.value.data || null);
      } else if (subscriptionResponse.status === "fulfilled" && !subscriptionResponse.value.success) {
        // This might be normal if user has no subscription yet
        console.log("No current subscription:", subscriptionResponse.value?.error);
        setCurrentSubscription(null);
      } else {
        console.error("Failed to load subscription:", subscriptionResponse.reason);
      }
    } catch (error) {
      console.error("Error loading subscription data:", error);
      setError("Failed to load subscription data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const handleCreateSubscription = async () => {
    if (!selectedPlan) return;

    try {
      setIsCreatingSubscription(true);

      if (isBranchAdmin() && getCurrentEmployerId()) {
        // Branch admin creating subscription for employer
        await branchAdminSubscriptionService.createEmployerSubscription(
          getCurrentEmployerId(),
          { planId: selectedPlan.id },
        );
        toast.success("Subscription created successfully for employer");
      } else {
        // Regular employer creating own subscription
        await subscriptionService.createSubscription({
          planId: selectedPlan.id,
        });
        toast.success("Subscription created successfully");
      }

      setShowPlanModal(false);
      await loadData();
    } catch (error) {
      console.error("Error creating subscription:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create subscription";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      await subscriptionService.cancelSubscription();
      await loadData();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setError("Failed to cancel subscription");
    }
  };

  // Branch Admin approve subscription
  const handleApproveSubscription = async () => {
    if (!currentSubscription?.id) return;

    try {
      setIsApproving(true);
      await branchAdminSubscriptionService.approveSubscription(
        currentSubscription.id,
      );
      toast.success("Subscription approved successfully");
      await loadData();
    } catch (error) {
      console.error("Error approving subscription:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to approve subscription";
      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  // Branch Admin reject subscription
  const handleRejectSubscription = async () => {
    if (!currentSubscription?.id || !rejectReason.trim()) return;

    try {
      setIsRejecting(true);
      await branchAdminSubscriptionService.rejectSubscription(
        currentSubscription.id,
        rejectReason,
      );
      toast.success("Subscription rejected successfully");
      setShowRejectModal(false);
      setRejectReason("");
      await loadData();
    } catch (error) {
      console.error("Error rejecting subscription:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to reject subscription";
      toast.error(errorMessage);
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: "green", text: "Active" },
      EXPIRED: { color: "red", text: "Expired" },
      CANCELLED: { color: "gray", text: "Cancelled" },
      PAST_DUE: { color: "yellow", text: "Past Due" },
      PENDING_APPROVAL: { color: "yellow", text: "Pending Approval" },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "Free";
    return `₹${price.toLocaleString()}`;
  };

  const isPlanActive = (plan) => {
    return (
      currentSubscription &&
      currentSubscription.planId === plan.id &&
      (currentSubscription.status === "ACTIVE" ||
        currentSubscription.status === "PENDING_APPROVAL")
    );
  };

  const canSelectPlan = (plan) => {
    // Branch admins can always select Self-Service plans for employers
    if (isBranchAdmin() && plan.name === "Self-Service") {
      return !isPlanActive(plan);
    }

    // If no current subscription, can select any plan
    if (!currentSubscription) return true;

    // If HR-Assist is pending approval, disable Self-Service plan selection (except for branch admin)
    if (
      currentSubscription.plan?.name === "HR-Assist" &&
      currentSubscription.status === "PENDING_APPROVAL" &&
      plan.name === "Self-Service" &&
      !isBranchAdmin()
    ) {
      return false;
    }

    // If current plan is free (Self-Service), allow selecting any other plan
    if (currentSubscription.plan?.name === "Self-Service") {
      return plan.name !== "Self-Service";
    }

    // For paid plans, only allow if not currently active
    return !isPlanActive(plan);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("employer.subscription.title", "Subscription Plans")}
        </h1>
        <p className="text-gray-600 text-xs">
          {t(
            "employer.subscription.subtitle",
            "Select the perfect plan for your hiring needs. Upgrade or downgrade anytime.",
          )}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XMarkIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription - Compact Version */}
      {currentSubscription && (
        <Card
          className={`mb-8 ${
            currentSubscription.status === "ACTIVE"
              ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
              : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2 text-green-600" />
                Current Plan: {currentSubscription.plan?.name}
              </h3>
              {getStatusBadge(currentSubscription.status)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Start Date</p>
                <p className="font-medium">
                  {new Date(currentSubscription.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Hired</p>
                <p className="font-bold text-lg text-green-600">
                  {currentSubscription.totalCandidatesHired || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Amount Due</p>
                <p className="font-bold text-lg">
                  {formatPrice(currentSubscription.totalAmountDue)}
                </p>
              </div>
              <div className="flex items-center">
                {currentSubscription.status === "ACTIVE" &&
                  currentSubscription.plan?.name !== "Self-Service" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancelSubscription}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      Cancel
                    </Button>
                  )}
              </div>
            </div>

            {currentSubscription.status === "PENDING_APPROVAL" && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <InformationCircleIcon className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-blue-800 text-sm">
                      {isBranchAdmin()
                        ? "This subscription is pending approval. You can approve or reject it below."
                        : "Branch admin will connect you soon to complete MOU process."}
                    </p>
                  </div>
                </div>

                {/* Branch Admin Approval Actions */}
                {isBranchAdmin() && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleApproveSubscription}
                      isLoading={isApproving}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                    >
                      <HandThumbUpIcon className="h-4 w-4 mr-1" />
                      {isApproving ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => setShowRejectModal(true)}
                      size="sm"
                      variant="secondary"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 flex items-center"
                    >
                      <HandThumbDownIcon className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transform transition-all duration-200 hover:scale-105 ${
                isPlanActive(plan)
                  ? "ring-4 ring-green-500 border-green-200 shadow-2xl"
                  : plan.name === "HR-Assist"
                    ? "ring-2 ring-blue-200 border-blue-200 shadow-lg"
                    : "border-gray-200 shadow-md hover:shadow-lg"
              }`}
            >
              {isPlanActive(plan) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge
                    color="green"
                    className="px-4 py-2 text-sm font-semibold"
                  >
                    <StarIcon className="w-4 h-4 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}

              {plan.name === "HR-Assist" && !isPlanActive(plan) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge
                    color="blue"
                    className="px-4 py-2 text-sm font-semibold"
                  >
                    <StarIcon className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm min-h-[2.5rem]">
                    {plan.description}
                  </p>

                  <div className="space-y-1 mb-4">
                    {plan.priceMonthly === 0 ? (
                      <div className="text-4xl font-bold text-green-600">
                        Free
                      </div>
                    ) : (
                      <>
                        {plan.pricePerCandidate !== null && (
                          <div className="text-4xl font-bold text-gray-900">
                            {formatPrice(plan.pricePerCandidate)}
                            <span className="text-lg font-normal text-gray-500">
                              /hire
                            </span>
                          </div>
                        )}
                        {plan.priceMonthly !== null &&
                          plan.priceMonthly > 0 && (
                            <div className="text-lg text-gray-700">
                              {formatPrice(plan.priceMonthly)}
                              <span className="text-sm text-gray-500">
                                /month
                              </span>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start text-sm">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center text-sm">
                        {plan.maxJobPosts ? (
                          <>
                            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                            <span>{plan.maxJobPosts} job posts</span>
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                            <span>Unlimited job posts</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center text-sm">
                        {plan.maxShortlists ? (
                          <>
                            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                            <span>
                              {plan.maxShortlists} candidate shortlists
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                            <span>Unlimited shortlists</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Special advantages for HR-Assist */}
                {plan.name === "HR-Assist" && (
                  <div className="mb-8 space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center mb-2">
                        <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-semibold text-green-800">
                          Quality Guarantee
                        </span>
                      </div>
                      <p className="text-xs text-green-700">
                        Unlimited replacement within 2 months if hired candidate
                        doesn't work out
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-semibold text-blue-800">
                          Emergency Support
                        </span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Fast-track recruitment in 24-48 hours for urgent
                        positions
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center mb-2">
                        <StarIcon className="h-4 w-4 text-orange-600 mr-2" />
                        <span className="text-sm font-semibold text-orange-800">
                          Best Value
                        </span>
                      </div>
                      <p className="text-xs text-orange-700">
                        Pay only ₹3,000 per successful hire - lowest market rate
                      </p>
                    </div>
                  </div>
                )}

                {canSelectPlan(plan) && (
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 text-lg font-semibold ${
                      plan.name === "HR-Assist"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {isPlanActive(plan)
                      ? "Current Plan Active"
                      : isBranchAdmin()
                        ? `Select Plan for Employer`
                        : "Select Plan"}
                  </Button>
                )}

                {!canSelectPlan(plan) && (
                  <div
                    className={`w-full py-3 text-center rounded-lg font-semibold ${
                      // Special case for Self-Service when HR-Assist is pending
                      currentSubscription?.plan?.name === "HR-Assist" &&
                      currentSubscription?.status === "PENDING_APPROVAL" &&
                      plan.name === "Self-Service"
                        ? "bg-gray-100 text-gray-500 border border-gray-200"
                        : currentSubscription?.status === "PENDING_APPROVAL"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {currentSubscription?.plan?.name === "HR-Assist" &&
                    currentSubscription?.status === "PENDING_APPROVAL" &&
                    plan.name === "Self-Service"
                      ? "Unavailable during HR-Assist approval"
                      : currentSubscription?.status === "PENDING_APPROVAL"
                        ? "Pending Approval"
                        : "Current Active Plan"}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Plan Selection Modal */}
      <Modal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)}>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Confirm Plan Selection
          </h3>
          {selectedPlan && (
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                You are about to subscribe to the{" "}
                <strong>{selectedPlan.name}</strong> plan.
              </p>

              {selectedPlan.name === "HR-Assist" && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-blue-800 text-sm">
                      This plan requires branch admin approval. A branch admin
                      will connect you soon to complete the MOU process.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Plan:</span>
                  <span className="font-semibold">{selectedPlan.name}</span>
                </div>
                {selectedPlan.priceMonthly !== null &&
                  selectedPlan.priceMonthly > 0 && (
                    <div className="flex justify-between">
                      <span>Monthly Price:</span>
                      <span className="font-medium">
                        {formatPrice(selectedPlan.priceMonthly)}
                      </span>
                    </div>
                  )}
                {selectedPlan.pricePerCandidate !== null && (
                  <div className="flex justify-between">
                    <span>Per Hire:</span>
                    <span className="font-medium">
                      {formatPrice(selectedPlan.pricePerCandidate)}
                    </span>
                  </div>
                )}

                {selectedPlan.features && selectedPlan.features.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="font-medium mb-2 block">Features:</span>
                    <ul className="space-y-1">
                      {selectedPlan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-center"
                        >
                          <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowPlanModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubscription}
              isLoading={isCreatingSubscription}
              className="flex-1"
            >
              {isCreatingSubscription ? "Creating..." : "Subscribe"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Subscription Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Reject Subscription
          </h3>
          <p className="text-gray-600 mb-4">
            Please provide a reason for rejecting this subscription:
          </p>

          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            rows={4}
            required
          />

          <div className="flex space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubscription}
              isLoading={isRejecting}
              disabled={!rejectReason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isRejecting ? "Rejecting..." : "Reject Subscription"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Subscription;
