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
  \`;
}
`;

// Write the generated file
const outputPath = path.join(__dirname, "../src/styles/shadow-dom.ts");
fs.writeFileSync(outputPath, shadowDomContent, "utf8");

console.log("✅ Generated shadow-dom.ts from shared.css");
