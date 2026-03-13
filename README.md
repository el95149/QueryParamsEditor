# Query Parameters Editor

A Firefox browser extension that allows users to manually add or override GET URL parameters for configured URL patterns.
Born out of my personal need to quickly search through product listings for my e-supermarket runs!

## Overview

This extension helps you set default query parameters on websites, particularly useful for:

- Setting default sorting (e.g., price ascending/descending)
- Applying filters automatically
- Configuring view preferences
- Pre-filling search parameters

## Features

- **Manual Control**: Apply parameter rules manually via the popup UI
- **Rule Management**: Add, edit, and delete URL parameter rules
- **Parameter Replacement**: Existing parameters are replaced when applying rules
- **Multiple Parameters**: Support for adding multiple parameters per rule
- **Persistence**: Rules persist across browser restarts

## Installation

### From Firefox Add-ons (AMO)

[Add to Firefox]()

### Manual Installation (Development)

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select the `manifest.json` file from this directory

## Usage

1. Click the extension icon in the Firefox toolbar
2. The popup will display:
   - The current tab's URL
   - A list of configured rules
   - An "Add Rule" button
3. To apply a rule:
   - Click "Apply to Current Tab" next to any rule
   - The current tab will be redirected with the modified URL
4. To manage rules:
   - Click "Add Rule" to create a new rule
   - Click "Edit" to modify an existing rule
   - Click "Delete" to remove a rule

## Example

**Original URL:**
```
https://www.sklavenitis.gr/apotelesmata-anazitisis/?Query=%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CF%8C%CF%82
```

**After applying rule with `sortby=UnitPriceAsc`:**
```
https://www.sklavenitis.gr/apotelesmata-anazitisis/?sortby=UnitPriceAsc&Query=%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CF%8C%CF%82
```

## Configuration

Each rule consists of:

- **URL Pattern**: The exact URL to match (e.g., `https://www.sklavenitis.gr/apotelesmata-anazitisis/`)
- **Parameters**: Key-value pairs to add or override (e.g., `sortby=UnitPriceAsc`)

## Technical Details

### Manifest Version

This extension uses Manifest V3.

### Permissions

- `declarativeNetRequest`: For URL transformation
- `declarativeNetRequestWithHostAccess`: For host-specific URL modifications
- `storage`: For persisting rules
- `tabs`: For accessing and modifying tab URLs

### File Structure

```
QueryParamsEditor/
├── manifest.json      # Extension manifest
├── background.js      # Service worker for rule management
├── popup.html         # Popup UI
├── popup.js           # Popup logic
└── styles.css         # UI styling
```

## Development

### Building

No build process is required. The extension is loaded directly from the source files.

### Testing

1. Load the extension in Firefox as described in the Manual Installation section
2. Navigate to a supported website
3. Configure rules via the popup UI
4. Test by applying rules and verifying URL modifications

## License

MIT License - See [LICENSE](LICENSE) for details.

## Author

[Angelos Anagnostopoulos](https://anagnostic.org)

## Acknowledgments

- Firefox WebExtensions API documentation
- The open-source community
