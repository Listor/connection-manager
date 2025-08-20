import {
  getSettings,
  putSettings,
  getAllContacts,
  getAllEvents,
  clearAllContacts,
  clearAllEvents,
  importContacts,
  importEvents,
  exportData,
} from "../types/db/background-bridge";
import type { ExportBundleV1 } from "../types/index";
import "./options.css";

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: any = {},
  ...children: (Node | string)[]
) {
  const el = document.createElement(tag);
  Object.assign(el, props);
  children.forEach((c) => el.append(c as any));
  return el;
}

// Function to check if LinkedIn is available
async function checkLinkedInConnection(): Promise<boolean> {
  try {
    // Try to get contacts - if this succeeds, LinkedIn is available
    await getAllContacts();
    return true;
  } catch (error) {
    console.log("LinkedIn not available:", error);
    return false;
  }
}

// Function to show LinkedIn connection message
function showLinkedInMessage(app: HTMLElement) {
  app.innerHTML = "";

  const container = h("div", {
    className: "linkedin-message",
    style: `
      text-align: center;
      padding: 60px 20px;
      max-width: 500px;
      margin: 0 auto;
    `,
  });

  const icon = h("div", {
    innerHTML: "🔗",
    style: `
      font-size: 64px;
      margin-bottom: 24px;
    `,
  });

  const title = h("h1", {
    innerText: "LinkedIn Verbindung erforderlich",
    style: `
      color: #333;
      margin-bottom: 16px;
      font-size: 24px;
    `,
  });

  const message = h("p", {
    innerText:
      "Um auf Ihre Connection Manager Daten zuzugreifen, muss LinkedIn in einem Tab geöffnet sein.",
    style: `
      color: #666;
      margin-bottom: 32px;
      line-height: 1.5;
      font-size: 16px;
    `,
  });

  const openLinkedInBtn = h("button", {
    innerText: "LinkedIn öffnen",
    style: `
      background: #0073b1;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      margin-right: 12px;
      transition: background-color 0.2s;
    `,
  });

  const refreshBtn = h("button", {
    innerText: "Seite aktualisieren",
    style: `
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      transition: background-color 0.2s;
    `,
  });

  const statusText = h("div", {
    innerText: "Überprüfe Verbindung...",
    style: `
      margin-top: 24px;
      color: #666;
      font-size: 14px;
    `,
  });

  // Button hover effects
  openLinkedInBtn.onmouseenter = () => {
    (openLinkedInBtn as HTMLElement).style.backgroundColor = "#005a8b";
  };
  openLinkedInBtn.onmouseleave = () => {
    (openLinkedInBtn as HTMLElement).style.backgroundColor = "#0073b1";
  };

  refreshBtn.onmouseenter = () => {
    (refreshBtn as HTMLElement).style.backgroundColor = "#218838";
  };
  refreshBtn.onmouseleave = () => {
    (refreshBtn as HTMLElement).style.backgroundColor = "#28a745";
  };

  // Open LinkedIn button functionality
  openLinkedInBtn.addEventListener("click", () => {
    window.open("https://www.linkedin.com", "_blank");
  });

  // Refresh button functionality
  refreshBtn.addEventListener("click", () => {
    window.location.reload();
  });

  container.append(
    icon,
    title,
    message,
    openLinkedInBtn,
    refreshBtn,
    statusText
  );
  app.appendChild(container);

  // Auto-refresh functionality
  let checkInterval: number;
  let checkCount = 0;
  const maxChecks = 60; // Check for 5 minutes (60 * 5 seconds)

  const checkConnection = async () => {
    checkCount++;
    const isConnected = await checkLinkedInConnection();

    if (isConnected) {
      clearInterval(checkInterval);
      statusText.innerText = "✅ Verbindung hergestellt! Lade Seite neu...";
      setTimeout(() => window.location.reload(), 1000);
      return;
    }

    if (checkCount >= maxChecks) {
      clearInterval(checkInterval);
      statusText.innerText =
        "⏰ Automatische Überprüfung beendet. Klicken Sie 'Seite aktualisieren' um manuell zu prüfen.";
      return;
    }

    statusText.innerText = `Überprüfe Verbindung... (${checkCount}/${maxChecks})`;
  };

  // Start checking every 5 seconds
  checkInterval = window.setInterval(checkConnection, 5000);

  // Initial check
  checkConnection();
}

