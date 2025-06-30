import React, { useState, useEffect, createContext, useContext } from 'react'
import { clsx } from 'clsx'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  persistent?: boolean
}

interface ToastProps extends ToastData {
  onClose: (id: string) => void
  variant?: 'default' | 'luxury'
}

interface ToastContextValue {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

// Toast Hook
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Component
const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  persistent = false,
  onClose,
  variant = 'default'
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Show animation
    setIsVisible(true)

    // Auto-remove if not persistent
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, persistent])

  const handleClose = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  // Icon mapping
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const Icon = icons[type]

  // Style configurations
  const typeStyles = {
    success: {
      default: 'bg-green-50 border-green-200 text-green-800',
      luxury: 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300/50 text-green-900 shadow-lg',
      icon: 'text-green-600'
    },
    error: {
      default: 'bg-red-50 border-red-200 text-red-800',
      luxury: 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300/50 text-red-900 shadow-lg',
      icon: 'text-red-600'
    },
    warning: {
      default: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      luxury: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300/50 text-yellow-900 shadow-lg',
      icon: 'text-yellow-600'
    },
    info: {
      default: 'bg-blue-50 border-blue-200 text-blue-800',
      luxury: 'bg-gradient-to-r from-luxury-cream-50 to-luxury-warm-50 border-2 border-luxury-warm-300/50 text-luxury-brown-900 shadow-lg',
      icon: 'text-luxury-warm-600'
    }
  }

  const styles = typeStyles[type]

  const toastClasses = clsx(
    'relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm',
    'transition-all duration-300 ease-out',
    'max-w-md w-full shadow-md hover:shadow-lg',
    variant === 'luxury' ? styles.luxury : styles.default,
    isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
    isRemoving && 'translate-x-full opacity-0'
  )

  return (
    <div className={toastClasses}>
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={clsx('w-5 h-5', styles.icon)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{title}</div>
        {description && (
          <div className="text-sm opacity-90 mt-1">{description}</div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className={clsx(
          'flex-shrink-0 p-1 rounded-md transition-colors',
          'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50',
          styles.icon
        )}
        aria-label="閉じる"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar for timed toasts */}
      {!persistent && duration > 0 && variant === 'luxury' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-xl overflow-hidden">
          <div 
            className={clsx(
              'h-full transition-all ease-linear',
              type === 'success' && 'bg-green-500',
              type === 'error' && 'bg-red-500',
              type === 'warning' && 'bg-yellow-500',
              type === 'info' && 'bg-luxury-warm-500'
            )}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear`
            }}
          />
        </div>
      )}
    </div>
  )
}

// Toast Container
interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  variant?: 'default' | 'luxury'
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  position = 'top-right',
  variant = 'default'
}) => {
  const { toasts, removeToast } = useToast()

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className={clsx(
      'fixed z-50 flex flex-col gap-2',
      positionClasses[position]
    )}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
          variant={variant}
        />
      ))}
    </div>
  )
}

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode
  variant?: 'default' | 'luxury'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  variant = 'default',
  position = 'top-right'
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer position={position} variant={variant} />
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

// Convenience functions
export const toast = {
  success: (title: string, description?: string, options?: Partial<ToastData>) => ({
    type: 'success' as const,
    title,
    description,
    ...options
  }),
  error: (title: string, description?: string, options?: Partial<ToastData>) => ({
    type: 'error' as const,
    title,
    description,
    ...options
  }),
  warning: (title: string, description?: string, options?: Partial<ToastData>) => ({
    type: 'warning' as const,
    title,
    description,
    ...options
  }),
  info: (title: string, description?: string, options?: Partial<ToastData>) => ({
    type: 'info' as const,
    title,
    description,
    ...options
  })
}

export { Toast, ToastContainer, ToastProvider }
export type { ToastProps, ToastContainerProps, ToastProviderProps }