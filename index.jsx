import { css } from "uebersicht"

// ╔═══════════════════════════════════════════════════════════════╗
// ║                    CONFIGURATION SECTION                      ║
// ║          Edit these values to customize your widget           ║
// ╚═══════════════════════════════════════════════════════════════╝

const CONFIG = {
  // Widget Position (in pixels from screen edges)
  position: {
    top: 40,      // Distance from top of screen
    left: 400,    // Distance from left of screen
    right: 40,    // Distance from right of screen (widget stretches between left and right)
  },

  // Calendar Settings
  calendar: {
    daysToShow: 7,           // How many days ahead to display (e.g., 7 = next week)
    refreshMinutes: 10,      // How often to update (in minutes)
    icalBuddyPath: '/opt/homebrew/bin/icalBuddy',  // Path to iCalBuddy binary
  },

  // Appearance
  appearance: {
    fontSize: 24,            // Font size in pixels
    fontFamily: '-apple-system, Menlo, monospace',  // Font family
    lineHeight: 1.4,         // Space between lines (1.0 = tight, 2.0 = double-spaced)
    textColor: 'white',      // Default text color
    columnGap: 40,           // Space between the two columns (in pixels)
    textShadow: '0 0 6px rgba(0,0,0,0.7)',  // Shadow behind text for readability
  },

  // Advanced: ANSI color mapping (maps terminal colors to hex values)
  // Only change these if you want to customize event colors
  ansiColors: {
    30: '#000000', 31: '#e06c75', 32: '#98c379', 33: '#e5c07b',
    34: '#61afef', 35: '#c678dd', 36: '#56b6c2', 37: '#ffffff',
    90: '#5c6370', 91: '#ff7b72', 92: '#7ee787', 93: '#d29922',
    94: '#79c0ff', 95: '#d2a8ff', 96: '#a5d6ff', 97: '#f0f6fc'
  }
}

// ═══════════════════════════════════════════════════════════════
//           END OF CONFIGURATION - CODE BELOW
// ═══════════════════════════════════════════════════════════════

export const command = `${CONFIG.calendar.icalBuddyPath} --configFile '' --separateByDate --propertyOrder datetime,title --propertySeparators '|: |\\n    |' --excludeEndDates --noCalendarNames --sectionSeparator '' --bullet '' --formatOutput --includeEventProps title,datetime eventsToday+${CONFIG.calendar.daysToShow}`

export const refreshFrequency = CONFIG.calendar.refreshMinutes * 60 * 1000

export const className = `
  top: ${CONFIG.position.top}px;
  left: ${CONFIG.position.left}px;
  right: ${CONFIG.position.right}px;
`

const container = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${CONFIG.appearance.columnGap}px;
`

const col = css`
  font-family: ${CONFIG.appearance.fontFamily};
  font-size: ${CONFIG.appearance.fontSize}px;
  line-height: ${CONFIG.appearance.lineHeight};
  color: ${CONFIG.appearance.textColor};
  white-space: pre-wrap;
  text-shadow: ${CONFIG.appearance.textShadow};
`

// Convert ANSI escape sequences to React elements with styling
const parseAnsi = (text) => {
  const colors = CONFIG.ansiColors

  // Split by ANSI escape sequences
  const ansiRegex = /\x1b\[([0-9;]*)m/g
  const parts = []
  let lastIndex = 0
  let currentStyle = {}

  let match
  while ((match = ansiRegex.exec(text)) !== null) {
    // Add text before this escape sequence
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index)
      parts.push({ text: textContent, style: { ...currentStyle } })
    }

    // Parse the escape sequence
    const codes = match[1].split(';').map(c => parseInt(c) || 0)
    codes.forEach(code => {
      if (code === 0) {
        currentStyle = {} // Reset
      } else if (code === 1) {
        currentStyle.fontWeight = 'bold'
      } else if (code === 3) {
        currentStyle.fontStyle = 'italic'
      } else if (code === 4) {
        currentStyle.textDecoration = 'underline'
      } else if (colors[code]) {
        currentStyle.color = colors[code]
      }
    })

    lastIndex = ansiRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), style: { ...currentStyle } })
  }

  // Convert to React elements
  return parts.map((part, i) =>
    <span key={i} style={part.style}>{part.text}</span>
  )
}

export const render = ({output, error}) => {
  if (error) {
    const errorMsg = String(error)

    // Provide helpful error messages for common issues
    if (errorMsg.includes('No such file or directory') || errorMsg.includes('command not found')) {
      return (
        <div style={{color: 'white', fontFamily: '-apple-system', fontSize: '16px', padding: '20px', maxWidth: '600px'}}>
          <h3 style={{color: '#ff7b72', marginTop: 0}}>❌ iCalBuddy Not Found</h3>
          <p>The widget couldn't find iCalBuddy at: <code style={{background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px'}}>{CONFIG.calendar.icalBuddyPath}</code></p>
          <h4>To fix this:</h4>
          <ol style={{lineHeight: '1.8'}}>
            <li>Install iCalBuddy: <code style={{background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px'}}>brew install icalbuddy</code></li>
            <li>Find its location: <code style={{background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px'}}>which icalBuddy</code></li>
            <li>Update <code style={{background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px'}}>CONFIG.calendar.icalBuddyPath</code> in index.jsx if the path differs</li>
          </ol>
          <p style={{fontSize: '14px', color: '#a5d6ff', marginTop: '20px'}}>Common paths: /opt/homebrew/bin/icalBuddy or /usr/local/bin/icalBuddy</p>
        </div>
      )
    }

    return (
      <div style={{color: 'white', fontFamily: '-apple-system', fontSize: '16px', padding: '20px'}}>
        <h3 style={{color: '#ff7b72', marginTop: 0}}>❌ Widget Error</h3>
        <p>Something went wrong:</p>
        <pre style={{background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '5px', overflow: 'auto'}}>{errorMsg}</pre>
        <p style={{fontSize: '14px', color: '#a5d6ff', marginTop: '20px'}}>
          Check the configuration section at the top of index.jsx or test the command in Terminal.
        </p>
      </div>
    )
  }

  var lines = output.split("\n")

  // Group lines by day - date headers start without indentation
  var days = []
  var currentDay = []

  lines.forEach(line => {
    // New day starts when we hit a date header (line ending with colon only)
    // Examples: "today:", "tomorrow:", "Dec 28, 2025:"
    if (line.match(/^\S.*:\s*$/)) {
      if (currentDay.length > 0) {
        days.push(currentDay)
      }
      currentDay = [line]
    } else {
      currentDay.push(line)
    }
  })

  // Don't forget the last day
  if (currentDay.length > 0) {
    days.push(currentDay)
  }

  // Split days in half - first half in col1, second half in col2
  var midpoint = Math.ceil(days.length / 2)
  var col1days = days.slice(0, midpoint)
  var col2days = days.slice(midpoint)

  // Parse each line independently to prevent color bleed between lines
  const renderColumn = (days) => {
    return days.map((day, dayIndex) =>
      day.map((line, lineIndex) => (
        <div key={`${dayIndex}-${lineIndex}`}>
          {line.trim() === '' ? '\u00a0' : parseAnsi(line)}
        </div>
      ))
    )
  }

  return (
    <div className={container}>
      <div className={col}>{renderColumn(col1days)}</div>
      <div className={col}>{renderColumn(col2days)}</div>
    </div>
  )
}
