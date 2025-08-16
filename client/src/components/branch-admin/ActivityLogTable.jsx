import { 
  UserIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  CogIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import Badge from '../ui/Badge';

const ActivityLogTable = ({ logs, loading }) => {
  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'EMPLOYER_APPROVED':
      case 'EMPLOYER_REJECTED':
      case 'EMPLOYER_BLOCKED':
        return UserIcon;
      case 'AD_APPROVED':
      case 'AD_REJECTED':
        return DocumentTextIcon;
      case 'COMPANY_CREATED':
      case 'COMPANY_UPDATED':
        return BuildingOfficeIcon;
      case 'MOU_CREATED':
      case 'MOU_UPDATED':
      case 'MOU_ACTIVATED':
        return CogIcon;
      default:
        return ExclamationCircleIcon;
    }
  };

  const getActionBadge = (actionType) => {
    const actionConfig = {
      EMPLOYER_APPROVED: { color: 'green', text: 'Approved' },
      EMPLOYER_REJECTED: { color: 'red', text: 'Rejected' },
      EMPLOYER_BLOCKED: { color: 'red', text: 'Blocked' },
      AD_APPROVED: { color: 'green', text: 'Approved' },
      AD_REJECTED: { color: 'red', text: 'Rejected' },
      COMPANY_CREATED: { color: 'blue', text: 'Created' },
      COMPANY_UPDATED: { color: 'blue', text: 'Updated' },
      MOU_CREATED: { color: 'purple', text: 'Created' },
      MOU_UPDATED: { color: 'purple', text: 'Updated' },
      MOU_ACTIVATED: { color: 'green', text: 'Activated' },
      MOU_DEACTIVATED: { color: 'gray', text: 'Deactivated' },
      CANDIDATE_SCREENED: { color: 'blue', text: 'Screened' },
      CANDIDATE_RATED: { color: 'yellow', text: 'Rated' }
    };
    
    const config = actionConfig[actionType] || { color: 'gray', text: actionType };
    return <Badge color={config.color} text={config.text} />;
  };

  const getActionDescription = (log) => {
    const { actionType, entityType, entityName, performedBy, notes } = log;
    
    switch (actionType) {
      case 'EMPLOYER_APPROVED':
        return `Approved employer "${entityName}"`;
      case 'EMPLOYER_REJECTED':
        return `Rejected employer "${entityName}"${notes ? ` - ${notes}` : ''}`;
      case 'EMPLOYER_BLOCKED':
        return `Blocked employer "${entityName}"${notes ? ` - ${notes}` : ''}`;
      case 'AD_APPROVED':
        return `Approved job ad "${entityName}"`;
      case 'AD_REJECTED':
        return `Rejected job ad "${entityName}"${notes ? ` - ${notes}` : ''}`;
      case 'COMPANY_CREATED':
        return `Created company "${entityName}"`;
      case 'COMPANY_UPDATED':
        return `Updated company "${entityName}"`;
      case 'MOU_CREATED':
        return `Created MOU for "${entityName}"`;
      case 'MOU_UPDATED':
        return `Updated MOU for "${entityName}"`;
      case 'MOU_ACTIVATED':
        return `Activated MOU for "${entityName}"`;
      case 'MOU_DEACTIVATED':
        return `Deactivated MOU for "${entityName}"${notes ? ` - ${notes}` : ''}`;
      case 'CANDIDATE_SCREENED':
        return `Screened candidate "${entityName}"`;
      case 'CANDIDATE_RATED':
        return `Rated candidate "${entityName}"`;
      default:
        return `${actionType} - ${entityName}`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="divide-y">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
      </div>

      {logs.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">No activity logs found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {logs.map((log) => {
            const Icon = getActionIcon(log.actionType);
            
            return (
              <div key={log.id} className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {log.performedBy?.name || 'System'}
                      </p>
                      {getActionBadge(log.actionType)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {getActionDescription(log)}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <span>
                        {new Date(log.createdAt).toLocaleDateString()} at{' '}
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                      
                      {log.ipAddress && (
                        <>
                          <span>•</span>
                          <span>IP: {log.ipAddress}</span>
                        </>
                      )}
                      
                      {log.userAgent && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-xs">
                            {log.userAgent}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {log.entityType}
                  </div>
                </div>
                
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="mt-3 ml-13 text-xs">
                    <details className="text-gray-600">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityLogTable;