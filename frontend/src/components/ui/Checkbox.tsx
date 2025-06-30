import React, { useRef } from 'react'
import { clsx } from 'clsx'
import { Check, Minus } from 'lucide-react'

interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  required?: boolean
  variant?: 'default' | 'luxury' | 'outline' | 'premium' | 'glass'
  size?: 'sm' | 'default' | 'lg'
  label?: string
  description?: string
  className?: string
  onChange?: (checked: boolean) => void
  onBlur?: () => void
  name?: string
  value?: string
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked,
  indeterminate = false,
  disabled = false,
  required = false,
  variant = 'default',
  size = 'default',
  label,
  description,
  className,
  onChange,
  onBlur,
  name,
  value,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : internalChecked

  // Set indeterminate state
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked
    
    if (!isControlled) {
      setInternalChecked(newChecked)
    }
    
    onChange?.(newChecked)
  }

  const handleBlur = () => {
    onBlur?.()
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      checkbox: 'w-4 h-4',
      icon: 'w-3 h-3',
      label: 'text-sm',
      description: 'text-xs'
    },
    default: {
      checkbox: 'w-5 h-5',
      icon: 'w-4 h-4',
      label: 'text-base',
      description: 'text-sm'
    },
    lg: {
      checkbox: 'w-6 h-6',
      icon: 'w-5 h-5',
      label: 'text-lg',
      description: 'text-base'
    }
  }

  const config = sizeConfig[size]

  // Variant configurations
  const variantClasses = {
    default: {
      checkbox: [
        'border-2 border-luxury-cream-400 bg-white',
        'checked:bg-luxury-warm-500 checked:border-luxury-warm-500',
        'hover:border-luxury-cream-500 focus:ring-luxury-warm-500',
        'transition-all duration-200'
      ],
      icon: 'text-white'
    },
    luxury: {
      checkbox: [
        'border-2 border-luxury-gold-400 bg-gradient-to-br from-luxury-cream-50 to-white',
        'checked:bg-gradient-to-br checked:from-luxury-gold-500 checked:to-luxury-gold-600 checked:border-luxury-gold-500',
        'hover:border-luxury-gold-500 focus:ring-luxury-gold-500 focus:ring-2',
        'shadow-sm checked:shadow-md transition-all duration-300',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-luxury-gold-100/50 before:to-transparent before:opacity-0 checked:before:opacity-100 before:transition-opacity before:duration-300 before:rounded-md before:pointer-events-none'
      ],
      icon: 'text-white drop-shadow-sm'
    },
    outline: {
      checkbox: [
        'border-2 border-luxury-brown-400 bg-transparent',
        'checked:bg-luxury-brown-600 checked:border-luxury-brown-600',
        'hover:border-luxury-brown-500 focus:ring-luxury-brown-500',
        'backdrop-blur-sm transition-all duration-200'
      ],
      icon: 'text-white'
    },
    premium: {
      checkbox: [
        'border-2 border-luxury-gold-400/70 bg-gradient-to-br from-luxury-brown-800 to-luxury-brown-900',
        'checked:bg-gradient-to-br checked:from-luxury-gold-600 checked:to-luxury-gold-700 checked:border-luxury-gold-500',
        'hover:border-luxury-gold-400 focus:ring-luxury-gold-400 focus:ring-2',
        'shadow-lg checked:shadow-xl transition-all duration-400',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-luxury-gold-300/20 before:to-transparent before:opacity-0 checked:before:opacity-100 before:transition-opacity before:duration-500 before:rounded-lg before:pointer-events-none'
      ],
      icon: 'text-luxury-brown-900 drop-shadow-sm'
    },
    glass: {
      checkbox: [
        'border border-white/40 bg-white/20 backdrop-blur-md',
        'checked:bg-white/40 checked:border-white/60',
        'hover:border-white/50 hover:bg-white/30 focus:ring-white/40',
        'shadow-lg checked:shadow-xl transition-all duration-300'
      ],
      icon: 'text-luxury-brown-900'
    }
  }

  const checkboxClasses = clsx(
    'relative rounded-md cursor-pointer transition-all duration-300 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    config.checkbox,
    variantClasses[variant].checkbox,
    !disabled && 'hover:scale-105 active:scale-95'
  )

  const containerClasses = clsx(
    'flex items-start gap-3',
    disabled && 'opacity-60 cursor-not-allowed',
    className
  )

  const labelClasses = clsx(
    'font-medium cursor-pointer select-none',
    config.label,
    variant === 'premium' ? 'text-luxury-gold-100' : 'text-luxury-brown-900',
    disabled && 'cursor-not-allowed'
  )

  const descriptionClasses = clsx(
    'mt-1 leading-relaxed',
    config.description,
    variant === 'premium' ? 'text-luxury-gold-200/80' : 'text-luxury-brown-600'
  )

  const generatedId = id || React.useId()

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="checkbox"
          id={generatedId}
          name={name}
          value={value}
          checked={isChecked}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          onBlur={handleBlur}
          className="sr-only"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        />
        
        <label
          htmlFor={generatedId}
          className={checkboxClasses}
          aria-hidden="true"
        >
          {/* Check/Indeterminate Icon */}
          <div className={clsx(
            'absolute inset-0 flex items-center justify-center',
            'transition-all duration-300',
            (isChecked || indeterminate) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          )}>
            {indeterminate ? (
              <Minus className={clsx(config.icon, variantClasses[variant].icon)} />
            ) : (
              <Check className={clsx(config.icon, variantClasses[variant].icon)} />
            )}
          </div>

          {/* Ripple effect for luxury variants */}
          {(variant === 'luxury' || variant === 'premium') && (
            <div className="absolute inset-0 rounded-md bg-current opacity-0 group-active:opacity-20 transition-opacity duration-150" />
          )}
        </label>
      </div>

      {/* Label and Description */}
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={generatedId}
              className={labelClasses}
            >
              {label}
              {required && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </label>
          )}
          {description && (
            <p className={descriptionClasses}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Checkbox Group Component
interface CheckboxGroupProps {
  options: Array<{
    value: string
    label: string
    description?: string
    disabled?: boolean
  }>
  value?: string[]
  defaultValue?: string[]
  disabled?: boolean
  variant?: 'default' | 'luxury' | 'outline' | 'premium' | 'glass'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  onChange?: (values: string[]) => void
  name?: string
  required?: boolean
  label?: string
  orientation?: 'horizontal' | 'vertical'
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value,
  defaultValue = [],
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  onChange,
  name,
  required = false,
  label,
  orientation = 'vertical'
}) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue)
  
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleChange = (optionValue: string, checked: boolean) => {
    const newValue = checked
      ? [...currentValue, optionValue]
      : currentValue.filter(v => v !== optionValue)
    
    if (!isControlled) {
      setInternalValue(newValue)
    }
    
    onChange?.(newValue)
  }

  const groupClasses = clsx(
    'space-y-3',
    orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0',
    className
  )

  return (
    <fieldset className={className}>
      {label && (
        <legend className={clsx(
          'text-base font-medium mb-3',
          variant === 'premium' ? 'text-luxury-gold-100' : 'text-luxury-brown-900'
        )}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </legend>
      )}
      
      <div className={groupClasses}>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            name={name}
            value={option.value}
            checked={currentValue.includes(option.value)}
            disabled={disabled || option.disabled}
            variant={variant}
            size={size}
            label={option.label}
            description={option.description}
            onChange={(checked) => handleChange(option.value, checked)}
          />
        ))}
      </div>
    </fieldset>
  )
}

export { Checkbox, CheckboxGroup }
export type { CheckboxProps, CheckboxGroupProps }