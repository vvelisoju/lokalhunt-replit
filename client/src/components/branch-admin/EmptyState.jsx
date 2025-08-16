import { 
  ExclamationCircleIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const EmptyState = ({ 
  type = 'default', 
  title, 
  description, 
  actionText, 
  onAction,
  showIcon = true 
}) => {
  const getEmptyStateConfig = (type) => {
    switch (type) {
      case 'no-results':
        return {
          icon: MagnifyingGlassIcon,
          title: title || 'No results found',
          description: description || 'Try adjusting your search filters or terms.',
          actionText: actionText || 'Clear filters',
          iconColor: 'text-gray-400'
        };
      case 'no-ads':
        return {
          icon: DocumentTextIcon,
          title: title || 'No ads pending approval',
          description: description || 'All job ads have been processed. New submissions will appear here.',
          actionText: actionText || 'Refresh',
          iconColor: 'text-blue-400'
        };
      case 'no-employers':
        return {
          icon: UserGroupIcon,
          title: title || 'No employers found',
          description: description || 'No employers match your current filters.',
          actionText: actionText || 'Reset filters',
          iconColor: 'text-green-400'
        };
      case 'no-candidates':
        return {
          icon: UserGroupIcon,
          title: title || 'No candidates for screening',
          description: description || 'All candidates have been processed or no new allocations are available.',
          actionText: actionText || 'Refresh',
          iconColor: 'text-purple-400'
        };
      case 'no-mous':
        return {
          icon: DocumentTextIcon,
          title: title || 'No MOUs found',
          description: description || 'No MOUs match your current criteria.',
          actionText: actionText || 'Create MOU',
          iconColor: 'text-orange-400'
        };
      case 'no-logs':
        return {
          icon: ExclamationCircleIcon,
          title: title || 'No activity logs',
          description: description || 'No activity has been recorded for the selected timeframe.',
          actionText: actionText || 'Adjust filters',
          iconColor: 'text-gray-400'
        };
      case 'error':
        return {
          icon: ExclamationCircleIcon,
          title: title || 'Something went wrong',
          description: description || 'There was an error loading the data. Please try again.',
          actionText: actionText || 'Retry',
          iconColor: 'text-red-400'
        };
      case 'create':
        return {
          icon: PlusIcon,
          title: title || 'Get started',
          description: description || 'Create your first item to get started.',
          actionText: actionText || 'Create new',
          iconColor: 'text-blue-400'
        };
      default:
        return {
          icon: ExclamationCircleIcon,
          title: title || 'No data available',
          description: description || 'There is no data to display at this time.',
          actionText: actionText || 'Refresh',
          iconColor: 'text-gray-400'
        };
    }
  };

  const config = getEmptyStateConfig(type);
  const Icon = config.icon;

  return (
    <div className="text-center py-12">
      {showIcon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <Icon className={`h-12 w-12 ${config.iconColor}`} />
        </div>
      )}
      
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        {config.title}
      </h3>
      
      <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
        {config.description}
      </p>
      
      {onAction && config.actionText && (
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={onAction}
          >
            {config.actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;