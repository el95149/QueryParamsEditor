# Installing the Extension

## Method 1: Install Signed Extension from Mozilla Add-ons Store (Recommended)

1. Open Firefox
2. Go to `about:addons`
3. Click the ⚙️ (settings) icon
4. Select "Install Add-on From File..."
5. Choose the signed `.xpi` file downloaded from Mozilla

**OR** install directly from the Firefox Add-ons Store once published.

## Method 2: Firefox Developer Edition / Nightly (For Unsigned Extensions)

1. Install [Firefox Developer Edition](https://www.mozilla.org/firefox/developer/) or [Firefox Nightly](https://www.mozilla.org/firefox/channel/desktop/#nightly)
2. Open Firefox Developer Edition/Nightly
3. Go to `about:config`
4. Search for `xpinstall.signatures.required`
5. Set it to `false`
6. Go to `about:addons`
7. Click the ⚙️ icon → "Install Add-on From File..."
8. Select the `QueryParamsEditor-1.0.0.xpi` file

## Method 3: Load Temporary Add-on (No Packaging Required)

1. Open Firefox (any version)
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on..."**
4. Select `manifest.json` from this directory
5. The extension will be loaded until you close Firefox

## Method 4: Firefox ESR with Unsigned Add-ons

For Firefox ESR (Enterprise), you can use the `extensions.webextensions.addon-signing` preference:

1. Go to `about:config`
2. Set `extensions.webextensions.addon-signing` to `false`

## Signing Your Extension

To sign your extension for production use:

1. Create a developer account at [addons.mozilla.org](https://addons.mozilla.org/developers/)
2. Package your extension using [`package.sh`](package.sh)
3. Install `web-ext` if not already installed: `npm install -g web-ext`
4. Sign your extension:
   ```bash
   web-ext sign \
     --api-key=user:YOUR_API_KEY \
     --api-secret=YOUR_API_SECRET \
     --channel=unlisted
   ```
5. Download the signed XPI from the Add-ons Manager dashboard

## Notes

- **Unsigned extensions** can only be installed in Developer Edition, Nightly, or with config changes
- **Temporary extensions** are removed when you close Firefox
- **Manifest V3** extensions require Firefox 90+ for service workers
- For **production use**, sign the extension through Mozilla's add-on store
