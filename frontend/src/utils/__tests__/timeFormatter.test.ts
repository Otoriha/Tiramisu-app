import { describe, it, expect } from 'vitest'
import { formatPlaybackTime } from '../timeFormatter'

describe('formatPlaybackTime', () => {
  describe('basic time formatting', () => {
    it('should format minutes and seconds correctly', () => {
      expect(formatPlaybackTime('PT4M20S')).toBe('4:20')
      expect(formatPlaybackTime('PT1M30S')).toBe('1:30')
      expect(formatPlaybackTime('PT10M5S')).toBe('10:05')
    })

    it('should format hours, minutes, and seconds correctly', () => {
      expect(formatPlaybackTime('PT1H2M3S')).toBe('1:02:03')
      expect(formatPlaybackTime('PT2H15M45S')).toBe('2:15:45')
      expect(formatPlaybackTime('PT10H0M0S')).toBe('10:00:00')
    })

    it('should handle seconds only', () => {
      expect(formatPlaybackTime('PT30S')).toBe('0:30')
      expect(formatPlaybackTime('PT5S')).toBe('0:05')
      expect(formatPlaybackTime('PT59S')).toBe('0:59')
    })

    it('should handle minutes only', () => {
      expect(formatPlaybackTime('PT5M')).toBe('5:00')
      expect(formatPlaybackTime('PT30M')).toBe('30:00')
    })

    it('should handle hours only', () => {
      expect(formatPlaybackTime('PT1H')).toBe('1:00:00')
      expect(formatPlaybackTime('PT3H')).toBe('3:00:00')
    })
  })

  describe('edge cases', () => {
    it('should handle zero duration', () => {
      expect(formatPlaybackTime('PT0S')).toBe('0:00')
      expect(formatPlaybackTime('PT0M0S')).toBe('0:00')
      expect(formatPlaybackTime('PT0H0M0S')).toBe('0:00:00')
    })

    it('should handle missing components', () => {
      expect(formatPlaybackTime('PT1H30S')).toBe('1:00:30')
      expect(formatPlaybackTime('PT2H5M')).toBe('2:05:00')
    })

    it('should handle decimal seconds', () => {
      expect(formatPlaybackTime('PT4M20.5S')).toBe('4:20')
      expect(formatPlaybackTime('PT30.9S')).toBe('0:30')
      expect(formatPlaybackTime('PT1M15.2S')).toBe('1:15')
    })

    it('should pad single digits with zeros', () => {
      expect(formatPlaybackTime('PT1M5S')).toBe('1:05')
      expect(formatPlaybackTime('PT1H2M3S')).toBe('1:02:03')
      expect(formatPlaybackTime('PT5H0M9S')).toBe('5:00:09')
    })
  })

  describe('case insensitivity', () => {
    it('should handle lowercase input', () => {
      expect(formatPlaybackTime('pt4m20s')).toBe('4:20')
      expect(formatPlaybackTime('pt1h2m3s')).toBe('1:02:03')
    })

    it('should handle mixed case input', () => {
      expect(formatPlaybackTime('Pt4M20s')).toBe('4:20')
      expect(formatPlaybackTime('PT1h2M3S')).toBe('1:02:03')
    })
  })

  describe('error handling', () => {
    it('should handle empty string', () => {
      expect(formatPlaybackTime('')).toBe('0:00')
    })

    it('should handle null/undefined input', () => {
      expect(formatPlaybackTime(null as any)).toBe('0:00')
      expect(formatPlaybackTime(undefined as any)).toBe('0:00')
    })

    it('should handle non-string input', () => {
      expect(formatPlaybackTime(123 as any)).toBe('0:00')
      expect(formatPlaybackTime({} as any)).toBe('0:00')
      expect(formatPlaybackTime([] as any)).toBe('0:00')
    })

    it('should handle malformed ISO 8601 strings', () => {
      expect(formatPlaybackTime('invalid')).toBe('0:00')
      expect(formatPlaybackTime('PT')).toBe('0:00')
      expect(formatPlaybackTime('P1D')).toBe('0:00')
      expect(formatPlaybackTime('PT1X')).toBe('0:00')
    })

    it('should handle missing PT prefix', () => {
      expect(formatPlaybackTime('4M20S')).toBe('0:00')
      expect(formatPlaybackTime('1H2M3S')).toBe('0:00')
    })
  })

  describe('large values', () => {
    it('should handle large hour values', () => {
      expect(formatPlaybackTime('PT24H0M0S')).toBe('24:00:00')
      expect(formatPlaybackTime('PT100H15M30S')).toBe('100:15:30')
    })

    it('should handle large minute values', () => {
      expect(formatPlaybackTime('PT120M30S')).toBe('120:30')
      expect(formatPlaybackTime('PT999M59S')).toBe('999:59')
    })

    it('should handle large second values', () => {
      expect(formatPlaybackTime('PT3661S')).toBe('0:3661')
      expect(formatPlaybackTime('PT1H3661S')).toBe('1:00:3661')
    })
  })

  describe('real-world YouTube examples', () => {
    it('should handle typical YouTube video durations', () => {
      // Short videos
      expect(formatPlaybackTime('PT15S')).toBe('0:15')
      expect(formatPlaybackTime('PT1M30S')).toBe('1:30')
      
      // Medium videos
      expect(formatPlaybackTime('PT5M42S')).toBe('5:42')
      expect(formatPlaybackTime('PT12M8S')).toBe('12:08')
      
      // Long videos
      expect(formatPlaybackTime('PT1H15M30S')).toBe('1:15:30')
      expect(formatPlaybackTime('PT2H45M12S')).toBe('2:45:12')
      
      // Very long content
      expect(formatPlaybackTime('PT10H30M45S')).toBe('10:30:45')
    })
  })
})