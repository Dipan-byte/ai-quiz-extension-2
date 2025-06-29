const HUGGING_FACE_API_URL = "url";
const HF_API_KEY =  "Replace with your working token"

async function getHuggingFaceSummary(text) {
  try {
    const response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: text.slice(0, 1500), 
        parameters: {
          min_length: 100,  // Increase minimum tokens
          max_length: 300   // Increase maximum tokens
        },// Trim input for speed
        options: { wait_for_model: true }
      })
    });

    const rawText = await response.text();
    let data;

    // Try parsing JSON
    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      console.error("[Hugging Face] Non-JSON Response:", rawText);
      return "Model not ready or network error (Non-JSON response).";
    }

    console.log("[Hugging Face API Response]", data);

    // Handle error object
    if (data.error) {
      return `API Error: ${data.error}`;
    }

    // Handle array response
    if (Array.isArray(data) && data[0]?.summary_text) {
      return data[0].summary_text.trim();
    }

    // Handle object response
    if (data.summary_text) {
      return data.summary_text.trim();
    }

    // Unknown structure
    return "Summary generation failed: Unexpected response structure.";

  } catch (error) {
    console.error("[Hugging Face Fetch Error]", error);
    return "Summary generation failed: Network or server error.";
  }
}

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.exceed) {
    getHuggingFaceSummary(message.content).then(summary => {
      chrome.storage.local.set({
        articleSummary: summary,
        articleWordCount: message.count,
        articleText: message.content
      });

      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.jpg",
        title: "Long Article Detected",
        message: `This article has ${message.count} words.\n\n${summary}`
      });
    });

    return true; // Keep message channel open for async
  }
});
