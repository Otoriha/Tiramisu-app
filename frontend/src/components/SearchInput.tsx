import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/icons"
import { debounce } from "@/utils/debounce"

export interface SearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  defaultValue?: string
  variant?: 'default' | 'luxury' | 'outline' | 'premium' | 'glass'
  size?: 'sm' | 'default' | 'lg'
  animated?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    onSearch, 
    placeholder = "検索...", 
    disabled = false, 
    className, 
    defaultValue = "", 
    variant = 'default',
    size = 'default',
    animated = true,
    ...props 
  }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState(defaultValue)
    const [isFocused, setIsFocused] = React.useState(false)

    // Update search query when defaultValue changes
    React.useEffect(() => {
      setSearchQuery(defaultValue)
    }, [defaultValue])

    const debouncedSearch = React.useMemo(
      () => debounce((query: string) => {
        if (query.trim()) {
          onSearch(query.trim())
        }
      }, 300),
      [onSearch]
    )

    const handleSearch = React.useCallback(() => {
      if (searchQuery.trim()) {
        onSearch(searchQuery.trim())
      }
    }, [searchQuery, onSearch])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault()
        handleSearch()
      }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setSearchQuery(value)
      debouncedSearch(value)
    }

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    // Size configurations
    const sizeConfig = {
      sm: {
        container: 'max-w-xs',
        input: 'text-sm',
        button: 'sm',
        icon: 'h-3 w-3'
      },
      default: {
        container: 'max-w-sm',
        input: 'text-base',
        button: 'sm',
        icon: 'h-4 w-4'
      },
      lg: {
        container: 'max-w-md',
        input: 'text-lg',
        button: 'default',
        icon: 'h-5 w-5'
      }
    }

    const config = sizeConfig[size]

    // Container classes based on variant
    const containerClasses = [
      'relative flex w-full items-center transition-all duration-300',
      config.container,
      animated && 'luxury-hover-lift',
      className
    ].filter(Boolean).join(' ')

    // Button variant mapping
    const buttonVariant = variant === 'luxury' ? 'luxury' : 
                         variant === 'premium' ? 'premium' : 
                         variant === 'glass' ? 'ghost' : 'default'

    return (
      <div className={containerClasses}>
        <div className="relative flex-1">
          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Search className={`${config.icon} text-luxury-brown-400 transition-colors duration-300 ${
              isFocused ? 'text-luxury-warm-600' : ''
            }`} />
          </div>
          
          <Input
            ref={ref}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            variant={variant}
            hasIcon={true}
            className={`${config.input} pr-24`}
            aria-label="検索入力"
            {...props}
          />
          
          {/* Search Button */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Button
              type="button"
              onClick={handleSearch}
              disabled={disabled || !searchQuery.trim()}
              size={config.button as any}
              variant={buttonVariant as any}
              aria-label="検索実行"
              className={`${animated ? 'hover:scale-105 active:scale-95' : ''} transition-transform duration-200`}
            >
              <Search className={config.icon} />
            </Button>
          </div>
        </div>

        {/* Focus glow effect for luxury variants */}
        {animated && (variant === 'luxury' || variant === 'premium') && (
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-luxury-gold-400/20 to-luxury-warm-400/20 opacity-0 ${
            isFocused ? 'opacity-100' : ''
          } transition-opacity duration-500 pointer-events-none -z-10 blur-xl`} />
        )}
      </div>
    )
  }
)

SearchInput.displayName = "SearchInput"

export { SearchInput }