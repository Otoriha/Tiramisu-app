import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export interface SearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, placeholder = "検索...", disabled = false, className, ...props }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState("")

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
      setSearchQuery(event.target.value)
    }

    return (
      <div className={`flex w-full max-w-sm items-center space-x-2 ${className || ""}`}>
        <Input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1"
          aria-label="検索入力"
          {...props}
        />
        <Button
          type="button"
          onClick={handleSearch}
          disabled={disabled || !searchQuery.trim()}
          size="sm"
          aria-label="検索実行"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    )
  }
)

SearchInput.displayName = "SearchInput"

export { SearchInput }