// Function to show the main options interface
async function showOptionsInterface(app: HTMLElement) {
  const s = await getSettings();

  // Create title
  const title = h("h1", { innerText: "Connection Manager Einstellungen" });

  // Create weights section
  const weights = h(
    "div",
    { className: "section" },
    h("h2", { innerText: "Gewichte" }),
    h(
      "div",
      { className: "form-group" },
      h(
        "div",
        { className: "input-row" },
        h("label", { innerText: "Kategorien" }),
        h("input", {
          type: "number",
          step: "0.01",
          value: s.weights.categories,
          id: "w_cat",
        })
      ),
      h(
        "div",
        { className: "help-text" },
        "Gewichtung für Kategoriebewertung (0-1)"
      )
    ),
    h(
      "div",
      { className: "form-group" },
      h(
        "div",
        { className: "input-row" },
        h("label", { innerText: "Events" }),
        h("input", {
          type: "number",
          step: "0.01",
          value: s.weights.events,
          id: "w_evt",
        })
      ),
      h(
        "div",
        { className: "help-text" },
        "Gewichtung für Interaktionsbewertung (0-1)"
      )
    ),
    h(
      "div",
      { className: "form-group" },
      h(
        "div",
        { className: "input-row" },
        h("label", { innerText: "Empfinden" }),
        h("input", {
          type: "number",
          step: "0.01",
          value: s.weights.affinity,
          id: "w_aff",
        })
      ),
      h(
        "div",
        { className: "help-text" },
        "Gewichtung für persönliches Empfinden (0-1)"
      )
    )
  );

  // Create decay section
  const decay = h(
    "div",
    { className: "section" },
    h("h2", { innerText: "Verfall" }),
    h(
      "div",
      { className: "form-group" },
      h(
        "div",
        { className: "input-row" },
        h("label", { innerText: "Start (Tage)" }),
        h("input", {
          type: "number",
          value: s.decay.decayStartDays,
          id: "d_start",
        })
      ),
      h(
        "div",
        { className: "help-text" },
        "Nach wie vielen Tagen beginnt der Verfall"
      )
    ),
    h(
      "div",
      { className: "form-group" },
      h(
        "div",
        { className: "input-row" },
        h("label", { innerText: "Halbwert (Tage)" }),
        h("input", {
          type: "number",
          value: s.decay.halfLifeDays,
          id: "d_half",
        })
      ),
      h(
        "div",
        { className: "help-text" },
        "Nach wie vielen Tagen halbiert sich der Wert"
      )
    ),
    h(
      "div",
      { className: "form-group" },
      h("label", { innerText: "Modus" }),
      (() => {
        const sel = h("select", { id: "d_mode" });
        ["exponential", "linear", "off"].forEach((m) =>
          sel.append(
            h("option", {
              value: m,
              innerText: m,
              selected: s.decay.mode === m,
            })
          )
        );
        return sel;
      })(),
      h(
        "div",
        { className: "help-text" },
        "Art des Verfalls: exponential, linear oder aus"
      )
    )
  );

  // Create export/import section
  const exportImport = h(
    "div",
    { className: "section" },
    h("h2", { innerText: "Daten Export/Import" }),
    h(
      "div",
      { className: "form-group" },
      h(
        "div",
        { className: "button-row" },
        h("button", {
          innerText: "Daten exportieren",
          id: "export-btn",
          className: "export-btn",
        }),
        h("button", {
          innerText: "Daten importieren",
          id: "import-btn",
          className: "import-btn",
        }),
        h("button", {
          innerText: "DB Test",
          id: "db-test-btn",
          className: "db-test-btn",
        })
      ),
      h(
        "div",
        { className: "help-text" },
        "Exportieren Sie alle Daten als JSON-Datei oder importieren Sie eine zuvor exportierte Datei"
      )
    )
  );

  // Create privacy section
  const privacy = h(
    "div",
    { className: "section" },
    h("h2", { innerText: "Datenschutz" }),
    h(
      "div",
      { className: "form-group" },
      h(
        "div",
        { className: "checkbox-row" },
        h("input", {
          type: "checkbox",
          id: "anonymous-mode",
          checked: s.anonymousMode,
        }),
        h("label", {
          innerText: "Anonymus Modus",
          htmlFor: "anonymous-mode",
        })
      ),
      h(
        "div",
        { className: "help-text" },
        "Überdeckt alle Namen auf LinkedIn mit einem geblurten schwarzen Balken"
      )
    )
  );

  // Create save button container
  const buttonContainer = h("div", { className: "button-container" });
  const saveBtn = h("button", { innerText: "Speichern" });

  // Create message container for feedback
  const messageContainer = h("div", { id: "message-container" });

  saveBtn.addEventListener("click", async () => {
    const w_cat = parseFloat(
      (document.getElementById("w_cat") as HTMLInputElement).value
    );
    const w_evt = parseFloat(
      (document.getElementById("w_evt") as HTMLInputElement).value
    );
    const w_aff = parseFloat(
      (document.getElementById("w_aff") as HTMLInputElement).value
    );
    const sum = w_cat + w_evt + w_aff;

    // Clear previous messages
    messageContainer.innerHTML = "";

    if (Math.abs(sum - 1) > 0.0001) {
      const errorMsg = h("div", {
        className: "error",
        innerText: `Summe der Gewichte muss 1 sein. Aktuell: ${sum.toFixed(2)}`,
      });
      messageContainer.appendChild(errorMsg);
      return;
    }

    try {
      s.weights = { categories: w_cat, events: w_evt, affinity: w_aff };
      s.decay = {
        mode: (document.getElementById("d_mode") as HTMLSelectElement)
          .value as any,
        decayStartDays: parseInt(
          (document.getElementById("d_start") as HTMLInputElement).value,
          10
        ),
        halfLifeDays: parseInt(
          (document.getElementById("d_half") as HTMLInputElement).value,
          10
        ),
      };
      s.anonymousMode = (
        document.getElementById("anonymous-mode") as HTMLInputElement
      ).checked;

      await putSettings(s);

      // Notify content script about settings update
      try {
        const tabs = await chrome.tabs.query({
          url: "https://*.linkedin.com/*",
        });
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: "SETTINGS_UPDATED" });
          }
        });
      } catch (error) {
        console.log("Could not notify content script:", error);
      }

      const successMsg = h("div", {
        className: "success",
        innerText: "Einstellungen erfolgreich gespeichert!",
      });
      messageContainer.appendChild(successMsg);

      // Clear success message after 3 seconds
      setTimeout(() => {
        if (messageContainer.contains(successMsg)) {
          messageContainer.removeChild(successMsg);
        }
      }, 3000);
    } catch (error) {
      const errorMsg = h("div", {
        className: "error",
        innerText: "Fehler beim Speichern der Einstellungen",
      });
      messageContainer.appendChild(errorMsg);
    }
  });

  buttonContainer.appendChild(saveBtn);

  app.append(
    title,
    weights,
    decay,
    exportImport,
    privacy,
    messageContainer,
    buttonContainer
  );

  // Export functionality
  const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
  exportBtn.addEventListener("click", async () => {
    try {
      exportBtn.disabled = true;
      exportBtn.innerText = "Exportiere...";

      console.log("Starting export via background script...");

      const exportDataResult = await exportData();

      console.log("Export data:", exportDataResult);

      const blob = new Blob([JSON.stringify(exportDataResult, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `linkedin-connections-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const successMsg = h("div", {
        className: "success",
        innerText: `Export erfolgreich! ${exportDataResult.contacts.length} Kontakte und ${exportDataResult.events.length} Events exportiert.`,
      });
      messageContainer.appendChild(successMsg);

      setTimeout(() => {
        if (messageContainer.contains(successMsg)) {
          messageContainer.removeChild(successMsg);
        }
      }, 5000);
    } catch (error) {
      console.error("Export error:", error);
      const errorMsg = h("div", {
        className: "error",
        innerText: "Fehler beim Exportieren der Daten",
      });
      messageContainer.appendChild(errorMsg);
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerText = "Daten exportieren";
    }
  });

  // Import functionality
  const importBtn = document.getElementById("import-btn") as HTMLButtonElement;
  const fileInput = h("input", {
    type: "file",
    accept: ".json",
    style: "display: none",
    id: "file-input",
  });
  document.body.appendChild(fileInput);

  importBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    try {
      importBtn.disabled = true;
      importBtn.innerText = "Importiere...";

      const text = await file.text();
      const importData: ExportBundleV1 = JSON.parse(text);

      // Validate version
      if (importData.version !== "1.0") {
        throw new Error("Unsupported export version");
      }

      // Clear existing data
      await clearAllContacts();
      await clearAllEvents();

      // Import new data
      await importContacts(importData.contacts);
      await importEvents(importData.events);

      // Update settings if provided
      if (importData.settings) {
        await putSettings(importData.settings);
        // Reload page to reflect new settings
        window.location.reload();
        return;
      }

      const successMsg = h("div", {
        className: "success",
        innerText: `Import erfolgreich! ${importData.contacts.length} Kontakte und ${importData.events.length} Events importiert.`,
      });
      messageContainer.appendChild(successMsg);

      setTimeout(() => {
        if (messageContainer.contains(successMsg)) {
          messageContainer.removeChild(successMsg);
        }
      }, 5000);
    } catch (error) {
      const errorMsg = h("div", {
        className: "error",
        innerText: `Fehler beim Importieren: ${
          error instanceof Error ? error.message : "Unbekannter Fehler"
        }`,
      });
      messageContainer.appendChild(errorMsg);
    } finally {
      importBtn.disabled = false;
      importBtn.innerText = "Daten importieren";
      // Clear file input
      target.value = "";
    }
  });

  // Database test functionality
  const dbTestBtn = document.getElementById("db-test-btn") as HTMLButtonElement;
  dbTestBtn.addEventListener("click", async () => {
    try {
      dbTestBtn.disabled = true;
      dbTestBtn.innerText = "Teste...";

      console.log("=== DATABASE TEST VIA BACKGROUND SCRIPT ===");

      const contacts = await getAllContacts();
      const events = await getAllEvents();

      console.log("Contacts via background script:", contacts);
      console.log("Events via background script:", events);

      const testMsg = h("div", {
        className: "success",
        innerText: `DB Test: ${contacts.length} Kontakte, ${events.length} Events gefunden. Siehe Konsole für Details.`,
      });
      messageContainer.appendChild(testMsg);

      setTimeout(() => {
        if (messageContainer.contains(testMsg)) {
          messageContainer.removeChild(testMsg);
        }
      }, 10000);
    } catch (error) {
      console.error("DB Test error:", error);
      const errorMsg = h("div", {
        className: "error",
        innerText: `DB Test Fehler: ${
          error instanceof Error ? error.message : "Unbekannter Fehler"
        }`,
      });
      messageContainer.appendChild(errorMsg);
    } finally {
      dbTestBtn.disabled = false;
      dbTestBtn.innerText = "DB Test";
    }
  });
}

// Main initialization
(async function init() {
  const app = document.getElementById("app")!;

  // Check if LinkedIn is available
  const isLinkedInAvailable = await checkLinkedInConnection();

  if (isLinkedInAvailable) {
    // Show the main options interface
    await showOptionsInterface(app);
  } else {
    // Show LinkedIn connection message
    showLinkedInMessage(app);
  }
})();
