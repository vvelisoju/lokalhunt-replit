import React from 'react'

const Card = ({ children, className = '', padding = 'p-6', shadow = 'shadow-md' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${shadow} ${padding} ${className}`}>
      {children}
    </div>
  )
}

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  )
}

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Content = CardContent
Card.Footer = CardFooter

export default Card