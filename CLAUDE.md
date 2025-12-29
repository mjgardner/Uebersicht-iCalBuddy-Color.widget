# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Übersicht widget (https://github.com/felixhageloh/uebersicht) that displays calendar events from iCalBuddy in a two-column layout on the macOS desktop.

**Key dependencies:**
- Übersicht desktop widget framework (React-based)
- iCalBuddy CLI tool (installed at `/opt/homebrew/bin/icalBuddy`)

## Widget Architecture

**File:** `index.jsx` - Single-file widget implementation

**Übersicht exports:**
- `command` - Shell command that fetches calendar data (runs every refresh)
- `refreshFrequency` - Update interval in milliseconds (currently 10 minutes)
- `className` - Widget positioning CSS (top/left/right absolute positioning)
- `render({output, error})` - React component that receives command output

**Data flow:**
1. Übersicht runs `command` periodically
2. iCalBuddy outputs calendar events with ANSI color codes (`--formatOutput`)
3. `render()` receives raw output string
4. Output is parsed into day groups (regex: `/^\S.*:\s*$/` matches date headers like "today:", "Dec 28, 2025:")
5. Days are split in half chronologically between two columns
6. Each line is parsed independently for ANSI codes to prevent color bleed
7. Rendered as two CSS Grid columns with styled React elements

## Key Implementation Details

**Day detection (lines 93-104):**
- Date headers end with colon + optional whitespace only
- Events (indented or containing text after colons) are grouped under their date
- Grouping preserves complete days for chronological column splitting

**ANSI parsing (lines 28-80):**
- Converts terminal escape sequences to React `<span>` elements with inline styles
- Color map uses bright colors optimized for dark backgrounds (lines 31-36)
- Each line is parsed independently to reset styling context
- Empty lines render as `\u00a0` (non-breaking space) to preserve vertical spacing

**Layout:**
- CSS Grid with `1fr 1fr` creates equal-width columns
- 40px gap between columns
- Widget positioned via absolute positioning in `className` export

## Testing Changes

Übersicht auto-refreshes widgets when files change. To see changes immediately:
1. Save modifications to `index.jsx`
2. Übersicht will reload the widget automatically
3. Or manually refresh Übersicht from its menu bar

**Debug the command output:**
```bash
/opt/homebrew/bin/icalBuddy --configFile '' --separateByDate --propertyOrder datetime,title --propertySeparators '|: |\\n    |' --excludeEndDates --sectionSeparator '' --bullet '' --formatOutput --includeEventProps title,datetime eventsToday+7
```

## Customization Points

**Positioning:** Adjust `className` export (lines 7-11) - top/left/right pixel values

**Column layout:** Modify `container` CSS (lines 13-17) - grid columns, gap

**Typography/colors:** Modify `col` CSS (lines 19-26) - font, size, color, shadows

**ANSI color mapping:** Edit `colors` object (lines 31-36) to change how terminal colors map to hex values

**iCalBuddy options:** Modify `command` export (line 3) to change:
- Date range (`eventsToday+7`)
- Property order and separators
- Included calendars or event properties
- Output formatting options
