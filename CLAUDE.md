# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Übersicht widget (https://github.com/felixhageloh/uebersicht) that displays calendar events from iCalBuddy in a two-column layout on the macOS desktop.

**Key dependencies:**
- Übersicht desktop widget framework (React-based)
- iCalBuddy CLI tool (installed at `/opt/homebrew/bin/icalBuddy`)

## Repository Structure & Distribution

**Distribution approach:**
- Users download `iCalBuddy-Color.widget.zip` (no need to clone)
- Developers can clone for contributions

**Gallery requirements** (per https://github.com/felixhageloh/uebersicht-widgets/blob/master/README.md):

1. **`widget.json`** - Manifest file with name, description, author, email
2. **`iCalBuddy-Color.widget.zip`** - Distribution package containing `index.jsx`
3. **`screenshot.png`** - Gallery preview image (516x320px hi-res format)

**Build tools:**
- **`Makefile`** - Creates and verifies the ZIP file distribution
  - `make zip` - Creates `iCalBuddy-Color.widget.zip` with proper structure
  - `make verify` - Lists ZIP contents
  - `make clean` - Removes generated files

**Hosting:**
- Primary repository: Codeberg (https://codeberg.org/mjgardner/Uebersicht-iCalBuddy-Color.widget)
- Mirror: GitHub (https://github.com/mjgardner/Uebersicht-iCalBuddy-Color.widget)
- GitHub mirror required for Übersicht widget gallery submission

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
