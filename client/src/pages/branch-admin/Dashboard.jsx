import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRightIcon,
  EyeIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import KpiCards from '../../components/branch-admin/KpiCards';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/branch-admin/EmptyState';
import { getBranchStats, getQuickActions } from '../../services/branch-admin/dashboard';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [quickActions, setQuickActions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, actionsResponse] = await Promise.all([
        getBranchStats(),
        getQuickActions()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      } else {
        toast.error(statsResponse.error);
      }

      if (actionsResponse.success) {
        setQuickActions(actionsResponse.data);
      } else {
        // Quick actions failure is not critical, just log it
        console.warn('Failed to load quick actions:', actionsResponse.error);
        setQuickActions({ pendingEmployers: [], pendingAds: [], pendingScreening: [] });
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const QuickActionCard = ({ title, items = [], linkTo, viewAllText, emptyText }) => (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Link
          to={linkTo}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          {viewAllText}
          <ArrowRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="py-8">
          <EmptyState
            type="no-results"
            title={emptyText}
            description=""
            showIcon={false}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <div key={item.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name || item.title}
                </p>
                <p className="text-xs text-gray-500">
                  {item.email || item.company?.name || 'N/A'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`${linkTo}/${item.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <EyeIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
          
          {items.length > 5 && (
            <div className="text-center pt-2">
              <Link
                to={linkTo}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                +{items.length - 5} more items
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branch Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of branch activities and pending actions
        </p>
      </div>

      {/* KPI Cards */}
      <KpiCards stats={stats} loading={loading} />

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActionCard
          title="Pending Employers"
          items={quickActions?.pendingEmployers || []}
          linkTo="/branch-admin/employers"
          viewAllText="View All"
          emptyText="No pending employers"
        />
        
        <QuickActionCard
          title="Pending Ad Approvals"
          items={quickActions?.pendingAds || []}
          linkTo="/branch-admin/ads"
          viewAllText="View All"
          emptyText="No pending ads"
        />
        
        <QuickActionCard
          title="Candidates to Screen"
          items={quickActions?.pendingScreening || []}
          linkTo="/branch-admin/screening"
          viewAllText="View All"
          emptyText="No pending screening"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link
              to="/branch-admin/logs"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {quickActions?.recentActivity?.length === 0 ? (
            <EmptyState
              type="no-logs"
              title="No recent activity"
              description=""
              showIcon={false}
            />
          ) : (
            <div className="space-y-3">
              {(quickActions?.recentActivity || []).slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.description || 'Activity performed'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
          </div>
          
          <div className="space-y-3">
            {stats?.employersWithoutMou > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {stats.employersWithoutMou} employers without active MOU
                    </p>
                    <p className="text-xs text-yellow-700">
                      These employers cannot submit ads for approval
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {stats?.expiringSoonMous > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      {stats.expiringSoonMous} MOUs expiring soon
                    </p>
                    <p className="text-xs text-orange-700">
                      Review and renew expiring MOUs
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {(!stats?.employersWithoutMou && !stats?.expiringSoonMous) && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      All systems normal
                    </p>
                    <p className="text-xs text-green-700">
                      No critical alerts at this time
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          as={Link}
          to="/branch-admin/employers?status=PENDING_APPROVAL"
          variant="primary"
        >
          Review Pending Employers
        </Button>
        <Button
          as={Link}
          to="/branch-admin/ads?status=PENDING_APPROVAL"
          variant="outline"
        >
          Review Pending Ads
        </Button>
        <Button
          as={Link}
          to="/branch-admin/screening"
          variant="outline"
        >
          Screen Candidates
        </Button>
        <Button
          as={Link}
          to="/branch-admin/reports"
          variant="outline"
        >
          Generate Reports
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;