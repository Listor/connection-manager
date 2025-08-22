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

// Predefined color palette that matches the existing style
const CATEGORY_COLORS = [
  "#28a745", // Green (business)
  "#007bff", // Blue (colleague)
  "#ffc107", // Yellow/Orange (acquaintance)
  "#dc3545", // Red
  "#6f42c1", // Purple
  "#fd7e14", // Orange
  "#20c997", // Teal
  "#e83e8c", // Pink
  "#6c757d", // Gray
  "#17a2b8", // Cyan
];

// Popular emoticons for categories
const CATEGORY_EMOTICONS = [
  "💼",
  "👥",
  "🤝",
  "❤️",
  "⭐",
  "🔥",
  "💡",
  "🎯",
  "🚀",
  "💎",
  "🌟",
  "🎉",
  "🏆",
  "💪",
  "🎨",
  "📚",
  "💻",
  "🎵",
  "🏠",
  "🌍",
  "👨‍💼",
  "👩‍💼",
  "👨‍🎓",
  "👩‍🎓",
  "👨‍🔬",
  "👩‍🔬",
  "👨‍⚕️",
  "👩‍⚕️",
  "👨‍🏫",
  "👩‍🏫",
  "👨‍💻",
  "👩‍💻",
  "👨‍🎨",
  "👩‍🎨",
  "👨‍🚀",
  "👩‍🚀",
  "👨‍⚖️",
  "👩‍⚖️",
  "👨‍🌾",
  "👩‍🌾",
];

