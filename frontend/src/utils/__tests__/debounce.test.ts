import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from '../debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call the function after the specified delay', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('test')
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledOnce()
    expect(mockFn).toHaveBeenCalledWith('test')
  })

  it('should delay the function call if called multiple times', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('first')
    vi.advanceTimersByTime(100)
    debouncedFn('second')
    vi.advanceTimersByTime(100)
    debouncedFn('third')

    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledOnce()
    expect(mockFn).toHaveBeenCalledWith('third')
  })

  it('should call the function with the latest arguments', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('arg1', 'arg2')
    debouncedFn('arg3', 'arg4')

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledOnce()
    expect(mockFn).toHaveBeenCalledWith('arg3', 'arg4')
  })

  it('should handle multiple separate calls correctly', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 300)

    debouncedFn('first')
    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledOnce()

    debouncedFn('second')
    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('second')
  })

  it('should work with functions that return values', () => {
    const mockFn = vi.fn((_arg: string) => 'result')
    const debouncedFn = debounce(mockFn, 300)

    const result = debouncedFn('test')
    expect(result).toBeUndefined() // debounced functions don't return values

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('test')
  })
})