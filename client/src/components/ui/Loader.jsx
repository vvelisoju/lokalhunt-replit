import React from 'react'

const Loader = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]}`}></div>
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" text="Loading..." />
    </div>
  )
}

const InlineLoader = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <Loader size="sm" text="" />
    </div>
  )
}

Loader.Page = PageLoader
Loader.Inline = InlineLoader

export default Loader