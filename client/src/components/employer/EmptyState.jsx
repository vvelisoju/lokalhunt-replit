import React from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'

const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {actionText}
          </Button>
        </div>
      )}
    </div>
  )
}

export default EmptyState