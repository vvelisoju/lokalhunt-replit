import React from 'react';
import Layout from '../../components/branch-admin/Layout';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationCenter from '../../components/ui/NotificationCenter';

const Notifications = () => {
  return (
    <Layout>
      <div className="p-3 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Notifications</h1>
        <div className="w-full">
          <NotificationCenter />
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;