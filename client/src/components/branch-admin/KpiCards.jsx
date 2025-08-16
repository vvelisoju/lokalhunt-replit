import { 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const KpiCards = ({ stats, loading }) => {
  const kpis = [
    {
      title: 'Total Employers',
      value: stats?.totalEmployers || 0,
      icon: BuildingOfficeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Ads',
      value: stats?.activeAds || 0,
      icon: DocumentTextIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Ads',
      value: stats?.pendingAds || 0,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Pending Employers',
      value: stats?.pendingEmployers || 0,
      icon: UserGroupIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Candidates Screened',
      value: stats?.candidatesScreened || 0,
      icon: CheckCircleIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{kpi.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiCards;