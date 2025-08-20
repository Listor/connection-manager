import type { ExportBundleV1 } from "../types/index";

// Message types for communication
type MessageType =
  | "GET_ALL_CONTACTS"
  | "GET_ALL_EVENTS"
  | "CLEAR_ALL_CONTACTS"
  | "CLEAR_ALL_EVENTS"
  | "IMPORT_CONTACTS"
  | "IMPORT_EVENTS"
  | "GET_SETTINGS"
  | "PUT_SETTINGS"
  | "EXPORT_DATA";

interface MessageRequest {
  type: MessageType;
  data?: any;
}

interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Handle messages from options page
chrome.runtime.onMessage.addListener(
  (request: MessageRequest, sender, sendResponse) => {
    handleMessage(request).then(sendResponse);
    return true; // Keep message channel open for async response
  }
);

async function handleMessage(
  request: MessageRequest
): Promise<MessageResponse> {
  try {
    console.log("Background script received message:", request);

    // Get any tab on LinkedIn (not just active)
    const tabs = await chrome.tabs.query({
      url: "https://*.linkedin.com/*",
    });

    if (tabs.length === 0) {
      return {
        success: false,
        error:
          "LinkedIn ist nicht geöffnet. Bitte öffnen Sie LinkedIn in einem Tab und versuchen Sie es erneut.",
      };
    }

    // Use the first LinkedIn tab found
    const linkedinTab = tabs[0];
    console.log("Found LinkedIn tab:", linkedinTab.id);

    // Send message to content script on LinkedIn
    const response = await chrome.tabs.sendMessage(linkedinTab.id!, {
      type: "INDEXEDDB_REQUEST",
      request: request,
    });

    console.log("Content script response:", response);
    return response;
  } catch (error) {
    console.error("Background script error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
