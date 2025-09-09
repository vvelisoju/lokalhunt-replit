import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Date.now()
    const newToast = { id, ...toast }
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed z-[9999] space-y-2" style={{ 
          top: 'calc(1rem + var(--safe-area-inset-top))', 
          right: '1rem',
          left: '1rem',
          maxWidth: '20rem',
          marginLeft: 'auto'
        }}>
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-2xl border-2 w-full max-w-sm ${
                toast.type === 'error' 
                  ? 'bg-red-500 text-white border-red-600'
                  : toast.type === 'success'
                  ? 'bg-green-500 text-white border-green-600'
                  : 'bg-blue-500 text-white border-blue-600'
              }`}
              style={{ 
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              <div className="flex justify-between items-center">
                <span>{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-3 text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  
  return {
    toast: (message, type = 'info') => {
      context.addToast({ message, type })
    },
    success: (message) => context.addToast({ message, type: 'success' }),
    error: (message) => context.addToast({ message, type: 'error' }),
    info: (message) => context.addToast({ message, type: 'info' })
  }
}