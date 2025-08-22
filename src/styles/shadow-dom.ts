// CSS content for shadow DOM
// This file imports shared CSS and adds shadow DOM specific styles
// Auto-generated from shared.css - DO NOT EDIT DIRECTLY

// Function to get the complete CSS for shadow DOM
export function getShadowDOMCSS(): string {
  return `
    /* Imported shared CSS styles (adapted for shadow DOM) */
    /* Shared styles for Connection Manager Chrome Extension */
    
    /* Base styles */
    * {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        "Helvetica Neue", Arial, sans-serif;
      box-sizing: border-box;
    }
    
    /* Common colors */
    :host {
      --linkedin-blue: #0073b1;
      --linkedin-blue-dark: #005885;
      --border-color: #ddd;
      --background-light: #f8f9fa;
      --background-lighter: #fafafa;
      --text-primary: #333;
      --text-secondary: #666;
      --text-muted: #666;
      --error-color: #dc3545;
      --error-bg: #f8d7da;
      --error-border: #f5c6cb;
      --success-color: #155724;
      --success-bg: #d4edda;
      --success-border: #c3e6cb;
      --success-color-dark: #0f3d1a;
      --shadow-light: rgba(0, 0, 0, 0.1);
      --shadow-medium: rgba(0, 0, 0, 0.15);
      --shadow-heavy: rgba(0, 0, 0, 0.3);
    }
    
    /* Common button styles */
    button {
      border: 1px solid var(--border-color);
      background: var(--background-lighter);
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
      transition: background-color 0.2s ease;
    }
    
    button:hover {
      background: #f0f0f0;
    }
    
    button.primary {
      background: var(--linkedin-blue);
      color: white;
      border-color: var(--linkedin-blue);
      font-weight: 500;
      padding: 12px 24px;
      min-width: 120px;
    }
    
    button.primary:hover {
      background: var(--linkedin-blue-dark);
    }
    
    button:active {
      transform: translateY(1px);
    }
    
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Common input styles */
    input[type="number"],
    input[type="text"],
    input[type="datetime-local"],
    select,
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      background: white;
      transition: border-color 0.2s ease;
    }
    
    input[type="number"]:focus,
    input[type="text"]:focus,
    input[type="datetime-local"]:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--linkedin-blue);
      box-shadow: 0 0 0 2px rgba(0, 115, 177, 0.1);
    }
    
    /* Common label styles */
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    /* Common card styles */
    .card {
      background: white;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 16px var(--shadow-light);
      position: relative;
      width: 400px;
      min-height: ;
    }
    
    /* Common dialog styles */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2147483648;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .dialog {
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 8px 32px var(--shadow-heavy);
      position: relative;
    }
    
    .dialog h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
    }
    
    .dialog-row {
      margin-bottom: 12px;
    }
    
    .dialog-row label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .dialog-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }
    
    .dialog-buttons button {
      padding: 8px 16px;
    }
    
    /* Common message styles */
    .error {
      color: var(--error-color);
      font-size: 14px;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--error-bg);
      border: 1px solid var(--error-border);
      border-radius: 4px;
    }
    
    .success {
      color: var(--success-color);
      font-size: 14px;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--success-bg);
      border: 1px solid var(--success-border);
      border-radius: 4px;
    }
    
    /* Common utility classes */
    .small {
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .muted {
      color: var(--text-muted);
    }
    
    .help-text {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
      font-style: italic;
    }
    
    /* Common layout utilities */
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    
    .button-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: auto;
      padding-top: 12px;
    }
    
    .button-row button {
      flex: 1;
      min-width: 0;
    }
    
    /* Interaction row styles */
    .interaction-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    
    .interaction-text {
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .category-emoticon {
      font-size: 18px;
      margin-top: -6px;
    }
    
    /* Common badge styles */
    .badge {
      padding: 2px 6px;
      border-radius: 999px;
      border: 1px solid #ccc;
      font-size: 10px;
    }
    
    /* Score display styles */
    .score {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .score-number {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .score-badge {
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .delete-event__label {
      position: relative;
      top: -2px;
    }
    
    /* Card content styles */
    .card-content {
      margin-bottom: 12px;
      min-height: 80px;
    }
    
    /* Responsive utilities */
    @media (max-width: 768px) {
      .row,
      .button-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
    
      .button-row button {
        width: 100%;
      }
    }
    

    /* Shadow DOM specific additions */
    
    /* Anonymous mode overlay */
    .anonymous-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #000;
      border-radius: 2px;
      pointer-events: none;
    }

    /* Dialog row specific styles for shadow DOM */
    .dialog-row textarea {
      resize: vertical;
      min-height: 80px;
      max-height: 200px;
      box-sizing: border-box;
      width: 100%;
    }

    .dialog-buttons button.secondary {
      background: var(--background-light);
      border-color: var(--border-color);
    }

    /* Points grid for event dialogs */
    .points-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      margin-top: 4px;
    }

    .points-grid button {
      padding: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-light);
      border-radius: 4px;
      cursor: pointer;
    }

    .points-grid button.selected {
      background: var(--linkedin-blue);
      color: white;
      border-color: var(--linkedin-blue);
    }

    /* Events list specific styles */
    .events-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 8px;
    }

    .event-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px;
      border-bottom: 1px solid #eee;
      gap: 8px;
    }

    .event-item:last-child {
      border-bottom: none;
    }

    .event-info {
      flex: 1;
    }

    .event-date {
      font-weight: 500;
      color: var(--text-primary);
    }

    .event-type {
      color: var(--text-secondary);
      font-size: 12px;
    }

    .event-points {
      color: var(--linkedin-blue);
      font-weight: 500;
      font-size: 12px;
    }

    .event-note {
      color: var(--text-secondary);
      font-size: 11px;
      margin-top: 4px;
      font-style: italic;
    }

    .delete-event {
      background: var(--error-color);
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }

    .delete-event:hover {
      background: #c82333;
    }

    .no-events {
      color: var(--text-secondary);
      font-style: italic;
      text-align: center;
      padding: 16px;
    }

    .category-gradient {
      position: absolute;
      top: 0;
      right: 0;
      width: 30%;
      height: 100%;
      opacity: 0.5;
      pointer-events: none;
      border-radius: 8px;
    }

    .dialog .category-gradient {
      border-radius: 8px;
    }
  `;
}
