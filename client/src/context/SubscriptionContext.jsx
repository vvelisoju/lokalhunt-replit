
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentSubscription } from '../services/employer/subscription';

const SubscriptionContext = createContext({});

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getCurrentSubscription();
      
      if (result.success) {
        setSubscription(result.data);
      } else {
        setError(result.error);
        // Set default subscription for fallback
        setSubscription({
          plan: { name: "Self-Service" },
          status: "ACTIVE"
        });
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
      setError('Failed to load subscription');
      // Set default subscription for fallback
      setSubscription({
        plan: { name: "Self-Service" },
        status: "ACTIVE"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const hasHRAssistPlan = () => {
    return subscription?.plan?.name === "HR-Assist" && subscription?.status === "ACTIVE";
  };

  const hasActivePlan = (planName) => {
    return subscription?.plan?.name === planName && subscription?.status === "ACTIVE";
  };

  const refreshSubscription = () => {
    loadSubscription();
  };

  const value = {
    subscription,
    isLoading,
    error,
    hasHRAssistPlan,
    hasActivePlan,
    refreshSubscription,
    loadSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
