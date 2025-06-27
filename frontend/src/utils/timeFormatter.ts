/**
 * Converts ISO 8601 duration format to human-readable time format (mm:ss or h:mm:ss)
 * 
 * @param iso8601Duration - ISO 8601 duration string (e.g., "PT4M20S", "PT1H2M3S")
 * @returns Formatted time string (e.g., "4:20", "1:02:03")
 * 
 * @example
 * formatPlaybackTime("PT4M20S") // "4:20"
 * formatPlaybackTime("PT1H2M3S") // "1:02:03"
 * formatPlaybackTime("PT30S") // "0:30"
 */
export function formatPlaybackTime(iso8601Duration: string): string {
  if (!iso8601Duration || typeof iso8601Duration !== 'string') {
    return '0:00';
  }

  // Check if string starts with PT (case-insensitive), if not return default
  if (!/^PT/i.test(iso8601Duration)) {
    return '0:00';
  }

  // Remove 'PT' prefix and make case-insensitive
  const duration = iso8601Duration.replace(/^PT/i, '');
  
  // Extract hours, minutes, and seconds using regex
  const hoursMatch = duration.match(/(\d+)H/i);
  const minutesMatch = duration.match(/(\d+)M/i);
  const secondsMatch = duration.match(/(\d+(?:\.\d+)?)S/i);
  
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  const seconds = secondsMatch ? Math.floor(parseFloat(secondsMatch[1])) : 0;
  
  // Check if original string explicitly contains H to determine if we should include hours in output
  const hasHours = /\d+H/i.test(iso8601Duration) || hours > 0;
  
  // Format based on presence of hours in original string
  if (hasHours) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}