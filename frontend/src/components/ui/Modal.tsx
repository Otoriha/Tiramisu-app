import React, { useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { X } from 'lucide-react'
import { Button } from './button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  variant?: 'default' | 'luxury' | 'glass' | 'fullscreen'
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  className?: string
  overlayClassName?: string
  title?: string
  description?: string
  footer?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  variant = 'default',
  size = 'default',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  overlayClassName,
  title,
  description,
  footer
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      modalRef.current?.focus()
    } else {
      ;(previousActiveElement.current as HTMLElement)?.focus?.()
    }
  }, [isOpen])

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  }

  // Variant configurations
  const variantClasses = {
    default: {
      modal: 'bg-white border border-luxury-cream-200 shadow-2xl',
      overlay: 'bg-black/50'
    },
    luxury: {
      modal: 'bg-gradient-to-br from-luxury-cream-50 via-white to-luxury-cream-50 border-2 border-luxury-gold-300/50 shadow-3xl',
      overlay: 'bg-gradient-to-br from-black/60 via-luxury-brown-900/30 to-black/60 backdrop-blur-sm'
    },
    glass: {
      modal: 'bg-white/80 backdrop-blur-lg border border-white/30 shadow-2xl',
      overlay: 'bg-black/30 backdrop-blur-sm'
    },
    fullscreen: {
      modal: 'bg-white w-full h-full border-0 shadow-none',
      overlay: 'bg-black/80'
    }
  }

  const config = variantClasses[variant]

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalClasses = clsx(
    'relative rounded-xl transform transition-all duration-300 ease-out',
    'w-full mx-4 max-h-[90vh] overflow-hidden',
    variant !== 'fullscreen' && sizeClasses[size],
    variant === 'fullscreen' ? 'rounded-none max-h-none h-full mx-0' : '',
    config.modal,
    className
  )

  const overlayClasses = clsx(
    'fixed inset-0 z-50 flex items-center justify-center p-4',
    'transition-all duration-300 ease-out',
    config.overlay,
    overlayClassName
  )

  return (
    <div className={overlayClasses} onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={clsx(
            'flex items-center justify-between p-6 border-b',
            variant === 'luxury' ? 'border-luxury-gold-200/50' : 'border-luxury-cream-200'
          )}>
            {title && (
              <div>
                <h2 
                  id="modal-title" 
                  className={clsx(
                    'text-xl font-semibold',
                    variant === 'luxury' ? 'text-luxury-brown-900' : 'text-gray-900'
                  )}
                >
                  {title}
                </h2>
                {description && (
                  <p 
                    id="modal-description"
                    className={clsx(
                      'mt-1 text-sm',
                      variant === 'luxury' ? 'text-luxury-brown-600' : 'text-gray-600'
                    )}
                  >
                    {description}
                  </p>
                )}
              </div>
            )}
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={clsx(
                  'hover:bg-gray-100 rounded-full p-2',
                  variant === 'luxury' && 'hover:bg-luxury-cream-100'
                )}
                aria-label="モーダルを閉じる"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={clsx(
          'overflow-y-auto',
          variant === 'fullscreen' ? 'flex-1' : 'max-h-[calc(90vh-8rem)]',
          !title && !showCloseButton && variant !== 'fullscreen' && 'rounded-t-xl'
        )}>
          <div className={clsx(
            variant === 'fullscreen' ? 'h-full' : 'p-6'
          )}>
            {children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className={clsx(
            'flex items-center justify-end gap-3 p-6 border-t bg-gray-50/50',
            variant === 'luxury' ? 'border-luxury-gold-200/50 bg-luxury-cream-50/50' : 'border-luxury-cream-200'
          )}>
            {footer}
          </div>
        )}

        {/* Luxury decoration */}
        {variant === 'luxury' && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-luxury-gold-100/10 via-transparent to-luxury-warm-100/10 pointer-events-none" />
        )}
      </div>
    </div>
  )
}

// Modal Hook for easier usage
interface UseModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useModal = (initialState = false): UseModalReturn => {
  const [isOpen, setIsOpen] = React.useState(initialState)

  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), [])

  return { isOpen, open, close, toggle }
}

// Confirmation Modal
interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'luxury'
  danger?: boolean
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'default',
  danger = false
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const confirmButtonVariant = danger ? 'destructive' : 
    variant === 'luxury' ? 'luxury' : 'default'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant={variant}
      size="sm"
      title={title}
      description={description}
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant as any}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div />
    </Modal>
  )
}

// Alert Modal
interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  buttonText?: string
  variant?: 'default' | 'luxury'
  type?: 'info' | 'success' | 'warning' | 'error'
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  buttonText = 'OK',
  variant = 'default',
  type = 'info'
}) => {
  const buttonVariant = type === 'error' ? 'destructive' :
    type === 'success' ? 'luxury' :
    variant === 'luxury' ? 'luxury' : 'default'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant={variant}
      size="sm"
      title={title}
      description={description}
      footer={
        <Button
          variant={buttonVariant as any}
          onClick={onClose}
        >
          {buttonText}
        </Button>
      }
    >
      <div />
    </Modal>
  )
}

export { Modal }
export type { ModalProps }