# Connection Manager Chrome Extension

A Chrome extension that helps you manage and track your LinkedIn connections with detailed scoring, categorization, and interaction history.

## Getting Started

### 🚀 Quick Installation (No Build Required)

Since the `dist` folder is included in this repository, you can use the extension immediately without building anything:

1. **Download or clone this repository**
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable "Developer mode"** (toggle in the top-right corner)
4. **Click "Load unpacked"**
5. **Select the `dist` folder** from this repository
6. **Done!** The extension is now installed and ready to use

## Features

### 🔗 Connection Management

- **Automatic Contact Detection**: Automatically detects LinkedIn profiles and extracts contact information
- **Custom Categories**: Create and manage custom categories with emoticons and colors
- **Interaction Tracking**: Log meetings, calls, lunches, and other interactions with scoring
- **Affinity Scoring**: Personal rating system (0-100) for each connection
- **Notes System**: Add detailed notes to each contact

### 📊 Scoring System

- **Multi-factor Scoring**: Combines category value, interaction history, and personal affinity
- **Decay System**: Configurable time-based scoring decay (exponential, linear, or off)
- **Weighted Formula**: Customizable weights for categories, events, and affinity
- **Score Bands**: Visual categorization of connection strength (Weak, Low, Medium, Strong, Very Strong)

### 🎨 Category Management

- **Custom Categories**: Add unlimited custom categories with:
  - Names in German and English
  - Custom emoticons from 40+ options
  - Color selection from 10 predefined colors
  - Point values (0-100)
- **Default Categories**: Three default categories (Business, Colleague, Acquaintance) that can be customized
- **Visual Interface**: Intuitive category management in the options page
- **Reset Functionality**: Restore default categories at any time

### 🔒 Privacy & Data

- **Local Storage**: All data stored locally in your browser (IndexedDB)
- **Anonymous Mode**: Option to blur names for privacy
- **Export/Import**: Full data export and import functionality
- **No Cloud Sync**: Your data stays on your device

## Installation

### Option 1: Quick Install (Recommended)

The `dist` folder is included in this repository, so you can use the extension immediately:

1. **Download or clone this repository**
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable "Developer mode"** (toggle in the top-right corner)
4. **Click "Load unpacked"**
5. **Select the `dist` folder** from this repository

### Option 2: Build from Source

If you want to modify the extension or build the latest version:

1. Clone or download this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Load the `dist` folder as an unpacked extension in Chrome (same steps as above)

## Usage

### Basic Usage

1. Navigate to LinkedIn
2. Hover over any connection's name to see the tooltip
3. Click "Details" to view/edit contact information
4. Add interactions and notes as needed

### Category Management

1. Open the extension options page
2. Go to "Kategorien verwalten" section
3. Click "Neue Kategorie hinzufügen" to create custom categories
4. Choose emoticons, colors, and point values
5. Edit or delete categories as needed
6. Use "Standard-Kategorien wiederherstellen" to reset to defaults

### Settings Configuration

- **Weights**: Adjust the importance of categories, events, and affinity in scoring
- **Decay**: Configure how quickly interaction scores decay over time
- **Privacy**: Enable anonymous mode to blur names

## Technical Details

- **Manifest Version**: 3
- **Storage**: IndexedDB (local)
- **Languages**: German (default), English
- **Build System**: Vite with TypeScript
- **Database Schema**: Version 2 (supports emoticons)

## Development

If you want to modify the extension code or contribute to the project:

```bash
# Install dependencies
npm install

# Development build with hot reload
npm run dev

# Production build
npm run build

# Build content script only
npm run build:content

# Build other components
npm run build:others
```

**Note**: The `dist` folder is included in the repository, so most users don't need to build anything. Only build if you're developing or modifying the extension.

## Data Structure

The extension stores:

- **Contacts**: Profile URLs, names, categories, affinity, notes
- **Events**: Interaction history with timestamps and scoring
- **Settings**: Weights, decay settings, categories, event types, score bands

## Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Anonymous mode available for enhanced privacy
- Full data export/import for backup and migration

## License

This project is licensed under the MIT License.
