// CSS content for shadow DOM
// This file imports shared CSS and adds shadow DOM specific styles
// Auto-generated from shared.css - DO NOT EDIT DIRECTLY

// Function to get the complete CSS for shadow DOM
export function getShadowDOMCSS(): string {
  return `
    /* Imported shared CSS styles (adapted for shadow DOM) */
    /* Shared styles for the Connection Manager overlay UI */
    
    * {
      font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
        "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      box-sizing: border-box;
    }
    
    /* Design tokens — dark, deliberately distinct from LinkedIn */
    :host {
      color-scheme: dark;
      --accent: #7c7ff2;
      --accent-strong: #6366f1;
      --accent-soft: rgba(124, 127, 242, 0.16);
      --surface: rgba(19, 21, 28, 0.97);
      --surface-solid: #14161d;
      --surface-raised: rgba(255, 255, 255, 0.05);
      --surface-hover: rgba(255, 255, 255, 0.1);
      --border-color: rgba(255, 255, 255, 0.1);
      --border-strong: rgba(255, 255, 255, 0.2);
      --text-primary: #f2f4f8;
      --text-secondary: #a3abbd;
      --text-muted: #737d91;
      --error-color: #f87171;
      --error-bg: rgba(248, 113, 113, 0.12);
      --error-border: rgba(248, 113, 113, 0.3);
      --success-color: #4ade80;
      --success-bg: rgba(74, 222, 128, 0.12);
      --success-border: rgba(74, 222, 128, 0.3);
      --focus-ring: 0 0 0 3px rgba(124, 127, 242, 0.25);
    }
    
    /* Buttons */
    button {
      border: 1px solid var(--border-color);
      background: var(--surface-raised);
      color: var(--text-primary);
      border-radius: 8px;
      padding: 7px 12px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.01em;
      white-space: nowrap;
      transition: background 0.15s ease, border-color 0.15s ease,
        transform 0.1s ease, box-shadow 0.15s ease;
    }
    
    button:hover {
      background: var(--surface-hover);
      border-color: var(--border-strong);
    }
    
    button.primary {
      background: linear-gradient(135deg, #7c7ff2, #5b8cf7);
      border: 1px solid transparent;
      color: #fff;
      font-weight: 600;
      padding: 9px 18px;
      min-width: 110px;
      box-shadow: 0 2px 12px rgba(99, 102, 241, 0.35);
    }
    
    button.primary:hover {
      filter: brightness(1.08);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.45);
    }
    
    button:active {
      transform: translateY(1px);
    }
    
    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Inputs */
    input[type="number"],
    input[type="text"],
    input[type="datetime-local"],
    select,
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 13px;
      background: var(--surface-raised);
      color: var(--text-primary);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    
    input[type="number"]:focus,
    input[type="text"]:focus,
    input[type="datetime-local"]:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: var(--focus-ring);
    }
    
    select option {
      background: var(--surface-solid);
      color: var(--text-primary);
    }
    
    input[type="range"] {
      accent-color: var(--accent);
    }
    
    /* Labels */
    label {
      display: block;
      margin-bottom: 6px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    
    /* Tooltip card */
    .card {
      background: var(--surface);
      backdrop-filter: blur(16px) saturate(1.3);
      -webkit-backdrop-filter: blur(16px) saturate(1.3);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 14px 14px 12px 17px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      position: relative;
      width: 400px;
      overflow: hidden;
      color: var(--text-primary);
      transform-origin: 14px 14px;
      animation: card-in 0.18s cubic-bezier(0.2, 0.8, 0.3, 1);
    }
    
    /* The card expands out of the bubble sitting at its top-left corner */
    @keyframes card-in {
      from {
        opacity: 0;
        transform: scale(0.25);
      }
    }
    
    .card-out {
      animation: card-out 0.13s ease-in forwards;
      pointer-events: none;
    }
    
    @keyframes card-out {
      to {
        opacity: 0;
        transform: scale(0.6);
      }
    }
    
    /* Hover bubble that opens the card on click */
    .details-bubble {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 999px;
      border: 1px solid var(--border-color);
      background: var(--surface);
      backdrop-filter: blur(16px) saturate(1.3);
      -webkit-backdrop-filter: blur(16px) saturate(1.3);
      color: var(--text-secondary);
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      animation: bubble-in 0.18s cubic-bezier(0.2, 0.8, 0.3, 1);
      transition: color 0.15s ease, border-color 0.15s ease,
        background 0.15s ease;
    }
    
    /* Fades up out of the element it belongs to */
    @keyframes bubble-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
    
    .details-bubble:hover {
      color: var(--accent);
      border-color: var(--border-strong);
      background: var(--surface-solid);
    }
    
    .details-bubble svg {
      width: 15px;
      height: 15px;
      pointer-events: none;
    }
    
    /* Category accent bar (card and dialogs) */
    .category-accent {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--border-strong);
    }
    
    /* Loading placeholders */
    .skeleton {
      display: inline-block;
      height: 12px;
      max-width: 100%;
      border-radius: 6px;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.06) 25%,
        rgba(255, 255, 255, 0.14) 50%,
        rgba(255, 255, 255, 0.06) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.2s ease-in-out infinite;
    }
    
    @keyframes shimmer {
      from {
        background-position: 200% 0;
      }
      to {
        background-position: -200% 0;
      }
    }
    
    /* Dialogs */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(8, 9, 12, 0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 2147483648;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: overlay-in 0.15s ease-out;
    }
    
    @keyframes overlay-in {
      from {
        opacity: 0;
      }
    }
    
    .dialog {
      background: var(--surface-solid);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 20px;
      max-width: 420px;
      width: 90%;
      max-height: 85vh;
      overflow-x: hidden;
      overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      position: relative;
      color: var(--text-primary);
    }
    
    .dialog {
      animation: dialog-in 0.18s cubic-bezier(0.2, 0.8, 0.3, 1);
    }
    
    @keyframes dialog-in {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.97);
      }
    }
    
    .dialog h3 {
      margin: 0 0 18px 0;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    
    .dialog-row {
      margin-bottom: 14px;
    }
    
    .dialog-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 18px;
    }
    
    .dialog-buttons button {
      padding: 8px 16px;
    }
    
    /* Messages */
    .error {
      color: var(--error-color);
      font-size: 13px;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--error-bg);
      border: 1px solid var(--error-border);
      border-radius: 8px;
    }
    
    .success {
      color: var(--success-color);
      font-size: 13px;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--success-bg);
      border: 1px solid var(--success-border);
      border-radius: 8px;
    }
    
    /* Utility text */
    .small {
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .muted {
      color: var(--text-muted);
    }
    
    .help-text {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    
    .url-text {
      word-break: break-all;
      font-size: 12px;
      color: var(--text-muted);
    }
    
    /* Layout */
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
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
    
    .interaction-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
    }
    
    .interaction-text {
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 400;
    }
    
    .category-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--surface-raised);
      flex-shrink: 0;
    }
    
    .category-chip svg {
      width: 14px;
      height: 14px;
    }
    
    /* Badges & score */
    .badge {
      padding: 3px 9px;
      border-radius: 999px;
      border: 1px solid var(--border-color);
      background: var(--surface-raised);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-secondary);
    }
    
    .score {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .score-number {
      font-size: 15px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--text-primary);
    }
    
    .score-badge {
      font-size: 11px;
      color: var(--text-secondary);
    }
    
    .delete-event__label {
      position: relative;
      top: -2px;
    }
    
    .card-content {
      margin-bottom: 12px;
      min-height: 80px;
    }
    
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
      border-radius: 4px;
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
      background: transparent;
      border-color: var(--border-color);
      color: var(--text-secondary);
    }

    .dialog-buttons button.secondary:hover {
      background: var(--surface-raised);
      color: var(--text-primary);
    }

    /* Points grid for event dialogs */
    .points-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-top: 4px;
    }

    .points-grid button {
      padding: 8px;
      border: 1px solid var(--border-color);
      background: var(--surface-raised);
      border-radius: 8px;
      cursor: pointer;
      font-variant-numeric: tabular-nums;
    }

    .points-grid button.selected {
      background: linear-gradient(135deg, #7c7ff2, #5b8cf7);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 2px 10px rgba(99, 102, 241, 0.35);
    }

    /* Events list specific styles */
    .events-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 4px;
    }

    .event-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px;
      border-radius: 8px;
      gap: 8px;
    }

    .event-item:hover {
      background: var(--surface-raised);
    }

    .event-item + .event-item {
      border-top: 1px solid var(--border-color);
    }

    .event-info {
      flex: 1;
    }

    .event-date {
      font-weight: 600;
      font-size: 12px;
      color: var(--text-primary);
    }

    .event-type {
      color: var(--text-secondary);
      font-size: 12px;
    }

    .event-points {
      color: var(--accent);
      font-weight: 600;
      font-size: 12px;
    }

    .event-note {
      color: var(--text-muted);
      font-size: 11px;
      margin-top: 4px;
    }

    .delete-event {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border-color);
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      padding: 0;
    }

    .delete-event:hover {
      background: var(--error-bg);
      color: var(--error-color);
      border-color: var(--error-border);
    }

    .no-events {
      color: var(--text-muted);
      text-align: center;
      padding: 16px;
      font-size: 12px;
    }
  `;
}
