import React from 'react'
import { clsx } from 'clsx'

interface RadioProps {
  checked?: boolean
  defaultChecked?: boolean
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

const Radio: React.FC<RadioProps> = ({
  checked,
  defaultChecked,
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
  
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : internalChecked

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
      radio: 'w-4 h-4',
      indicator: 'w-2 h-2',
      label: 'text-sm',
      description: 'text-xs'
    },
    default: {
      radio: 'w-5 h-5',
      indicator: 'w-2.5 h-2.5',
      label: 'text-base',
      description: 'text-sm'
    },
    lg: {
      radio: 'w-6 h-6',
      indicator: 'w-3 h-3',
      label: 'text-lg',
      description: 'text-base'
    }
  }

  const config = sizeConfig[size]

  // Variant configurations
  const variantClasses = {
    default: {
      radio: [
        'border-2 border-luxury-cream-400 bg-white',
        'checked:border-luxury-warm-500 focus:ring-luxury-warm-500',
        'hover:border-luxury-cream-500 transition-all duration-200'
      ],
      indicator: 'bg-luxury-warm-500'
    },
    luxury: {
      radio: [
        'border-2 border-luxury-gold-400 bg-gradient-to-br from-luxury-cream-50 to-white',
        'checked:border-luxury-gold-500 focus:ring-luxury-gold-500 focus:ring-2',
        'hover:border-luxury-gold-500 transition-all duration-300',
        'shadow-sm checked:shadow-md',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-luxury-gold-100/50 before:to-transparent before:opacity-0 checked:before:opacity-100 before:transition-opacity before:duration-300 before:rounded-full before:pointer-events-none'
      ],
      indicator: 'bg-gradient-to-br from-luxury-gold-500 to-luxury-gold-600 shadow-sm'
    },
    outline: {
      radio: [
        'border-2 border-luxury-brown-400 bg-transparent',
        'checked:border-luxury-brown-600 focus:ring-luxury-brown-500',
        'hover:border-luxury-brown-500 backdrop-blur-sm transition-all duration-200'
      ],
      indicator: 'bg-luxury-brown-600'
    },
    premium: {
      radio: [
        'border-2 border-luxury-gold-400/70 bg-gradient-to-br from-luxury-brown-800 to-luxury-brown-900',
        'checked:border-luxury-gold-500 focus:ring-luxury-gold-400 focus:ring-2',
        'hover:border-luxury-gold-400 transition-all duration-400',
        'shadow-lg checked:shadow-xl',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-luxury-gold-300/20 before:to-transparent before:opacity-0 checked:before:opacity-100 before:transition-opacity before:duration-500 before:rounded-full before:pointer-events-none'
      ],
      indicator: 'bg-gradient-to-br from-luxury-gold-400 to-luxury-gold-600 shadow-md'
    },
    glass: {
      radio: [
        'border border-white/40 bg-white/20 backdrop-blur-md',
        'checked:border-white/60 focus:ring-white/40',
        'hover:border-white/50 hover:bg-white/30 transition-all duration-300',
        'shadow-lg checked:shadow-xl'
      ],
      indicator: 'bg-white/80 backdrop-blur-sm'
    }
  }

  const radioClasses = clsx(
    'relative rounded-full cursor-pointer transition-all duration-300 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    config.radio,
    variantClasses[variant].radio,
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
          type="radio"
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
          className={radioClasses}
          aria-hidden="true"
        >
          {/* Radio Indicator */}
          <div className={clsx(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          )}>
            <div className={clsx(
              'rounded-full transition-all duration-300',
              config.indicator,
              variantClasses[variant].indicator
            )} />
          </div>

          {/* Ripple effect for luxury variants */}
          {(variant === 'luxury' || variant === 'premium') && (
            <div className="absolute inset-0 rounded-full bg-current opacity-0 group-active:opacity-20 transition-opacity duration-150" />
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

// Radio Group Component
interface RadioGroupProps {
  options: Array<{
    value: string
    label: string
    description?: string
    disabled?: boolean
  }>
  value?: string
  defaultValue?: string
  disabled?: boolean
  variant?: 'default' | 'luxury' | 'outline' | 'premium' | 'glass'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  onChange?: (value: string) => void
  name?: string
  required?: boolean
  label?: string
  orientation?: 'horizontal' | 'vertical'
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  defaultValue = '',
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  onChange,
  name = 'radio-group',
  required = false,
  label,
  orientation = 'vertical'
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue)
  
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleChange = (optionValue: string) => {
    if (!isControlled) {
      setInternalValue(optionValue)
    }
    
    onChange?.(optionValue)
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
      
      <div className={groupClasses} role="radiogroup">
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={currentValue === option.value}
            disabled={disabled || option.disabled}
            variant={variant}
            size={size}
            label={option.label}
            description={option.description}
            onChange={() => handleChange(option.value)}
          />
        ))}
      </div>
    </fieldset>
  )
}

export { Radio, RadioGroup }
export type { RadioProps, RadioGroupProps }