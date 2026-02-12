# TODO - Layout & Mobile Fixes

## Completed Changes

### 1. Footer Position
- Already configured correctly with flexbox on body (min-height: 100vh)
- No changes needed

### 2. Mobile Navbar (slide from LEFT) ✓
- Changed `.nav-menu` from `right: 0` to `left: 0`
- Changed `transform: translateX(100%)` to `transform: translateX(-100%)`
- Updated box-shadow from `-5px` to `5px`

### 3. Mobile Button Position ✓
- Added `display: flex; flex-direction: column;` to `.week-schedule`
- Added `.schedule-details { flex: none; }`
- Added `.schedule-buttons { order: 99; }` to push buttons below times

### 4. BYSO Download Functionality ✓
- Removed "Download Shabbos Observer" button from index.html
- Added `nav-button-byso` class and `data-folder="BYSO"` to BYSO nav item (all 7 HTML files)
- Added click handler in navbar.js to trigger download
- Uses existing script.js download logic

### 5. Tightened Times Spacing ✓
- Reduced `.schedule-details p` margin from `0.6rem` to `0.3rem`
- Mobile: reduced from `0.5rem` to `0.25rem`

## Files Modified
- index.html
- community.html
- information.html
- dvar.html
- halachos.html
- subscribe.html
- school.html
- styles.css
- mobile.css
- navbar.js

## Committed
- [main c5ebb88] Fix footer position, mobile nav layout, relocate buttons, integrate BYSO download, and tighten times spacing

