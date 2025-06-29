// content.js

// Function to get all visible text from the page
function getPageText() {
  return document.body.innerText || "";
}

// Get the text and count the words
const text = getPageText();
const wordCount = text.trim().split(/\s+/).length;

// For debugging
console.log("[Smart Article Assistant] Word Count:", wordCount);

// If over 400 words, send to background for summarization
if (wordCount > 400) {
  chrome.runtime.sendMessage({
    exceed: true,
    count: wordCount,
    content: text
  });
}
