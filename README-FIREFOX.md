# Connection Manager - Firefox Extension

This is the Firefox version of the Connection Manager extension for LinkedIn.

## Building for Firefox

To build the extension for Firefox, run:

```bash
npm install
npm run build:firefox
```

This will create a `dist-firefox` directory with the Firefox-compatible extension files.

## Installing in Firefox

1. Open Firefox and go to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the `dist-firefox` directory and select the `manifest.json` file
5. The extension should now be loaded and ready to use

## Differences from Chrome Version

- Uses Manifest V2 instead of V3
- Uses `browser` API instead of `chrome` API
- Includes webextension-polyfill for cross-browser compatibility
- Background script runs as a persistent script instead of service worker

## Features

- Local storage of LinkedIn contact information using IndexedDB
- Scoring system for contacts
- JSON import/export functionality
- Settings management
- Overlay interface on LinkedIn profiles

## Development

The Firefox version uses the same source code as the Chrome version, but with different build configurations and browser API polyfills.
