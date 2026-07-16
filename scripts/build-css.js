#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the shared CSS file
const sharedCssPath = path.join(__dirname, "../src/styles/shared.css");
const sharedCss = fs.readFileSync(sharedCssPath, "utf8");

// Create the shadow DOM CSS module content
const shadowDomContent = `// CSS content for shadow DOM
// This file imports shared CSS and adds shadow DOM specific styles
// Auto-generated from shared.css - DO NOT EDIT DIRECTLY

// Function to get the complete CSS for shadow DOM
export function getShadowDOMCSS(): string {
  return \`
    /* Imported shared CSS styles (adapted for shadow DOM) */
${sharedCss
  .split("\n")
  .map((line) => {
    // Replace :root with :host for shadow DOM compatibility
    if (line.includes(":root")) {
      return `    ${line.replace(":root", ":host")}`;
    }
    return `    ${line}`;
  })
  .join("\n")}

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
  \`;
}
`;

// Write the generated file
const outputPath = path.join(__dirname, "../src/styles/shadow-dom.ts");
fs.writeFileSync(outputPath, shadowDomContent, "utf8");

console.log("✅ Generated shadow-dom.ts from shared.css");
