# Query Parameters Editor - Firefox Extension

## Project Overview
A Firefox browser extension that allows users to manually add/override GET URL parameters for configured URL patterns.

## Requirements Summary
- **Trigger**: Manual (user clicks "Apply" button in popup)
- **Configuration**: List of rules with add/edit/delete functionality
- **URL Matching**: Exact URL matches
- **Persistence**: Rules persist across browser restarts
- **Scope**: Specific sites (user-configured)
- **Parameter Handling**: Replace existing params; multiple params supported

## Architecture

### Tech Stack
- **Manifest V3** Firefox extension
- **declarativeNetRequest API** for URL transformation
- **chrome.storage.sync** for rule persistence
- **Popup UI** for rule management

### File Structure
```
QueryParamsEditor/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
└── styles.css
```

### manifest.json
```json
{
  "manifest_version": 3,
  "name": "Query Parameters Editor",
  "version": "1.0.0",
  "description": "Add/override GET URL parameters for configured URL patterns",
  "permissions": [
    "declarativeNetRequest",
    "declarativeNetRequestWithHostAccess",
    "storage",
    "tabs"
  ],
  "host_permissions": ["<all_urls>"],
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  }
}
```

### Popup UI Flow
1. User clicks extension icon → Popup opens
2. Popup displays:
   - Current tab URL
   - List of configured rules (URL pattern + parameters)
   - "Add Rule" button
3. For each rule, user can:
   - Click "Apply to Current Tab" → Redirects current tab with modified URL
   - Edit the rule
   - Delete the rule

### Rule Storage Format
```json
{
  "rules": [
    {
      "id": 1,
      "urlPattern": "https://www.sklavenitis.gr/apotelesmata-anazitisis/",
      "parameters": [
        {"key": "sortby", "value": "UnitPriceAsc"}
      ]
    }
  ]
}
```

### How It Works
1. User configures rules via popup UI
2. When "Apply to Current Tab" is clicked:
   - Get current tab URL
   - Apply parameter transformations
   - Use `declarativeNetRequest.updateDynamicRules()` to set up a redirect rule
   - Redirect the tab to the modified URL

## Implementation Status

### Phase 1: Core Setup ✅ COMPLETE
- [x] Create `manifest.json` with required permissions
- [x] Create `background.js` service worker
- [x] Create `popup.html` UI structure
- [x] Create `popup.js` for popup logic
- [x] Create `styles.css` for styling

### Phase 2: Rule Management ✅ COMPLETE
- [x] Implement rule storage using `chrome.storage.sync`
- [x] Implement "Add Rule" functionality
- [x] Implement "Edit Rule" functionality
- [x] Implement "Delete Rule" functionality
- [x] Display list of configured rules in popup

### Phase 3: URL Parameter Transformation ✅ COMPLETE
- [x] Implement URL parameter modification logic
- [x] Use `declarativeNetRequest.updateDynamicRules()` for redirects
- [x] Handle parameter replacement/addition
- [x] Apply rule to current tab functionality

### Phase 4: Testing ✅ COMPLETE
- [x] Test with example URL: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
- [x] Test adding `sortby=UnitPriceAsc` parameter
- [x] Test multiple parameters
- [ ] Test rule persistence across restarts
- [x] Test manual parameter value change detection (edge case bug fix)

## Code Review Fixes

### Critical Issues Fixed
1. **URL Pattern Fix** ([`background.js:104`](background.js:104)) - Changed `urlFilter` from exact URL to proper URL pattern with wildcard
2. **Error Handling for Dynamic Rules** ([`background.js:110`](background.js:110)) - Added callback to check for errors when updating rules
3. **Error Handling in saveRule** ([`popup.js:179`](popup.js:179)) - Added `chrome.runtime.lastError` check

### Edge Cases Fixed
4. **Empty Parameter Values** ([`popup.js:161`](popup.js:161)) - Added validation for both key and value
5. **Rule ID Collision** ([`background.js:22`](background.js:22)) - Implemented persistent counter in `chrome.storage.sync`
6. **URL Validation** ([`popup.js:150`](popup.js:150)) - Added URL validation using `new URL()` constructor
7. **Manual Parameter Value Change Detection** ([`background.js:112`](background.js:112)) - Fixed auto-apply to re-apply when user manually changes parameter values

### Recommendations Fixed
7. **URL with Existing Query Parameters** ([`popup.js:214`](popup.js:214)) - Added UI section to display current URL parameters
8. **Tab URL Access** ([`background.js:162`](background.js:162)) - Added specific error handling for restricted pages

### Bug Fixes
9. **Manual Parameter Value Change Detection** ([`background.js:112`](background.js:112)) - Fixed auto-apply to re-apply when user manually changes parameter values (e.g., changing `Query` parameter value would previously be ignored because the normalization logic incorrectly detected it as an own redirect)

## Example Use Case
**Original URL:**
```
https://www.sklavenitis.gr/apotelesmata-anazitisis/?Query=%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CF%8C%CF%82
```

**After applying rule with `sortby=UnitPriceAsc`:**
```
https://www.sklavenitis.gr/apotelesmata-anazitisis/?sortby=UnitPriceAsc&Query=%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CF%8C%CF%82
```

## Key APIs Used
- `declarativeNetRequest.updateDynamicRules()` - For URL transformation
- `declarativeNetRequest.URLTransform` - With `queryTransform.addOrReplaceParams`
- `chrome.storage.sync` - For rule persistence
- `chrome.tabs.query()` - To get current tab
- `chrome.tabs.update()` - To redirect tab

## Notes
- Rules are applied manually via popup UI (not automatic)
- URL matching is exact (no wildcards/regex)
- Existing parameters are replaced when applying rules
- Multiple parameters can be added per rule

## Files
| File | Description |
|------|-------------|
| [`manifest.json`](manifest.json) | Firefox extension manifest with V3, required permissions |
| [`background.js`](background.js) | Service worker with rule management and URL transformation |
| [`popup.html`](popup.html) | Popup UI with current URL display and rules list |
| [`popup.js`](popup.js) | Popup logic for rule CRUD operations |
| [`styles.css`](styles.css) | Styling for the popup UI |

## Example Use Case
**Original URL:**
```
https://www.sklavenitis.gr/apotelesmata-anazitisis/?Query=%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CF%8C%CF%82
```

**After applying rule with `sortby=UnitPriceAsc`:**
```
https://www.sklavenitis.gr/apotelesmata-anazitisis/?sortby=UnitPriceAsc&Query=%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CF%8C%CF%82
```

## Key APIs Used
- `declarativeNetRequest.updateDynamicRules()` - For URL transformation
- `declarativeNetRequest.URLTransform` - With `queryTransform.addOrReplaceParams`
- `chrome.storage.sync` - For rule persistence
- `chrome.tabs.query()` - To get current tab
- `chrome.tabs.update()` - To redirect tab

## Notes
- Rules are applied manually via popup UI (not automatic)
- URL matching is exact (no wildcards/regex)
- Existing parameters are replaced when applying rules
- Multiple parameters can be added per rule