// Function to create category management section
function createCategoryManagementSection(
  settings: any,
  messageContainer: HTMLElement
) {
  const section = h("div", { className: "section" });
  const title = h("h2", { innerText: "Kategorien verwalten" });

  const helpText = h("div", {
    className: "help-text",
    innerText:
      "Erstellen Sie eigene Kategorien oder bearbeiten Sie die Standard-Kategorien. Jede Kategorie benötigt einen Namen in Deutsch und Englisch, ein Emoticon und eine Farbe.",
  });

  const categoriesContainer = h("div", { className: "categories-container" });

  // Function to render a category item
  function renderCategory(category: any, index: number) {
    const categoryItem = h("div", { className: "category-item" });

    const emoticonDisplay = h("span", {
      innerText: category.emoticon,
      style: "font-size: 24px; margin-right: 8px;",
    });

    const colorIndicator = h("div", {
      style: `width: 20px; height: 20px; background-color: ${category.color}; border-radius: 50%; margin-right: 8px; border: 2px solid #ddd;`,
    });

    const labels = h("div", { className: "category-labels" });
    const deLabel = h("div", {
      innerText: `${category.label_de} (${category.value} Punkte)`,
      style: "font-weight: bold;",
    });
    const enLabel = h("div", {
      innerText: category.label_en,
      style: "font-size: 12px; color: #666;",
    });
    labels.append(deLabel, enLabel);

    const actions = h("div", { className: "category-actions" });
    const editBtn = h("button", {
      innerText: "Bearbeiten",
      className: "edit-btn",
      style: "margin-right: 8px; padding: 4px 8px; font-size: 12px;",
    });
    const deleteBtn = h("button", {
      innerText: "Löschen",
      className: "delete-btn",
      style: "padding: 4px 8px; font-size: 12px; background-color: #dc3545;",
    });

    // Disable delete for default categories
    if (["business", "colleague", "acquaintance"].includes(category.id)) {
      deleteBtn.disabled = true;
      deleteBtn.style.opacity = "0.5";
      deleteBtn.title = "Standard-Kategorien können nicht gelöscht werden";
    }

    actions.append(editBtn, deleteBtn);

    categoryItem.append(emoticonDisplay, colorIndicator, labels, actions);

    // Edit functionality
    editBtn.addEventListener("click", () => {
      showCategoryDialog(category, index, true);
    });

    // Delete functionality
    deleteBtn.addEventListener("click", async () => {
      if (
        confirm(
          `Möchten Sie die Kategorie "${category.label_de}" wirklich löschen?`
        )
      ) {
        settings.categories.splice(index, 1);
        await putSettings(settings);
        renderCategories();

        const successMsg = h("div", {
          className: "success",
          innerText: `Kategorie "${category.label_de}" wurde gelöscht.`,
        });
        messageContainer.appendChild(successMsg);
        setTimeout(() => {
          if (messageContainer.contains(successMsg)) {
            messageContainer.removeChild(successMsg);
          }
        }, 3000);
      }
    });

    return categoryItem;
  }

  // Function to render all categories
  function renderCategories() {
    categoriesContainer.innerHTML = "";
    settings.categories.forEach((category: any, index: number) => {
      categoriesContainer.appendChild(renderCategory(category, index));
    });
  }

  // Function to show category dialog (add/edit)
  function showCategoryDialog(
    category: any = null,
    index: number = -1,
    isEdit: boolean = false
  ) {
    const dialogOverlay = document.createElement("div");
    dialogOverlay.className = "dialog-overlay";
    dialogOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const dialog = document.createElement("div");
    dialog.className = "dialog";
    dialog.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      min-width: 400px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    `;

    const title = h("h3", {
      innerText: isEdit ? "Kategorie bearbeiten" : "Neue Kategorie erstellen",
    });

    // Form fields
    const form = h("div", { className: "category-form" });

    // German label
    const deLabelGroup = h("div", { className: "form-group" });
    const deLabel = h("label", { innerText: "Name (Deutsch):" });
    const deInput = h("input", {
      type: "text",
      value: category?.label_de || "",
      placeholder: "z.B. Geschäftsbeziehung",
      style:
        "width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #ddd; border-radius: 4px;",
    });
    deLabelGroup.append(deLabel, deInput);

    // English label
    const enLabelGroup = h("div", { className: "form-group" });
    const enLabel = h("label", { innerText: "Name (English):" });
    const enInput = h("input", {
      type: "text",
      value: category?.label_en || "",
      placeholder: "e.g. Business relationship",
      style:
        "width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #ddd; border-radius: 4px;",
    });
    enLabelGroup.append(enLabel, enInput);

    // Value
    const valueGroup = h("div", { className: "form-group" });
    const valueLabel = h("label", { innerText: "Punkte (0-100):" });
    const valueInput = h("input", {
      type: "number",
      min: "0",
      max: "100",
      value: category?.value || 50,
      style:
        "width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #ddd; border-radius: 4px;",
    });
    valueGroup.append(valueLabel, valueInput);

    // Emoticon selection
    const emoticonGroup = h("div", { className: "form-group" });
    const emoticonLabel = h("label", { innerText: "Emoticon:" });
    const emoticonContainer = h("div", {
      style:
        "display: grid; grid-template-columns: repeat(10, 1fr); gap: 8px; margin-top: 8px; max-height: 120px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 8px;",
    });

    let selectedEmoticon = category?.emoticon || "💼";

    CATEGORY_EMOTICONS.forEach((emoticon) => {
      const emoticonBtn = h("button", {
        innerText: emoticon,
        style: `
          font-size: 20px;
          padding: 8px;
          border: 2px solid ${
            emoticon === selectedEmoticon ? "#007bff" : "#ddd"
          };
          background: ${emoticon === selectedEmoticon ? "#e3f2fd" : "white"};
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        `,
      });

      emoticonBtn.addEventListener("click", () => {
        // Update selection
        selectedEmoticon = emoticon;
        emoticonContainer.querySelectorAll("button").forEach((btn) => {
          btn.style.borderColor = "#ddd";
          btn.style.background = "white";
        });
        emoticonBtn.style.borderColor = "#007bff";
        emoticonBtn.style.background = "#e3f2fd";
      });

      emoticonContainer.appendChild(emoticonBtn);
    });
    emoticonGroup.append(emoticonLabel, emoticonContainer);

    // Color selection
    const colorGroup = h("div", { className: "form-group" });
    const colorLabel = h("label", { innerText: "Farbe:" });
    const colorContainer = h("div", {
      style:
        "display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 8px;",
    });

    let selectedColor = category?.color || CATEGORY_COLORS[0];

    CATEGORY_COLORS.forEach((color) => {
      const colorBtn = h("button", {
        style: `
          width: 40px;
          height: 40px;
          border: 3px solid ${color === selectedColor ? "#333" : "#ddd"};
          background-color: ${color};
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
        `,
      });

      colorBtn.addEventListener("click", () => {
        selectedColor = color;
        colorContainer.querySelectorAll("button").forEach((btn) => {
          btn.style.borderColor = "#ddd";
        });
        colorBtn.style.borderColor = "#333";
      });

      colorContainer.appendChild(colorBtn);
    });
    colorGroup.append(colorLabel, colorContainer);

    // Buttons
    const buttonGroup = h("div", {
      style:
        "display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;",
    });

    const cancelBtn = h("button", {
      innerText: "Abbrechen",
      style:
        "padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;",
    });

    const saveBtn = h("button", {
      innerText: isEdit ? "Aktualisieren" : "Erstellen",
      style:
        "padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;",
    });

    buttonGroup.append(cancelBtn, saveBtn);

    // Event handlers
    cancelBtn.addEventListener("click", () => {
      document.body.removeChild(dialogOverlay);
    });

    saveBtn.addEventListener("click", async () => {
      const labelDe = deInput.value.trim();
      const labelEn = enInput.value.trim();
      const value = parseInt(valueInput.value);

      if (!labelDe || !labelEn) {
        alert("Bitte füllen Sie alle Felder aus.");
        return;
      }

      if (value < 0 || value > 100) {
        alert("Punkte müssen zwischen 0 und 100 liegen.");
        return;
      }

      const newCategory = {
        id: category?.id || `custom_${Date.now()}`,
        label_de: labelDe,
        label_en: labelEn,
        value: value,
        color: selectedColor,
        emoticon: selectedEmoticon,
      };

      if (isEdit) {
        settings.categories[index] = newCategory;
      } else {
        settings.categories.push(newCategory);
      }

      await putSettings(settings);
      renderCategories();

      const successMsg = h("div", {
        className: "success",
        innerText: isEdit
          ? "Kategorie wurde aktualisiert."
          : "Neue Kategorie wurde erstellt.",
      });
      messageContainer.appendChild(successMsg);
      setTimeout(() => {
        if (messageContainer.contains(successMsg)) {
          messageContainer.removeChild(successMsg);
        }
      }, 3000);

      document.body.removeChild(dialogOverlay);
    });

    form.append(
      deLabelGroup,
      enLabelGroup,
      valueGroup,
      emoticonGroup,
      colorGroup
    );
    dialog.append(title, form, buttonGroup);
    dialogOverlay.appendChild(dialog);
    document.body.appendChild(dialogOverlay);
  }

  // Add new category button
  const addButton = h("button", {
    innerText: "Neue Kategorie hinzufügen",
    style:
      "margin-bottom: 16px; padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px;",
  });

  const resetButton = h("button", {
    innerText: "Standard-Kategorien wiederherstellen",
    style:
      "margin-bottom: 16px; padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;",
  });

  const buttonContainer = h("div", {
    style: "margin-bottom: 16px;",
  });

  addButton.addEventListener("click", () => {
    showCategoryDialog();
  });

  resetButton.addEventListener("click", async () => {
    if (
      confirm(
        "Möchten Sie wirklich alle Kategorien auf die Standard-Kategorien zurücksetzen? Dies kann nicht rückgängig gemacht werden."
      )
    ) {
      // Reset to default categories
      settings.categories = [
        {
          id: "business",
          label_de: "Geschäftsbeziehung",
          label_en: "Business relationship",
          value: 80,
          color: "#28a745",
          emoticon: "💼",
        },
        {
          id: "colleague",
          label_de: "Kollege",
          label_en: "Colleague",
          value: 60,
          color: "#007bff",
          emoticon: "👥",
        },
        {
          id: "acquaintance",
          label_de: "Bekanntschaft",
          label_en: "Acquaintance",
          value: 40,
          color: "#ffc107",
          emoticon: "🤝",
        },
      ];

      await putSettings(settings);
      renderCategories();

      const successMsg = h("div", {
        className: "success",
        innerText: "Kategorien wurden auf Standard-Kategorien zurückgesetzt.",
      });
      messageContainer.appendChild(successMsg);
      setTimeout(() => {
        if (messageContainer.contains(successMsg)) {
          messageContainer.removeChild(successMsg);
        }
      }, 3000);
    }
  });

  buttonContainer.append(addButton, resetButton);

  // Initial render
  renderCategories();

  section.append(title, helpText, buttonContainer, categoriesContainer);
  return section;
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

  // Create message container for feedback
  const messageContainer = h("div", { id: "message-container" });

  // Create category management section
  const categoryManagement = createCategoryManagementSection(
    s,
    messageContainer
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
    categoryManagement, // Add the new category management section
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
