import React, { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  variant?: 'default' | 'luxury' | 'outline' | 'premium' | 'glass'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  name?: string
  required?: boolean
  'aria-label'?: string
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  placeholder = '選択してください',
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  onChange,
  onBlur,
  name,
  required,
  'aria-label': ariaLabel
}) => {
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '')
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const selectRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Update selected value when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else if (focusedIndex >= 0) {
          const option = options[focusedIndex]
          if (!option.disabled) {
            handleSelect(option.value)
          }
        }
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else {
          setFocusedIndex(prev => {
            const nextIndex = prev < options.length - 1 ? prev + 1 : 0
            return options[nextIndex].disabled ? 
              (nextIndex < options.length - 1 ? nextIndex + 1 : 0) : nextIndex
          })
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setFocusedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : options.length - 1
            return options[nextIndex].disabled ? 
              (nextIndex > 0 ? nextIndex - 1 : options.length - 1) : nextIndex
          })
        }
        break
    }
  }

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue)
    setIsOpen(false)
    setFocusedIndex(-1)
    onChange?.(optionValue)
  }

  const handleBlur = () => {
    onBlur?.()
  }

  const selectedOption = options.find(option => option.value === selectedValue)

  // Size configurations
  const sizeConfig = {
    sm: {
      trigger: 'h-10 px-3 py-2 text-sm',
      dropdown: 'text-sm',
      option: 'px-3 py-2 text-sm'
    },
    default: {
      trigger: 'h-12 px-4 py-3 text-base',
      dropdown: 'text-base',
      option: 'px-4 py-3 text-base'
    },
    lg: {
      trigger: 'h-14 px-5 py-4 text-lg',
      dropdown: 'text-lg',
      option: 'px-5 py-4 text-lg'
    }
  }

  const config = sizeConfig[size]

  // Variant configurations
  const variantClasses = {
    default: {
      trigger: [
        'border-2 border-luxury-cream-300 bg-white text-luxury-brown-900',
        'hover:border-luxury-cream-400 focus:border-luxury-warm-500 focus:ring-luxury-warm-500',
        'transition-all duration-300'
      ],
      dropdown: 'bg-white border border-luxury-cream-300 shadow-lg',
      option: 'text-luxury-brown-900 hover:bg-luxury-cream-100'
    },
    luxury: {
      trigger: [
        'border-2 border-luxury-gold-300 bg-gradient-to-r from-luxury-cream-50 to-white',
        'text-luxury-brown-900 font-medium',
        'hover:border-luxury-gold-400 focus:border-luxury-gold-500 focus:ring-luxury-gold-500',
        'focus:shadow-lg transition-all duration-300',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-luxury-gold-50/30 before:to-transparent before:opacity-0 focus:before:opacity-100 before:transition-opacity before:duration-500 before:rounded-xl before:pointer-events-none'
      ],
      dropdown: 'bg-gradient-to-br from-luxury-cream-50 to-white border-2 border-luxury-gold-300/50 shadow-2xl backdrop-blur-sm',
      option: 'text-luxury-brown-900 hover:bg-luxury-gold-100/70 focus:bg-luxury-gold-100'
    },
    outline: {
      trigger: [
        'border-2 border-luxury-brown-300 bg-transparent text-luxury-brown-900',
        'hover:border-luxury-brown-400 hover:bg-luxury-cream-50/50 focus:border-luxury-brown-600 focus:ring-luxury-brown-500',
        'backdrop-blur-sm transition-all duration-300'
      ],
      dropdown: 'bg-white/90 backdrop-blur-md border border-luxury-brown-300 shadow-xl',
      option: 'text-luxury-brown-900 hover:bg-luxury-cream-100/80'
    },
    premium: {
      trigger: [
        'border-2 border-luxury-gold-400/50 bg-gradient-to-r from-luxury-brown-900 via-luxury-brown-800 to-luxury-brown-900',
        'text-luxury-gold-100 font-semibold placeholder:text-luxury-gold-300/60',
        'hover:border-luxury-gold-300/70 focus:border-luxury-gold-300 focus:ring-luxury-gold-400',
        'focus:shadow-2xl transition-all duration-500',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-luxury-gold-400/10 before:to-transparent before:opacity-0 focus:before:opacity-100 before:transition-opacity before:duration-700 before:rounded-2xl before:pointer-events-none'
      ],
      dropdown: 'bg-gradient-to-br from-luxury-brown-900 to-luxury-brown-800 border-2 border-luxury-gold-400/50 shadow-3xl',
      option: 'text-luxury-gold-100 hover:bg-luxury-gold-400/20 focus:bg-luxury-gold-400/30'
    },
    glass: {
      trigger: [
        'border border-white/30 bg-white/10 backdrop-blur-md text-luxury-brown-900',
        'hover:border-white/40 hover:bg-white/20 focus:border-white/50 focus:ring-white/30',
        'focus:bg-white/20 transition-all duration-300 shadow-lg focus:shadow-xl'
      ],
      dropdown: 'bg-white/20 backdrop-blur-lg border border-white/40 shadow-2xl',
      option: 'text-luxury-brown-900 hover:bg-white/30 focus:bg-white/40'
    }
  }

  const triggerClasses = clsx(
    'relative w-full rounded-xl flex items-center justify-between cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-300 ease-out',
    config.trigger,
    variantClasses[variant].trigger,
    className
  )

  const dropdownClasses = clsx(
    'absolute z-50 w-full mt-1 rounded-xl overflow-hidden',
    'max-h-60 overflow-y-auto',
    config.dropdown,
    variantClasses[variant].dropdown
  )

  const optionClasses = (option: SelectOption, index: number) => clsx(
    'w-full flex items-center justify-between cursor-pointer transition-colors duration-200',
    config.option,
    variantClasses[variant].option,
    option.disabled && 'opacity-50 cursor-not-allowed',
    focusedIndex === index && !option.disabled && 'bg-opacity-80',
    selectedValue === option.value && 'font-semibold'
  )

  return (
    <div ref={selectRef} className="relative w-full">
      <div
        className={triggerClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-required={required}
      >
        <span className={clsx(
          'block truncate',
          !selectedOption && 'text-luxury-brown-400'
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <ChevronDown 
          className={clsx(
            'w-5 h-5 transition-transform duration-300',
            isOpen && 'rotate-180',
            variant === 'premium' ? 'text-luxury-gold-300' : 'text-luxury-brown-500'
          )}
        />
      </div>

      {isOpen && (
        <div className={dropdownClasses}>
          <div
            ref={listRef}
            role="listbox"
            aria-label="Options"
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                className={optionClasses(option, index)}
                onClick={() => !option.disabled && handleSelect(option.value)}
                role="option"
                aria-selected={selectedValue === option.value}
                aria-disabled={option.disabled}
              >
                <span className="block truncate">{option.label}</span>
                {selectedValue === option.value && (
                  <Check className={clsx(
                    'w-5 h-5',
                    variant === 'premium' ? 'text-luxury-gold-300' : 'text-luxury-warm-600'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={selectedValue}
      />
    </div>
  )
}

export { Select }
export type { SelectProps, SelectOption }